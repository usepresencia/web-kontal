import { cookieNames } from '@/lib/auth/cookie-options';
import { kontalApiUrl } from '@/lib/config/env';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import 'server-only';
import type { z } from 'zod';
import { ApiError } from './errors';

const SESSION_ENDED_PATH = '/api/session/expired';

type ApiFetchInit = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    /** Envia o X-Tenant-Id da empresa ativa (padrão); desligue para chamadas fora de empresa. */
    tenant?: boolean;
};

type ErrorDetails = { code: string; message: string; fieldErrors: Record<string, string[]> };

/** Mantém só os erros por campo que são listas de texto. */
function readFieldErrors(errors: unknown): Record<string, string[]> {
    if (typeof errors !== 'object' || errors === null) return {};
    return Object.fromEntries(
        Object.entries(errors).filter(
            (entry): entry is [string, string[]] =>
                Array.isArray(entry[1]) && entry[1].every(item => typeof item === 'string'),
        ),
    );
}

/** Lê `code`, `message` e os erros por campo do corpo de erro da api-kontal, quando existirem. */
async function readError(response: Response): Promise<ErrorDetails> {
    try {
        const body = (await response.json()) as {
            code?: unknown;
            message?: unknown;
            errors?: unknown;
        };
        return {
            code: typeof body.code === 'string' ? body.code : `HTTP_${response.status}`,
            message: typeof body.message === 'string' ? body.message : response.statusText,
            fieldErrors: readFieldErrors(body.errors),
        };
    } catch {
        return { code: `HTTP_${response.status}`, message: response.statusText, fieldErrors: {} };
    }
}

/**
 * Chama a api-kontal no servidor com o token e a empresa dos cookies e valida a resposta com zod.
 * Sem token ou com 401 encerra a sessão; demais erros viram ApiError.
 */
export async function apiFetch<S extends z.ZodType>(
    path: string,
    schema: S,
    { method = 'GET', body, tenant = true }: ApiFetchInit = {},
): Promise<z.infer<S>> {
    const store = await cookies();
    const names = cookieNames(process.env.NODE_ENV === 'production');
    const token = store.get(names.token)?.value;
    if (!token) redirect(SESSION_ENDED_PATH);

    const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
    };
    const tenantId = tenant ? store.get(names.tenant)?.value : undefined;
    if (tenantId) headers['X-Tenant-Id'] = tenantId;
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const response = await fetch(`${kontalApiUrl()}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: 'no-store',
    });

    if (response.status === 401) redirect(SESSION_ENDED_PATH);
    if (!response.ok) {
        const { code, message, fieldErrors } = await readError(response);
        throw new ApiError(response.status, code, message, fieldErrors);
    }

    const payload = response.status === 204 ? undefined : await response.json();
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
        throw new ApiError(502, 'INVALID_RESPONSE', `Resposta inesperada de ${path}`);
    }
    return parsed.data;
}
