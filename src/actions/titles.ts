'use server';

import { formDataToObject, stateFromZodError, type FormState } from '@/lib/_utils/form';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { stateFromApiError } from '@/lib/api/form-state';
import { accountPageSchema } from '@/lib/api/schemas/billing';
import { presetPageSchema, presetSchema } from '@/lib/api/schemas/preset';
import {
    entryCreateSchema,
    entryPageSchema,
    entrySchema,
    seriesDetailSchema,
    seriesExtendSchema,
    titleCreateSchema,
    titleSchema,
    titleUpdateSchema,
    writeOffSchema,
    type TitleEntry,
} from '@/lib/api/schemas/title';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const INVALID_ID: FormState = { ok: false, message: 'Identificador inválido.' };
const isUuid = (value: string) => z.uuid().safeParse(value).success;

const HOME_PATH = '/home';

const LIST_PATHS = { EXPENSE: '/operacoes/pagar', INCOME: '/operacoes/receber' } as const;

/** Cria um título; com repetição, cria a série (parcelada ou recorrente) e abre o detalhe dela. */
export async function createTitleAction(_prev: FormState, formData: FormData): Promise<FormState> {
    const parsed = titleCreateSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    // Só a home pode ser destino de retorno: qualquer outro valor é ignorado (open redirect).
    const returnTo = formData.get('returnTo') === HOME_PATH ? HOME_PATH : null;

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
    if (returnTo) {
        revalidatePath(returnTo);
        return { ok: true, message: 'Transação criada.' };
    }
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
    revalidatePath(HOME_PATH);
    Object.values(LIST_PATHS).forEach(path => revalidatePath(path));
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

/** Baixas de um título (até 100), para o modal de detalhes; vazio se o título não existe. */
export async function getTitleEntriesAction(titleId: string): Promise<TitleEntry[]> {
    if (!isUuid(titleId)) return [];
    try {
        const page = await apiFetch(
            `/titles/${titleId}/entries?page=1&pageSize=100`,
            entryPageSchema,
        );
        return page.items;
    } catch (error) {
        if (error instanceof ApiError && error.status < 500) return [];
        throw error;
    }
}

export type TitleFormOptions = {
    presets: { value: string; label: string }[];
    destinationAccounts: { value: string; label: string }[];
};

const EMPTY_OPTIONS: TitleFormOptions = { presets: [], destinationAccounts: [] };

/** Presets ativos e, no título a pagar, as contas de destino (ativo ou despesa) do formulário de cadastro. */
export async function getTitleFormOptionsAction(
    type: 'INCOME' | 'EXPENSE',
): Promise<TitleFormOptions> {
    if (type !== 'INCOME' && type !== 'EXPENSE') return EMPTY_OPTIONS;

    const presets = await apiFetch('/presets?page=1&pageSize=100&isActive=true', presetPageSchema);
    const accounts =
        type === 'EXPENSE'
            ? await apiFetch('/billing-accounts?page=1&pageSize=100', accountPageSchema)
            : null;

    return {
        presets: presets.items.map(preset => ({ value: preset.id, label: preset.name })),
        destinationAccounts: (accounts?.items ?? [])
            .filter(
                account =>
                    account.accountType === 'ANALYTIC' &&
                    account.isActive &&
                    (account.nature === 'ASSET' || account.nature === 'EXPENSE'),
            )
            .map(account => ({ value: account.id, label: `${account.code} ${account.name}` })),
    };
}

/** Contas financeiras (ativo analítico ativo) do plano do título, para escolher onde registrar a baixa. */
export async function getTitlePaymentAccountsAction(
    titleId: string,
): Promise<{ value: string; label: string }[]> {
    if (!isUuid(titleId)) return [];
    try {
        const title = await apiFetch(`/titles/${titleId}`, titleSchema);
        const preset = await apiFetch(`/presets/${title.presetId}`, presetSchema);
        const accounts = await apiFetch(
            `/billing-accounts?planId=${preset.billingPlanId}&page=1&pageSize=100`,
            accountPageSchema,
        );
        return accounts.items
            .filter(
                account =>
                    account.accountType === 'ANALYTIC' &&
                    account.isActive &&
                    account.nature === 'ASSET',
            )
            .map(account => ({ value: account.id, label: `${account.code} ${account.name}` }));
    } catch (error) {
        if (error instanceof ApiError && error.status < 500) return [];
        throw error;
    }
}
