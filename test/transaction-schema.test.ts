import { describe, it, expect } from "vitest";
import {
  transactionFormSchema,
  transactionFilterSchema,
} from "@/schemas/transaction";

describe("Transaction Validation Schemas", () => {
  it("validates valid expense transaction input", () => {
    const input = {
      type: "expense",
      amount: 450.5,
      date: "2026-10-29",
      payment_method: "UPI",
      notes: "Dinner at Taj",
    };

    const result = transactionFormSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects non-positive amounts", () => {
    const input = {
      type: "expense",
      amount: -100,
      date: "2026-10-29",
      payment_method: "Cash",
    };

    const result = transactionFormSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("validates payment methods strictly", () => {
    const invalidMethod = {
      type: "income",
      amount: 50000,
      date: "2026-10-29",
      payment_method: "Bitcoin",
    };

    const result = transactionFormSchema.safeParse(invalidMethod);
    expect(result.success).toBe(false);
  });

  it("handles optional trip_id when valid uuid is provided", () => {
    const withTrip = {
      type: "expense",
      amount: 12000,
      date: "2026-10-29",
      payment_method: "Card",
      trip_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    };

    const result = transactionFormSchema.safeParse(withTrip);
    expect(result.success).toBe(true);
  });

  it("defaults filter schema values correctly", () => {
    const filters = transactionFilterSchema.parse({});
    expect(filters.type).toBe("all");
    expect(filters.sortBy).toBe("date_desc");
    expect(filters.page).toBe(1);
    expect(filters.pageSize).toBe(15);
  });
});
