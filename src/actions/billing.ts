'use server';

import { formDataToObject, stateFromZodError, type FormState } from '@/lib/_utils/form';
import { SUCCESS } from '@/lib/_utils/toast-messages';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { stateFromApiError } from '@/lib/api/form-state';
import {
    accountCreateSchema,
    accountSchema,
    accountsSchema,
    accountUpdateSchema,
    planInputSchema,
    planSchema,
    type BillingAccount,
} from '@/lib/api/schemas/billing';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const INVALID_ID: FormState = { ok: false, message: 'Identificador inválido.' };
const isUuid = (value: string) => z.uuid().safeParse(value).success;

/** Cria um plano de contas. */
export async function createPlanAction(_prev: FormState, formData: FormData): Promise<FormState> {
    const parsed = planInputSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch('/billing-plans', planSchema, { method: 'POST', body: parsed.data });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/cadastros/plano-de-contas');
    return { ok: true, ...SUCCESS.planCreated };
}

/** Atualiza o nome e a descrição de um plano. */
export async function updatePlanAction(
    planId: string,
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    if (!isUuid(planId)) return INVALID_ID;
    const parsed = planInputSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch(`/billing-plans/${planId}`, planSchema, {
            method: 'PUT',
            body: parsed.data,
        });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/cadastros/plano-de-contas');
    revalidatePath(`/cadastros/plano-de-contas/${planId}`);
    return { ok: true, ...SUCCESS.planUpdated };
}

/** Exclui um plano de contas. */
export async function deletePlanAction(planId: string): Promise<FormState> {
    if (!isUuid(planId)) return INVALID_ID;
    try {
        await apiFetch(`/billing-plans/${planId}`, z.undefined(), { method: 'DELETE' });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/cadastros/plano-de-contas');
    return { ok: true };
}

/** Cria uma conta no plano. */
export async function createAccountAction(
    planId: string,
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    if (!isUuid(planId)) return INVALID_ID;
    const parsed = accountCreateSchema.safeParse({
        ...formDataToObject(formData),
        billingPlanId: planId,
    });
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch('/billing-accounts', accountSchema, { method: 'POST', body: parsed.data });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/cadastros/plano-de-contas');
    revalidatePath(`/cadastros/plano-de-contas/${planId}`);
    return { ok: true, ...SUCCESS.accountCreated };
}

/** Atualiza nome, tipo, categorias e status de uma conta. */
export async function updateAccountAction(
    planId: string,
    accountId: string,
    _prev: FormState,
    formData: FormData,
): Promise<FormState> {
    if (!isUuid(planId) || !isUuid(accountId)) return INVALID_ID;
    const parsed = accountUpdateSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch(`/billing-accounts/${accountId}`, accountSchema, {
            method: 'PUT',
            body: parsed.data,
        });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/cadastros/plano-de-contas');
    revalidatePath(`/cadastros/plano-de-contas/${planId}`);
    return { ok: true, ...SUCCESS.accountUpdated };
}

/** Exclui uma conta do plano. */
export async function deleteAccountAction(planId: string, accountId: string): Promise<FormState> {
    if (!isUuid(planId) || !isUuid(accountId)) return INVALID_ID;
    try {
        await apiFetch(`/billing-accounts/${accountId}`, z.undefined(), { method: 'DELETE' });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath('/cadastros/plano-de-contas');
    revalidatePath(`/cadastros/plano-de-contas/${planId}`);
    return { ok: true };
}

/** Contas de um plano, para os modais de preset e de plano; vazio se o plano não existir. */
export async function getPlanAccountsAction(planId: string): Promise<BillingAccount[]> {
    if (!isUuid(planId)) return [];
    try {
        return await apiFetch(`/billing-plans/${planId}/accounts`, accountsSchema);
    } catch (error) {
        if (error instanceof ApiError && error.status < 500) return [];
        throw error;
    }
}
