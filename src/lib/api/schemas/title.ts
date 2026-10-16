import { toApiAmount } from '@/lib/_utils/money';
import { z } from 'zod';
import { pageSchema } from './page';

export const TITLE_TYPES = ['INCOME', 'EXPENSE'] as const;
export const TITLE_STATUSES = ['OPEN', 'SETTLED', 'WRITTEN_OFF'] as const;
export const PAYMENT_METHODS = ['CASH', 'DEBIT', 'CREDIT', 'PIX'] as const;
export const SERIES_KINDS = ['INSTALLMENT', 'RECURRING'] as const;
export const SERIES_FREQUENCIES = ['WEEKLY', 'MONTHLY', 'YEARLY'] as const;

export const titleSchema = z.object({
    id: z.string(),
    presetId: z.string(),
    presetName: z.string().nullable(),
    seriesId: z.string().nullable(),
    seriesIndex: z.number().nullable(),
    type: z.enum(TITLE_TYPES),
    status: z.enum(TITLE_STATUSES),
    description: z.string(),
    amount: z.string(),
    settledAmount: z.string(),
    remainingAmount: z.string(),
    issueDate: z.string(),
    expirationDate: z.string(),
    feesPercentageMonthly: z.number(),
    createdAt: z.string(),
});

export type Title = z.infer<typeof titleSchema>;

export const titlePageSchema = pageSchema(titleSchema);

export const entrySchema = z.object({
    id: z.string(),
    titleId: z.string(),
    titleDescription: z.string().nullable().optional(),
    kind: z.enum(['PAYMENT', 'WRITE_OFF']),
    billingAccountId: z.string().nullable(),
    billingAccountName: z.string().nullable().optional(),
    principalAmount: z.string(),
    interestAmount: z.string(),
    fineAmount: z.string(),
    discountAmount: z.string(),
    totalAmount: z.string(),
    paidAt: z.string(),
    paymentMethod: z.string().nullable(),
    description: z.string().nullable(),
    createdAt: z.string(),
});

export type TitleEntry = z.infer<typeof entrySchema>;

export const entryPageSchema = pageSchema(entrySchema);

export const seriesSchema = z.object({
    id: z.string(),
    kind: z.enum(SERIES_KINDS),
    frequency: z.string().nullable(),
    totalCount: z.number().nullable(),
    baseDescription: z.string(),
    firstIssueDate: z.string(),
    firstExpirationDate: z.string(),
    createdAt: z.string(),
});

export type Series = z.infer<typeof seriesSchema>;

export const seriesPageSchema = pageSchema(seriesSchema);

export const seriesDetailSchema = seriesSchema.extend({ titles: z.array(titleSchema) });

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida');

const amount = z
    .string()
    .refine(value => toApiAmount(value) !== null, 'Valor inválido: use até 2 casas decimais')
    .transform(value => toApiAmount(value) as string);

const optionalAmount = z
    .string()
    .optional()
    .transform(value => (value ? value : undefined))
    .pipe(amount.optional());

const optionalDate = z
    .string()
    .optional()
    .transform(value => (value ? value : undefined))
    .pipe(isoDate.optional());

const fees = z
    .string()
    .optional()
    .transform(value => (value ? Number(value.replace(',', '.')) : undefined))
    .pipe(
        z
            .number('Taxa inválida')
            .min(0, 'Use um valor entre 0 e 1')
            .max(1, 'Use um valor entre 0 e 1')
            .refine(value => Math.round(value * 100) / 100 === value, 'Use até 2 casas decimais')
            .optional(),
    );

const description = z.string().trim().min(1, 'Obrigatório').max(255, 'Máximo de 255 caracteres');

const optionalCount = z
    .string()
    .optional()
    .transform(value => (value ? Number(value) : undefined))
    .pipe(
        z.number('Quantidade inválida').int('Quantidade inválida').min(1, 'Mínimo de 1').optional(),
    );

/** Cadastro de título simples, parcelado ou recorrente, como digitado no formulário. */
export const titleCreateSchema = z
    .object({
        presetId: z.uuid('Selecione o preset'),
        type: z.enum(TITLE_TYPES),
        description,
        amount,
        issueDate: optionalDate,
        expirationDate: isoDate,
        feesPercentageMonthly: fees,
        repeat: z.enum(['NONE', ...SERIES_KINDS]).default('NONE'),
        frequency: z
            .enum(SERIES_FREQUENCIES)
            .optional()
            .or(z.literal('').transform(() => undefined)),
        count: optionalCount,
        until: optionalDate,
    })
    .superRefine((value, ctx) => {
        if (value.repeat === 'NONE') return;
        if (!value.frequency && value.repeat === 'RECURRING') {
            ctx.addIssue({ code: 'custom', path: ['frequency'], message: 'Informe a frequência' });
        }
        if ((value.count === undefined) === (value.until === undefined)) {
            ctx.addIssue({
                code: 'custom',
                path: ['count'],
                message: 'Informe a quantidade ou a data final (apenas um)',
            });
        }
    });

export type TitleCreateInput = z.infer<typeof titleCreateSchema>;

export const titleUpdateSchema = z.object({
    description,
    expirationDate: isoDate,
    feesPercentageMonthly: fees,
});

export const entryCreateSchema = z.object({
    billingAccountId: z.uuid('Selecione a conta'),
    principalAmount: amount,
    interestAmount: optionalAmount,
    fineAmount: optionalAmount,
    discountAmount: optionalAmount,
    paidAt: isoDate,
    paymentMethod: z.enum(PAYMENT_METHODS),
    description: z
        .string()
        .trim()
        .max(255, 'Máximo de 255 caracteres')
        .optional()
        .transform(value => (value ? value : undefined)),
});

export const writeOffSchema = z.object({
    paidAt: optionalDate,
    description: z
        .string()
        .trim()
        .max(255, 'Máximo de 255 caracteres')
        .optional()
        .transform(value => (value ? value : undefined)),
});

export const seriesExtendSchema = z
    .object({ count: optionalCount, until: optionalDate })
    .refine(value => (value.count === undefined) !== (value.until === undefined), {
        message: 'Informe a quantidade ou a data final (apenas um)',
    });
