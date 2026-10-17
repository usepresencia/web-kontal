import { z } from 'zod';

const amountSchema = z.string();

export const dreSummarySchema = z.object({
    start: z.string(),
    end: z.string(),
    totals: z.object({
        revenues: amountSchema,
        expenses: amountSchema,
        result: amountSchema,
    }),
});

export type DreSummary = z.infer<typeof dreSummarySchema>;
