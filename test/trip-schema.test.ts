import { describe, it, expect } from "vitest";
import { tripFormSchema, tripItemFormSchema } from "@/schemas/trip";

describe("Travel Plans Schemas", () => {
  it("validates valid trip data", () => {
    const valid = {
      name: "Goa Vacation",
      destination: "Goa, India",
      start_date: "2026-11-01",
      end_date: "2026-11-07",
      total_budget: 45000,
      status: "planned",
    };

    const res = tripFormSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("rejects trip when end date is earlier than start date", () => {
    const invalidDates = {
      name: "Goa Vacation",
      destination: "Goa, India",
      start_date: "2026-11-07",
      end_date: "2026-11-01",
      total_budget: 45000,
      status: "planned",
    };

    const res = tripFormSchema.safeParse(invalidDates);
    expect(res.success).toBe(false);
  });

  it("validates itinerary item schema", () => {
    const item = {
      trip_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      date: "2026-11-02",
      title: "Scuba diving at Grand Island",
      location: "Grand Island",
      estimated_cost: 6500,
    };

    const res = tripItemFormSchema.safeParse(item);
    expect(res.success).toBe(true);
  });
});
