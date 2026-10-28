import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { format, subDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { parsedTransactionOutputSchema } from "@/schemas/ai";

// Rule-based graceful fallback parser if ANTHROPIC_API_KEY is not set
function fallbackParseTransaction(text: string) {
  const lower = text.toLowerCase();
  const today = new Date();

  // Detect type
  const isIncome =
    lower.includes("salary") ||
    lower.includes("received") ||
    lower.includes("credited") ||
    lower.includes("earned") ||
    lower.includes("freelance");
  const type = isIncome ? "income" : "expense";

  // Detect amount: find numbers with optional ₹ or rs or comma
  const amountMatch =
    text.match(/(?:(?:rs\.?|inr|₹)\s*)?(\d+(?:,\d+)*(?:\.\d{1,2})?)/i) ||
    text.match(/(\d+(?:\.\d{1,2})?)/);
  let amount = 100;
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ""));
  }

  // Detect date: yesterday, today, 2 days ago
  let date = format(today, "yyyy-MM-dd");
  if (lower.includes("yesterday")) {
    date = format(subDays(today, 1), "yyyy-MM-dd");
  } else if (lower.includes("day before yesterday")) {
    date = format(subDays(today, 2), "yyyy-MM-dd");
  }

  // Detect payment method
  let payment_method: "Cash" | "UPI" | "Card" | "Bank" = "UPI";
  if (lower.includes("cash")) payment_method = "Cash";
  else if (lower.includes("card") || lower.includes("credit") || lower.includes("debit"))
    payment_method = "Card";
  else if (lower.includes("bank") || lower.includes("neft") || lower.includes("imps") || lower.includes("transfer"))
    payment_method = "Bank";
  else if (lower.includes("gpay") || lower.includes("phonepe") || lower.includes("paytm") || lower.includes("upi"))
    payment_method = "UPI";

  // Detect category & notes
  let suggestedCategory = "Other";
  if (lower.includes("dinner") || lower.includes("lunch") || lower.includes("food") || lower.includes("swiggy") || lower.includes("zomato") || lower.includes("grocery")) {
    suggestedCategory = "Food";
  } else if (lower.includes("rent")) {
    suggestedCategory = "Rent";
  } else if (lower.includes("uber") || lower.includes("ola") || lower.includes("petrol") || lower.includes("fuel") || lower.includes("auto")) {
    suggestedCategory = "Transport";
  } else if (lower.includes("amazon") || lower.includes("shopping") || lower.includes("clothes")) {
    suggestedCategory = "Shopping";
  } else if (lower.includes("electricity") || lower.includes("bill") || lower.includes("wifi") || lower.includes("recharge")) {
    suggestedCategory = "Bills";
  } else if (lower.includes("movie") || lower.includes("pvr") || lower.includes("netflix") || lower.includes("game")) {
    suggestedCategory = "Entertainment";
  } else if (lower.includes("flight") || lower.includes("hotel") || lower.includes("trip") || lower.includes("travel")) {
    suggestedCategory = "Travel";
  } else if (lower.includes("salary")) {
    suggestedCategory = "Salary";
  }

  return {
    type,
    amount: isNaN(amount) || amount <= 0 ? 100 : amount,
    date,
    payment_method,
    notes: text.trim().slice(0, 100),
    suggestedCategory,
  };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Authenticate user
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit per user (15 requests per minute)
    const rateLimit = checkRateLimit(`ai-parse:${user.id}`, 15, 60000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many AI requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const prompt = (body.prompt || "").trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Input prompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Graceful fallback if no Anthropic key configured
    if (!apiKey) {
      const parsed = fallbackParseTransaction(prompt);
      return NextResponse.json(parsed);
    }

    // Call Anthropic Claude via SDK
    const anthropic = new Anthropic({ apiKey });
    const todayStr = format(new Date(), "yyyy-MM-dd");

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 300,
      system: `You are an expert financial receipt parser. Convert the user's natural language input into a structured transaction JSON. Today's date is ${todayStr}.
Return ONLY valid JSON matching this exact structure:
{
  "type": "income" | "expense",
  "amount": number (positive),
  "date": "YYYY-MM-DD",
  "payment_method": "Cash" | "UPI" | "Card" | "Bank",
  "notes": string,
  "suggestedCategory": string ("Salary", "Freelance", "Food", "Rent", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Travel", or "Other")
}`,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const contentBlock = response.content[0];
    const text = contentBlock.type === "text" ? contentBlock.text : "";

    // Extract JSON block if wrapped in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const fallback = fallbackParseTransaction(prompt);
      return NextResponse.json(fallback);
    }

    const parsedJson = JSON.parse(jsonMatch[0]);
    // Validate with Zod
    const validated = parsedTransactionOutputSchema.safeParse(parsedJson);

    if (!validated.success) {
      const fallback = fallbackParseTransaction(prompt);
      return NextResponse.json(fallback);
    }

    return NextResponse.json(validated.data);
  } catch (error: any) {
    console.error("AI parse transaction error:", error);
    // Degrade gracefully rather than throwing 500
    return NextResponse.json(fallbackParseTransaction("unknown expense"));
  }
}
