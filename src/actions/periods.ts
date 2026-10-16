'use server';

import { formDataToObject, stateFromZodError, type FormState } from '@/lib/_utils/form';
import { apiFetch } from '@/lib/api/client';
import { stateFromApiError } from '@/lib/api/form-state';
import { closePeriodSchema } from '@/lib/api/schemas/period-closing';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const PATH = '/contabilidade/fechamento';

/** Fecha o mês informado (em sequência); dezembro apura o resultado do ano. */
export async function closePeriodAction(_prev: FormState, formData: FormData): Promise<FormState> {
    const parsed = closePeriodSchema.safeParse(formDataToObject(formData));
    if (!parsed.success) return stateFromZodError(parsed.error);

    try {
        await apiFetch('/period-closings', z.unknown(), { method: 'POST', body: parsed.data });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath(PATH);
    return { ok: true, message: 'Período fechado.' };
}

/** Reabre o último período fechado, estornando a apuração quando houver. */
export async function reopenPeriodAction(): Promise<FormState> {
    try {
        await apiFetch('/period-closings/latest', z.undefined(), { method: 'DELETE' });
    } catch (error) {
        return stateFromApiError(error);
    }
    revalidatePath(PATH);
    return { ok: true };
}
