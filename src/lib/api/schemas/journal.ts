import { amountToCents, toApiAmount } from '@/lib/_utils/money';
import { z } from 'zod';
import { pageSchema } from './page';
import { journalEntrySchema } from './reports';

export const JOURNAL_REF_TYPES = [
    'TITLE_CREATION',
    'TITLE_CANCELLATION',
    'SETTLEMENT',
    'SETTLEMENT_REVERSAL',
    'MANUAL',
    'MANUAL_REVERSAL',
] as const;

export const journalDetailSchema = journalEntrySchema.extend({
    referenceId: z.string().nullable().optional(),
    reversedBy: z.unknown().optional(),
});

export type JournalDetail = z.infer<typeof journalDetailSchema>;

export const journalPageSchema = pageSchema(journalDetailSchema);

const optionalAmount = z
    .string()
    .optional()
    .transform(value => (value ? value : undefined))
    .pipe(
        z
            .string()
            .refine(
                value => toApiAmount(value) !== null,
                'Valor inválido: use até 2 casas decimais',
            )
            .transform(value => toApiAmount(value) as string)
            .optional(),
    );

const lineSchema = z
    .object({
        accountId: z.uuid('Selecione a conta'),
        debit: optionalAmount,
        credit: optionalAmount,
        memo: z
            .string()
            .trim()
            .max(255, 'Máximo de 255 caracteres')
            .optional()
            .transform(value => (value ? value : undefined)),
    })
    .refine(
        line => (line.debit !== undefined) !== (line.credit !== undefined),
        'Informe débito ou crédito, não os dois',
    );

type Line = z.infer<typeof lineSchema>;

const positive = (amount: string | undefined) =>
    amount === undefined || amountToCents(amount) > BigInt(0);

/** Lançamento manual: as linhas chegam em JSON no campo oculto `linesJson`. */
export const manualEntrySchema = z
    .object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
        description: z.string().trim().min(1, 'Obrigatório').max(255, 'Máximo de 255 caracteres'),
        linesJson: z.string().transform((value, ctx) => {
            try {
                return JSON.parse(value) as unknown;
            } catch {
                ctx.addIssue({ code: 'custom', message: 'Linhas inválidas' });
                return z.NEVER;
            }
        }),
    })
    .transform((value, ctx) => {
        const lines = z
            .array(lineSchema)
            .min(2, 'Informe ao menos duas linhas')
            .max(50, 'No máximo 50 linhas')
            .safeParse(value.linesJson);
        if (!lines.success) {
            lines.error.issues.forEach(issue =>
                ctx.addIssue({
                    code: 'custom',
                    path: ['lines', ...issue.path],
                    message: issue.message,
                }),
            );
            return z.NEVER;
        }
        const data = lines.data;
        if (!data.every(line => positive(line.debit) && positive(line.credit))) {
            ctx.addIssue({
                code: 'custom',
                path: ['lines'],
                message: 'Valores devem ser maiores que zero',
            });
            return z.NEVER;
        }
        const sum = (pick: (line: Line) => string | undefined) =>
            data.reduce(
                (total, line) =>
                    total + (pick(line) ? amountToCents(pick(line) as string) : BigInt(0)),
                BigInt(0),
            );
        if (sum(line => line.debit) !== sum(line => line.credit)) {
            ctx.addIssue({
                code: 'custom',
                path: ['lines'],
                message: 'Débitos e créditos devem ser iguais',
            });
            return z.NEVER;
        }
        return { date: value.date, description: value.description, lines: data };
    });

export const reverseSchema = z.object({
    description: z
        .string()
        .trim()
        .max(255, 'Máximo de 255 caracteres')
        .optional()
        .transform(value => (value ? value : undefined)),
});
