import { z } from 'zod';

/** Fechamento de mês: `month` no formato YYYY-MM e a conta de lucros acumulados (opcional). */
export const closePeriodSchema = z.object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use o mês no formato AAAA-MM'),
    retainedEarningsAccountId: z
        .string()
        .optional()
        .transform(value => (value ? value : undefined))
        .pipe(z.uuid('Conta inválida').optional()),
});
