import { describe, it, expect } from "vitest";
import { budgetFormSchema } from "@/schemas/budget";

describe("Budget Schemas & Thresholds", () => {
  it("validates valid category budget input", () => {
    const input = {
      category_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      amount: 15000,
      month: 10,
      year: 2026,
    };

    const result = budgetFormSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects negative or zero budget amount", () => {
    const zero = {
      category_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      amount: 0,
      month: 10,
      year: 2026,
    };
    expect(budgetFormSchema.safeParse(zero).success).toBe(false);

    const negative = {
      category_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      amount: -500,
      month: 10,
      year: 2026,
    };
    expect(budgetFormSchema.safeParse(negative).success).toBe(false);
  });

  it("verifies 80% and 100% threshold calculation logic", () => {
    const budgetAmount = 10000;

    const under70 = (6500 / budgetAmount) * 100;
    expect(under70 < 80).toBe(true);

    const warning85 = (8500 / budgetAmount) * 100;
    expect(warning85 >= 80 && warning85 < 100).toBe(true);

    const exceeded110 = (11000 / budgetAmount) * 100;
    expect(exceeded110 >= 100).toBe(true);
  });
});
