import { PRESET_ROLES, type PresetRole } from '@/lib/_utils/preset-roles';
import { z } from 'zod';
import { pageSchema } from './page';

const roleAccount = z.object({ id: z.string(), name: z.string().nullable() }).nullable();

export const presetSchema = z.object({
    id: z.string(),
    billingPlanId: z.string(),
    billingPlanName: z.string().nullable().optional(),
    name: z.string(),
    description: z.string().nullable(),
    isActive: z.boolean(),
    // O papel openingBalance só existe nas versões da API com título de implantação.
    accounts: z.object(
        Object.fromEntries(
            PRESET_ROLES.map(role => [
                role,
                role === 'openingBalance' ? roleAccount.optional() : roleAccount,
            ]),
        ) as Record<PresetRole, typeof roleAccount>,
    ),
    createdAt: z.string(),
});

export type Preset = z.infer<typeof presetSchema>;

export const presetPageSchema = pageSchema(presetSchema);

const emptyToNull = z
    .string()
    .optional()
    .transform(value => (value ? value : null));

const required = z.uuid('Selecione a conta');
const optional = emptyToNull.pipe(z.uuid().nullable());

const accountsInput = z.object({
    receivable: required,
    payable: required,
    revenue: optional,
    expense: optional,
    interestIncome: optional,
    discountGranted: optional,
    badDebt: optional,
    interestExpense: optional,
    discountObtained: optional,
    debtForgiveness: optional,
    openingBalance: optional,
});

const base = z.object({
    name: z.string().trim().min(1, 'Obrigatório').max(255, 'Máximo de 255 caracteres'),
    description: z
        .string()
        .trim()
        .max(255, 'Máximo de 255 caracteres')
        .optional()
        .transform(value => (value ? value : undefined)),
    isActive: z
        .enum(['true', 'false'])
        .optional()
        .transform(value => value !== 'false'),
    accounts: accountsInput,
});

export const presetCreateSchema = base.extend({ billingPlanId: z.uuid() });
export const presetUpdateSchema = base;
