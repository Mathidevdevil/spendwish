import { z } from "zod";

export const tripFormSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(2, "Trip name must be at least 2 characters"),
    destination: z.string().min(2, "Destination is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    total_budget: z.coerce
      .number({ invalid_type_error: "Budget must be a number" })
      .min(0, "Budget cannot be negative")
      .max(999999999.99, "Budget is too large"),
    status: z.enum(["planned", "ongoing", "completed"]).default("planned"),
    notes: z
      .string()
      .max(1000, "Notes cannot exceed 1000 characters")
      .optional()
      .nullable()
      .transform((v) => (!v ? null : v)),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    {
      message: "End date cannot be before start date",
      path: ["end_date"],
    }
  );

export const tripItemFormSchema = z.object({
  id: z.string().optional(),
  trip_id: z.string().min(1, "Trip ID is required"),
  date: z.string().min(1, "Date is required"),
  title: z.string().min(2, "Activity / Item title is required"),
  location: z
    .string()
    .max(200)
    .optional()
    .nullable()
    .transform((v) => (!v ? null : v)),
  estimated_cost: z.coerce
    .number({ invalid_type_error: "Estimated cost must be a number" })
    .min(0, "Estimated cost cannot be negative"),
  notes: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .transform((v) => (!v ? null : v)),
});

export type TripFormInput = z.infer<typeof tripFormSchema>;
export type TripItemFormInput = z.infer<typeof tripItemFormSchema>;
