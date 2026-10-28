import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { monthlyInsightsOutputSchema } from "@/schemas/ai";

// Graceful algorithmic fallback if ANTHROPIC_API_KEY is missing
function fallbackInsights(
  totalIncome: number,
  totalExpense: number,
  savingsRate: number,
  topCategoryName?: string
) {
  const netSavings = totalIncome - totalExpense;
  const isHealthy = savingsRate >= 20;

  let summary = "";
  if (totalIncome === 0 && totalExpense === 0) {
    summary =
      "No financial activities have been logged for this period yet. Start recording incomes and expenses to unlock personalized insights.";
  } else if (isHealthy) {
    summary = `Healthy month! You saved ${savingsRate.toFixed(
      1
    )}% of your income (${
      netSavings >= 0 ? `+₹${netSavings.toLocaleString("en-IN")}` : ""
    }), exceeding the recommended 20% benchmark.`;
  } else if (netSavings >= 0) {
    summary = `You achieved positive net savings of ₹${netSavings.toLocaleString(
      "en-IN"
    )} with a ${savingsRate.toFixed(
      1
    )}% savings rate. There is good opportunity to curb discretionary spends.`;
  } else {
    summary = `You operated in a deficit of ₹${Math.abs(
      netSavings
    ).toLocaleString(
      "en-IN"
    )} this month. Outflows surpassed income, largely driven by ${
      topCategoryName || "major expenses"
    }.`;
  }

  const suggestions = [
    topCategoryName
      ? `Review your ${topCategoryName} spending; setting a strict 15% lower category budget next month could recover ₹${Math.round(
          totalExpense * 0.15
        ).toLocaleString("en-IN")}.`
      : "Establish weekly spending checkpoints to keep non-essential purchases aligned with monthly targets.",
    savingsRate < 20
      ? "Automate a 15-20% savings transfer to a separate high-interest account on the day your salary is credited."
      : "Invest your monthly surplus into a diversified SIP or liquid fund to beat inflation and compound returns.",
    "Tag upcoming weekend getaways or vacations to Spendwise Travel Plans so trip expenses do not derail daily budgeting.",
  ];

  return {
    summary,
    suggestions,
  };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit per user (10 requests per minute)
    const rateLimit = checkRateLimit(`ai-insights:${user.id}`, 10, 60000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many AI insight requests. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const month = Number(body.month) || new Date().getMonth() + 1;
    const year = Number(body.year) || new Date().getFullYear();

    // Fetch aggregates ONLY from database RPC or tables
    // (Never send raw notes or personal identifiers to AI!)
    const { data: summaryData } = await (supabase as any).rpc(
      "get_monthly_summary",
      {
        p_user_id: user.id,
        p_month: month,
        p_year: year,
      }
    );

    const { data: categoryData } = await (supabase as any).rpc(
      "get_category_breakdown",
      {
        p_user_id: user.id,
        p_month: month,
        p_year: year,
      }
    );

    const summary = summaryData?.[0] || {
      total_income: 0,
      total_expense: 0,
      net_savings: 0,
      savings_rate: 0,
    };

    const categories = (categoryData || []).slice(0, 3);
    const topCat = categories[0]?.category_name;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      const fallback = fallbackInsights(
        Number(summary.total_income),
        Number(summary.total_expense),
        Number(summary.savings_rate),
        topCat
      );
      return NextResponse.json(fallback);
    }

    // Send ONLY aggregated numbers to Anthropic SDK
    const anthropic = new Anthropic({ apiKey });
    const prompt = `Analyze these aggregated financial numbers for Month ${month}, ${year} in Indian Rupees (INR ₹):
- Total Income: ₹${summary.total_income}
- Total Expense: ₹${summary.total_expense}
- Net Savings: ₹${summary.net_savings}
- Savings Rate: ${summary.savings_rate}%
- Top Spending Categories: ${categories
      .map((c: any) => `${c.category_name}: ₹${c.total_amount} (${c.percentage}%)`)
      .join(", ") || "None"}

Generate:
1. A concise, encouraging 2-sentence summary of financial performance.
2. Exactly 3 realistic, actionable financial suggestions.

Return ONLY JSON:
{
  "summary": "...",
  "suggestions": [
    "suggestion 1",
    "suggestion 2",
    "suggestion 3"
  ]
}`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 400,
      system:
        "You are an encouraging, certified financial planner. Analyze aggregated financial metrics and provide structured advice.",
      messages: [{ role: "user", content: prompt }],
    });

    const contentBlock = response.content[0];
    const text = contentBlock.type === "text" ? contentBlock.text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      const fallback = fallbackInsights(
        Number(summary.total_income),
        Number(summary.total_expense),
        Number(summary.savings_rate),
        topCat
      );
      return NextResponse.json(fallback);
    }

    const parsedJson = JSON.parse(jsonMatch[0]);
    const validated = monthlyInsightsOutputSchema.safeParse(parsedJson);

    if (!validated.success) {
      const fallback = fallbackInsights(
        Number(summary.total_income),
        Number(summary.total_expense),
        Number(summary.savings_rate),
        topCat
      );
      return NextResponse.json(fallback);
    }

    return NextResponse.json(validated.data);
  } catch (error: any) {
    console.error("AI monthly insights error:", error);
    return NextResponse.json(fallbackInsights(0, 0, 0));
  }
}
