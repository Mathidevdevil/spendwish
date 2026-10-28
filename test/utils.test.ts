import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate } from "@/lib/utils";

describe("Currency & Date Utilities", () => {
  it("formats standard amounts in Indian Rupee format (lakh / crore)", () => {
    // 1 lakh = 1,00,000
    const oneLakh = formatCurrency(100000, "INR");
    expect(oneLakh).toContain("₹");
    expect(oneLakh).toMatch(/1,00,000/);

    // 1.5 crore = 1,50,00,000
    const oneCroreFiftyLakh = formatCurrency(15000000, "INR");
    expect(oneCroreFiftyLakh).toContain("₹");
    expect(oneCroreFiftyLakh).toMatch(/1,50,00,000/);

    // Small amount
    const small = formatCurrency(450, "INR");
    expect(small).toContain("₹");
    expect(small).toContain("450");
  });

  it("handles null or zero currency values gracefully", () => {
    expect(formatCurrency(0, "INR")).toContain("0");
    expect(formatCurrency(null, "INR")).toContain("0");
  });

  it("formats dates accurately", () => {
    const formatted = formatDate("2026-10-29", "short");
    expect(formatted).toBeDefined();
    expect(formatted).not.toBe("-");
  });
});
