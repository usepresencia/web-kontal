'use server';

import { formDataToObject, stateFromZodError, type FormState } from '@/lib/_utils/form';
import { SUCCESS } from '@/lib/_utils/toast-messages';
import { apiFetch } from '@/lib/api/client';
import { stateFromApiError } from '@/lib/api/form-state';
import { presetCreateSchema, presetSchema, presetUpdateSchema } from '@/lib/api/schemas/preset';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const INVALID_ID: FormState = { ok: false, message: 'Identificador inválido.' };
const isUuid = (value: string) => z.uuid().safeParse(value).success;

/** Cria um preset de lançamento. */
export async function createPresetAction(_prev: FormState, formData: FormData): Promise<FormState> {
    const parsed = presetCreateSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch('/presets', presetSchema, { method: 'POST', body: parsed.data });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/configuracoes/presets');
    return { ok: true, ...SUCCESS.presetCreated };
}

/** Atualiza um preset; o plano dele não muda. */
export async function updatePresetAction(
    presetId: string,
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    if (!isUuid(presetId)) return INVALID_ID;
    const parsed = presetUpdateSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch(`/presets/${presetId}`, presetSchema, { method: 'PUT', body: parsed.data });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/configuracoes/presets');
    return { ok: true, ...SUCCESS.presetUpdated };
}

/** Exclui um preset. */
export async function deletePresetAction(presetId: string): Promise<FormState> {
    if (!isUuid(presetId)) return INVALID_ID;
    try {
        await apiFetch(`/presets/${presetId}`, z.undefined(), { method: 'DELETE' });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/configuracoes/presets');
    return { ok: true };
}
