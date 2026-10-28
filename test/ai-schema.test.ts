import { describe, it, expect } from "vitest";
import {
  parsedTransactionOutputSchema,
  monthlyInsightsOutputSchema,
} from "@/schemas/ai";
import { checkRateLimit } from "@/lib/rate-limit";

describe("AI Schemas & Rate Limiting", () => {
  it("validates parsed AI transaction output", () => {
    const valid = {
      type: "expense",
      amount: 450,
      date: "2026-10-28",
      payment_method: "UPI",
      notes: "dinner at Swiggy",
      suggestedCategory: "Food",
    };

    const res = parsedTransactionOutputSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("validates monthly AI insights output schema", () => {
    const valid = {
      summary: "You achieved solid savings of 32% this month.",
      suggestions: [
        "Cap food expenses to 15,000",
        "Automate mutual fund SIP",
        "Tag Goa trip expenses",
      ],
    };

    const res = monthlyInsightsOutputSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejects insights with fewer or more than 3 suggestions", () => {
    const invalid = {
      summary: "Short summary",
      suggestions: ["only one suggestion"],
    };

    const res = monthlyInsightsOutputSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it("rate limits requests exceeding the threshold", () => {
    const testKey = "test-user-" + Date.now();
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(testKey, 5, 10000);
      expect(res.success).toBe(true);
    }

    // 6th call should be blocked
    const blocked = checkRateLimit(testKey, 5, 10000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});
