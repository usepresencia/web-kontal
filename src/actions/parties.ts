'use server';

import { formDataToObject, stateFromZodError, type FormState } from '@/lib/_utils/form';
import { SUCCESS } from '@/lib/_utils/toast-messages';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { stateFromApiError } from '@/lib/api/form-state';
import { partyInputSchema, partyPageSchema, partySchema } from '@/lib/api/schemas/party';
import { presetPageSchema } from '@/lib/api/schemas/preset';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const INVALID_ID: FormState = { ok: false, message: 'Identificador inválido.' };
const isUuid = (value: string) => z.uuid().safeParse(value).success;

export const PARTIES_PATH = '/cadastros/clientes-fornecedores';

/** Cria um cliente ou fornecedor do tenant. */
export async function createPartyAction(_prev: FormState, formData: FormData): Promise<FormState> {
    const parsed = partyInputSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch('/parties', partySchema, { method: 'POST', body: parsed.data });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath(PARTIES_PATH);
    return { ok: true, ...SUCCESS.partyCreated };
}

/** Atualiza os dados de um cliente ou fornecedor. */
export async function updatePartyAction(
    partyId: string,
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    if (!isUuid(partyId)) return INVALID_ID;
    const parsed = partyInputSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch(`/parties/${partyId}`, partySchema, { method: 'PUT', body: parsed.data });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath(PARTIES_PATH);
    return { ok: true, ...SUCCESS.partyUpdated };
}

/** Exclui um cliente ou fornecedor sem títulos. */
export async function deletePartyAction(partyId: string): Promise<FormState> {
    if (!isUuid(partyId)) return INVALID_ID;
    try {
        await apiFetch(`/parties/${partyId}`, z.undefined(), { method: 'DELETE' });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath(PARTIES_PATH);
    return { ok: true };
}

/** Presets ativos como opções do formulário de cliente e fornecedor. */
export async function getPartyFormOptionsAction(): Promise<{ value: string; label: string }[]> {
    try {
        const presets = await apiFetch(
            '/presets?page=1&pageSize=100&isActive=true',
            presetPageSchema,
        );
        return presets.items.map(preset => ({ value: preset.id, label: preset.name }));
    } catch (error) {
        if (error instanceof ApiError && error.status < 500) return [];
        throw error;
    }
}

export type PartyOption = { value: string; label: string; defaultPresetId: string | null };

/** Clientes ou fornecedores ativos que podem ter títulos do tipo (a pagar: fornecedores; a receber: clientes). */
export async function getTitlePartiesAction(type: 'INCOME' | 'EXPENSE'): Promise<PartyOption[]> {
    if (type !== 'INCOME' && type !== 'EXPENSE') return [];
    const wanted = type === 'EXPENSE' ? 'SUPPLIER' : 'CLIENT';
    try {
        const page = await apiFetch('/parties?page=1&pageSize=100&isActive=true', partyPageSchema);
        return page.items
            .filter(party => party.kind === 'BOTH' || party.kind === wanted)
            .map(party => ({
                value: party.id,
                label: party.name,
                defaultPresetId: party.defaultPresetId,
            }));
    } catch (error) {
        if (error instanceof ApiError && error.status < 500) return [];
        throw error;
    }
}
