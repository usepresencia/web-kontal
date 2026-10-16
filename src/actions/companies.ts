'use server';

import { formDataToObject, stateFromZodError, type FormState } from '@/lib/_utils/form';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import {
    companyInputSchema,
    companySchema,
    signedLogoUploadSchema,
    type SignedLogoUpload,
} from '@/lib/api/schemas/company';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const FALLBACK_MESSAGE = 'Não foi possível concluir a operação. Tente novamente.';

/** Converte um erro da API em estado de formulário; erros inesperados sobem. */
function stateFromApiError(error: unknown): FormState {
    if (error instanceof ApiError && error.status < 500) {
        return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
    }
    throw error;
}

/** Cria uma empresa (apenas administrador da plataforma; a API confirma). */
export async function createCompanyAction(
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    const parsed = companyInputSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch('/companies', companySchema, {
            method: 'POST',
            body: parsed.data,
            tenant: false,
        });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/empresas');
    redirect('/empresas');
}

/** Atualiza os dados da empresa ativa. */
export async function updateCompanyAction(
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    const parsed = companyInputSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch('/company', companySchema, { method: 'PUT', body: parsed.data });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/empresas');
    return { ok: true, message: 'Empresa atualizada.' };
}

/** Desativa uma empresa (apenas administrador da plataforma; a API confirma). */
export async function deactivateCompanyAction(companyId: string): Promise<FormState> {
    if (!z.uuid().safeParse(companyId).success) return { ok: false, message: FALLBACK_MESSAGE };

    try {
        await apiFetch('/companies/' + companyId, z.undefined(), {
            method: 'DELETE',
            tenant: false,
        });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/empresas');
    return { ok: true };
}

/** Pede à api-kontal a assinatura para o envio direto do logo ao Cloudinary. */
export async function signLogoUploadAction(): Promise<SignedLogoUpload | null> {
    try {
        return await apiFetch('/company/logo/signature', signedLogoUploadSchema, {
            method: 'POST',
        });
    } catch (error) {
        if (error instanceof ApiError && error.status < 500) return null;
        throw error;
    }
}

/** Grava a URL do logo enviado ao Cloudinary; a API confere que ela pertence à empresa. */
export async function saveLogoAction(url: string): Promise<FormState> {
    const parsed = z.url().max(2048).safeParse(url);
    if (!parsed.success) return { ok: false, message: 'URL do logo inválida.' };

    try {
        await apiFetch('/company/logo', companySchema, {
            method: 'PUT',
            body: { url: parsed.data },
        });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/empresas/atual');
    return { ok: true };
}

/** Remove o logo da empresa ativa. */
export async function removeLogoAction(): Promise<FormState> {
    try {
        await apiFetch('/company/logo', z.undefined(), { method: 'DELETE' });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/empresas/atual');
    return { ok: true };
}
