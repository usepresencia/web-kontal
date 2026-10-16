import type { FormState } from '@/lib/_utils/form';
import { ApiError } from './errors';

/** Converte um erro 4xx da API em estado de formulário; erros inesperados sobem. */
export function stateFromApiError(error: unknown): FormState {
    if (error instanceof ApiError && error.status < 500) {
        return { ok: false, message: error.message, fieldErrors: error.fieldErrors };
    }
    throw error;
}
