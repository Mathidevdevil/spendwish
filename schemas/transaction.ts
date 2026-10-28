import { z } from "zod";

export const transactionFormSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["income", "expense"], {
    required_error: "Transaction type is required",
  }),
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a valid number" })
    .positive("Amount must be greater than 0")
    .max(999999999.99, "Amount is too large"),
  category_id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (!val || val === "none" || val === "" ? null : val)),
  date: z.string().min(1, "Date is required"),
  payment_method: z.enum(["Cash", "UPI", "Card", "Bank"], {
    required_error: "Payment method is required",
  }),
  notes: z
    .string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .nullable()
    .transform((val) => (!val ? null : val)),
  trip_id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (!val || val === "none" || val === "" ? null : val)),
});

export const transactionFilterSchema = z.object({
  type: z.enum(["all", "income", "expense"]).default("all"),
  categoryId: z.string().optional(),
  tripId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(["date_desc", "date_asc", "amount_desc", "amount_asc"]).default("date_desc"),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(5).max(100).default(15),
});

export type TransactionFormInput = z.infer<typeof transactionFormSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
