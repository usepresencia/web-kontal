import { z } from 'zod';
import { pageSchema } from './page';

const addressSchema = z.object({
    zipCode: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string().nullable(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
});

export const companySchema = z.object({
    id: z.string(),
    name: z.string(),
    socialReason: z.string(),
    cnpj: z.string(),
    openingDate: z.string(),
    cnae: z.string(),
    taxRegime: z.string(),
    email: z.string(),
    phone: z.string(),
    logoUrl: z.string().nullable(),
    isActive: z.boolean(),
    address: addressSchema,
    createdAt: z.string(),
});

export type Company = z.infer<typeof companySchema>;

export const companyPageSchema = pageSchema(companySchema);

const text = (max = 255) =>
    z.string().trim().min(1, 'Obrigatório').max(max, `Máximo de ${max} caracteres`);

/** Corpo de criação e edição da empresa, igual ao validado pela api-kontal. */
export const companyInputSchema = z.object({
    name: text(),
    socialReason: text(),
    cnpj: text(20),
    openingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
    cnae: text(),
    taxRegime: text(),
    email: z.email('E-mail inválido').max(255),
    phone: text(20),
    address: z.object({
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
    }),
});

export const signedLogoUploadSchema = z.object({
    cloudName: z.string(),
    apiKey: z.string(),
    timestamp: z.number(),
    publicId: z.string(),
    allowedFormats: z.string(),
    overwrite: z.boolean(),
    invalidate: z.boolean(),
    signature: z.string(),
    uploadUrl: z.url(),
});

export type SignedLogoUpload = z.infer<typeof signedLogoUploadSchema>;
