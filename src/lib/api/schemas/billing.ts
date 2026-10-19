import { z } from 'zod';
import { pageSchema } from './page';

export const planSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    createdAt: z.string(),
});

export type BillingPlan = z.infer<typeof planSchema>;

export const planPageSchema = pageSchema(planSchema);

export const planInputSchema = z.object({
    name: z.string().trim().min(1, 'Obrigatório').max(255, 'Máximo de 255 caracteres'),
    description: z
        .string()
        .trim()
        .max(255, 'Máximo de 255 caracteres')
        .optional()
        .transform(value => (value ? value : undefined)),
});

export const accountSchema = z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    level: z.number(),
    accountType: z.enum(['ANALYTIC', 'SYNTHETIC']),
    nature: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
    dreCategory: z.string().nullable(),
    balanceCategory: z.string().nullable(),
    costBehavior: z.string().nullable().optional(),
    isActive: z.boolean(),
    billingPlanId: z.string(),
    billingPlanName: z.string().nullable().optional(),
    parentId: z.string().nullable(),
    parentName: z.string().nullable().optional(),
    createdAt: z.string(),
});

export type BillingAccount = z.infer<typeof accountSchema>;

export const accountsSchema = z.array(accountSchema);

const optionalText = z
    .string()
    .optional()
    .transform(value => (value ? value : undefined));

const optionalNullable = z
    .string()
    .optional()
    .transform(value => (value ? value : null));

const accountName = z.string().trim().min(1, 'Obrigatório').max(255, 'Máximo de 255 caracteres');

export const accountCreateSchema = z.object({
    billingPlanId: z.uuid(),
    parentId: optionalNullable,
    name: accountName,
    accountType: z.enum(['ANALYTIC', 'SYNTHETIC']),
    nature: optionalText.pipe(
        z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']).optional(),
    ),
    dreCategory: optionalNullable,
    balanceCategory: optionalNullable,
    costBehavior: optionalNullable,
});

export const accountUpdateSchema = z.object({
    name: accountName,
    parentId: optionalNullable,
    accountType: z.enum(['ANALYTIC', 'SYNTHETIC']),
    dreCategory: optionalNullable,
    balanceCategory: optionalNullable,
    costBehavior: optionalNullable,
    isActive: z.enum(['true', 'false']).transform(value => value === 'true'),
});

export const accountPageSchema = pageSchema(accountSchema);
