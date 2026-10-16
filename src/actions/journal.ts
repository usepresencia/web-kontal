'use server';

import { formDataToObject, stateFromZodError, type FormState } from '@/lib/_utils/form';
import { apiFetch } from '@/lib/api/client';
import { stateFromApiError } from '@/lib/api/form-state';
import { journalDetailSchema, manualEntrySchema, reverseSchema } from '@/lib/api/schemas/journal';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

/** Cria um lançamento manual de partida dobrada (débitos iguais aos créditos). */
export async function createManualEntryAction(
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    const parsed = manualEntrySchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    let entryId: string;
    try {
        entryId = (
            await apiFetch('/journal-entries', journalDetailSchema, {
                method: 'POST',
                body: parsed.data,
            })
        ).id;
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/contabilidade/lancamentos');
    redirect(`/contabilidade/lancamentos/${entryId}`);
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

    let reversalId: string;
    try {
        reversalId = (
            await apiFetch(`/journal-entries/${entryId}/reverse`, journalDetailSchema, {
                method: 'POST',
                body: parsed.data,
            })
        ).id;
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/contabilidade/lancamentos');
    redirect(`/contabilidade/lancamentos/${reversalId}`);
}
