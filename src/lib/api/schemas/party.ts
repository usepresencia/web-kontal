import { z } from 'zod';
import { pageSchema } from './page';

export const PARTY_KINDS = ['CLIENT', 'SUPPLIER', 'BOTH'] as const;

export type PartyKind = (typeof PARTY_KINDS)[number];

export const PARTY_KIND_LABELS = {
    CLIENT: 'Cliente',
    SUPPLIER: 'Fornecedor',
    BOTH: 'Cliente e fornecedor',
} as const;

const addressSchema = z.object({
    zipCode: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string().nullable(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
});

export const partySchema = z.object({
    id: z.string(),
    kind: z.enum(PARTY_KINDS),
    name: z.string(),
    socialReason: z.string(),
    document: z.string(),
    email: z.string(),
    phone: z.string(),
    address: addressSchema.nullable(),
    isActive: z.boolean(),
    defaultPresetId: z.string().nullable(),
    defaultPresetName: z.string().nullable(),
    createdAt: z.string(),
});

export type Party = z.infer<typeof partySchema>;

export const partyPageSchema = pageSchema(partySchema);

const text = (max = 255) =>
    z.string().trim().min(1, 'Obrigatório').max(max, `Máximo de ${max} caracteres`);

const optionalText = (max: number) =>
    z
        .string()
        .trim()
        .max(max, `Máximo de ${max} caracteres`)
        .optional()
        .transform(value => value ?? '');

const emptyToNull = z
    .string()
    .optional()
    .transform(value => (value ? value : null));

const addressInput = z.object({
    zipCode: text(10),
    street: text(),
    number: text(50),
    complement: z
        .string()
        .trim()
        .max(255)
        .optional()
        .transform(value => (value ? value : null)),
    neighborhood: text(),
    city: text(),
    state: z.string().trim().length(2, 'Use a sigla da UF'),
});

/** Endereço opcional: sem CEP e sem rua, o endereço inteiro é ignorado. */
const optionalAddress = z
    .object({
        zipCode: z.string().optional(),
        street: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
    })
    .optional()
    .transform((value, ctx) => {
        const filled = Object.values(value ?? {}).some(item => item && item.trim() !== '');
        if (!filled) return null;
        const parsed = addressInput.safeParse(value);
        if (!parsed.success) {
            parsed.error.issues.forEach(issue =>
                ctx.addIssue({ code: 'custom', path: issue.path, message: issue.message }),
            );
            return z.NEVER;
        }
        return parsed.data;
    });

/** Corpo de criação e edição da contraparte, como digitado no formulário. */
export const partyInputSchema = z.object({
    kind: z.enum(PARTY_KINDS, 'Selecione o tipo'),
    name: text(),
    socialReason: text(),
    document: text(20),
    email: optionalText(255),
    phone: optionalText(20),
    address: optionalAddress,
    defaultPresetId: emptyToNull.pipe(z.uuid('Preset inválido').nullable()),
    isActive: z
        .enum(['true', 'false'])
        .optional()
        .transform(value => value !== 'false'),
});

export type PartyInput = z.infer<typeof partyInputSchema>;
