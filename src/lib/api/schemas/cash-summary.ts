import { z } from 'zod';

const amountSchema = z.string();

export const cashSummarySchema = z.object({
    start: z.string(),
    end: z.string(),
    totals: z.object({
        inflows: amountSchema,
        outflows: amountSchema,
        net: amountSchema,
    }),
});

export type CashSummary = z.infer<typeof cashSummarySchema>;
