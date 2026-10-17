'use server';

import { formDataToObject, stateFromZodError, type FormState } from '@/lib/_utils/form';
import { apiFetch } from '@/lib/api/client';
import { stateFromApiError } from '@/lib/api/form-state';
import {
    entryCreateSchema,
    entrySchema,
    seriesDetailSchema,
    seriesExtendSchema,
    titleCreateSchema,
    titleSchema,
    titleUpdateSchema,
    writeOffSchema,
} from '@/lib/api/schemas/title';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const INVALID_ID: FormState = { ok: false, message: 'Identificador inválido.' };
const isUuid = (value: string) => z.uuid().safeParse(value).success;

const LIST_PATHS = { EXPENSE: '/operacoes/pagar', INCOME: '/operacoes/receber' } as const;

/** Cria um título; com repetição, cria a série (parcelada ou recorrente) e abre o detalhe dela. */
export async function createTitleAction(_prev: FormState, formData: FormData): Promise<FormState> {
    const parsed = titleCreateSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    const { repeat, frequency, count, until, isOpening, openingDate, settledAmount, ...title } =
        parsed.data;
    let destination: string = LIST_PATHS[title.type];
    try {
        if (repeat === 'NONE') {
            await apiFetch('/titles', titleSchema, {
                method: 'POST',
                body: isOpening ? { ...title, isOpening, openingDate, settledAmount } : title,
            });
        } else {
            const series = await apiFetch('/title-series', seriesDetailSchema, {
                method: 'POST',
                body: { ...title, kind: repeat, frequency, count, until },
            });
            destination = `/operacoes/series/${series.id}`;
        }
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath(LIST_PATHS[title.type]);
    redirect(destination);
}

/** Atualiza descrição, vencimento e juros de um título. */
export async function updateTitleAction(
    titleId: string,
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    if (!isUuid(titleId)) return INVALID_ID;
    const parsed = titleUpdateSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch(`/titles/${titleId}`, titleSchema, { method: 'PUT', body: parsed.data });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath(`/operacoes/titulos/${titleId}`);
    return { ok: true, message: 'Título atualizado.' };
}

/** Exclui um título e volta à lista do tipo dele. */
export async function deleteTitleAction(
    titleId: string,
    type: keyof typeof LIST_PATHS,
): Promise<FormState> {
    if (!isUuid(titleId) || !(type in LIST_PATHS)) return INVALID_ID;
    try {
        await apiFetch(`/titles/${titleId}`, z.undefined(), { method: 'DELETE' });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath(LIST_PATHS[type]);
    redirect(LIST_PATHS[type]);
}

/** Registra uma baixa (pagamento ou recebimento) no título. */
export async function createEntryAction(
    titleId: string,
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    if (!isUuid(titleId)) return INVALID_ID;
    const parsed = entryCreateSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch(`/titles/${titleId}/entries`, entrySchema, {
            method: 'POST',
            body: parsed.data,
        });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath(`/operacoes/titulos/${titleId}`);
    return { ok: true, message: 'Baixa registrada.' };
}

/** Dá baixa no saldo em aberto sem pagamento (perda). */
export async function writeOffTitleAction(
    titleId: string,
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    if (!isUuid(titleId)) return INVALID_ID;
    const parsed = writeOffSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch(`/titles/${titleId}/write-off`, entrySchema, {
            method: 'POST',
            body: parsed.data,
        });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath(`/operacoes/titulos/${titleId}`);
    return { ok: true, message: 'Baixa por perda registrada.' };
}

/** Exclui uma baixa do título. */
export async function deleteEntryAction(titleId: string, entryId: string): Promise<FormState> {
    if (!isUuid(titleId) || !isUuid(entryId)) return INVALID_ID;
    try {
        await apiFetch(`/entries/${entryId}`, z.undefined(), { method: 'DELETE' });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath(`/operacoes/titulos/${titleId}`);
    return { ok: true };
}

/** Estende uma série com mais ocorrências (quantidade ou data final). */
export async function extendSeriesAction(
    seriesId: string,
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    if (!isUuid(seriesId)) return INVALID_ID;
    const parsed = seriesExtendSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch(`/title-series/${seriesId}/extend`, seriesDetailSchema, {
            method: 'POST',
            body: parsed.data,
        });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath(`/operacoes/series/${seriesId}`);
    return { ok: true, message: 'Série estendida.' };
}

/** Cancela uma série, removendo as ocorrências ainda sem baixa. */
export async function cancelSeriesAction(seriesId: string): Promise<FormState> {
    if (!isUuid(seriesId)) return INVALID_ID;
    try {
        await apiFetch(`/title-series/${seriesId}`, z.unknown(), { method: 'DELETE' });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/operacoes/series');
    redirect('/operacoes/series');
}
