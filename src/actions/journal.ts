'use server';

import { formDataToObject, stateFromZodError, type FormState } from '@/lib/_utils/form';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { stateFromApiError } from '@/lib/api/form-state';
import { accountPageSchema } from '@/lib/api/schemas/billing';
import {
    journalDetailSchema,
    manualEntrySchema,
    reverseSchema,
    type JournalDetail,
} from '@/lib/api/schemas/journal';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

/** Cria um lançamento manual de partida dobrada (débitos iguais aos créditos). */
export async function createManualEntryAction(
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    const parsed = manualEntrySchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch('/journal-entries', journalDetailSchema, {
            method: 'POST',
            body: parsed.data,
        });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/contabilidade/lancamentos');
    return { ok: true, message: 'Lançamento registrado.' };
}

/** Estorna um lançamento manual, gerando o lançamento inverso. */
export async function reverseEntryAction(
    entryId: string,
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    if (!z.uuid().safeParse(entryId).success)
        return { ok: false, message: 'Identificador inválido.' };
    const parsed = reverseSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch(`/journal-entries/${entryId}/reverse`, journalDetailSchema, {
            method: 'POST',
            body: parsed.data,
        });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/contabilidade/lancamentos');
    return { ok: true, message: 'Lançamento estornado.' };
}

/** Busca um lançamento contábil com as linhas, para os detalhes; `null` se não existir. */
export async function getJournalEntryAction(entryId: string): Promise<JournalDetail | null> {
    if (!z.uuid().safeParse(entryId).success) return null;
    try {
        return await apiFetch(`/journal-entries/${entryId}`, journalDetailSchema);
    } catch (error) {
        if (error instanceof ApiError && error.status < 500) return null;
        throw error;
    }
}

/** Contas analíticas ativas do plano, para escolher nas linhas de um lançamento manual. */
export async function getJournalAccountOptionsAction(): Promise<
    { value: string; label: string }[]
> {
    try {
        const accounts = await apiFetch('/billing-accounts?page=1&pageSize=100', accountPageSchema);
        return accounts.items
            .filter(account => account.accountType === 'ANALYTIC' && account.isActive)
            .map(account => ({ value: account.id, label: `${account.code} ${account.name}` }));
    } catch (error) {
        if (error instanceof ApiError && error.status < 500) return [];
        throw error;
    }
}
