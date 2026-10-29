import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { monthlyInsightsOutputSchema } from "@/schemas/ai";
import { demoStore, DEMO_USER_ID } from "@/lib/demo-data";

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
    const authData = await getCurrentUser();
    const user = authData?.user;

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

    let body: any = {};
    try {
      body = await request.json();
    } catch {}
    const month = Number(body?.month) || new Date().getMonth() + 1;
    const year = Number(body?.year) || new Date().getFullYear();

    // Check if demo user
    let summary: any;
    let categories: any[] = [];

    // If client supplied verified aggregate metrics from dashboard cards, prioritize them for exact consistency
    const clientIncome = Number(body?.total_income);
    const clientExpense = Number(body?.total_expense);
    const hasClientNumbers = !isNaN(clientIncome) && !isNaN(clientExpense);

    if (hasClientNumbers) {
      const clientNet = Number(body?.net_savings);
      const clientRate = Number(body?.savings_rate);
      summary = {
        total_income: clientIncome,
        total_expense: clientExpense,
        net_savings: !isNaN(clientNet) ? clientNet : clientIncome - clientExpense,
        savings_rate: !isNaN(clientRate)
          ? clientRate
          : clientIncome > 0
          ? Math.max(0, ((clientIncome - clientExpense) / clientIncome) * 100)
          : 0,
      };
    } else if (user.id === DEMO_USER_ID) {
      const demoSum = demoStore.getDashboardSummary(month, year);
      summary = demoSum;
      const demoCats = demoStore.getCategoryBreakdown(month, year);
      categories = demoCats.slice(0, 3);
    } else {
      const supabase = await createClient();
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

      summary = summaryData?.[0] || {
        total_income: 0,
        total_expense: 0,
        net_savings: 0,
        savings_rate: 0,
      };

      categories = (categoryData || []).slice(0, 3);
    }

    // Zero-data guard: Never output fictional numbers when user has no transactions
    if (Number(summary.total_income) === 0 && Number(summary.total_expense) === 0) {
      return NextResponse.json({
        summary:
          "No transactions have been recorded for this month yet. Start tracking your income and expenses to unlock AI-powered financial advice and savings analysis.",
        suggestions: [
          "Record your monthly income or salary to establish your baseline cash flow.",
          "Track daily expenses with payment methods (Cash, UPI, Card) to see category distributions.",
          "Set up monthly budgets for key categories like Food and Rent to monitor limit thresholds.",
        ],
      });
    }
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
