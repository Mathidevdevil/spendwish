import { z } from "zod";

export const parsedTransactionOutputSchema = z.object({
  type: z.enum(["income", "expense"]).default("expense"),
  amount: z.number().positive("Amount must be greater than zero"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  payment_method: z.enum(["Cash", "UPI", "Card", "Bank"]).default("UPI"),
  notes: z.string().max(200).default(""),
  suggestedCategory: z.string().default("Other"),
});

export const monthlyInsightsOutputSchema = z.object({
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  suggestions: z
    .array(z.string().min(5))
    .length(3, "Must provide exactly 3 practical suggestions"),
});

export type ParsedTransactionOutput = z.infer<
  typeof parsedTransactionOutputSchema
>;
export type MonthlyInsightsOutput = z.infer<
  typeof monthlyInsightsOutputSchema
>;
