import { z } from "zod";

export const budgetFormSchema = z.object({
  id: z.string().optional(),
  category_id: z.string().min(1, "Please select a category"),
  amount: z.coerce
    .number({ invalid_type_error: "Budget amount must be a number" })
    .positive("Budget amount must be greater than 0")
    .max(999999999.99, "Budget amount is too large"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

export type BudgetFormInput = z.infer<typeof budgetFormSchema>;
