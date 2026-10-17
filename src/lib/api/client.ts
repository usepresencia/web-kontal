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

/** Lê o `code` e a `message` do corpo de erro da api-kontal, quando existirem. */
async function readError(response: Response): Promise<{ code: string; message: string }> {
    try {
        const body = (await response.json()) as { code?: unknown; message?: unknown };
        return {
            code: typeof body.code === 'string' ? body.code : `HTTP_${response.status}`,
            message: typeof body.message === 'string' ? body.message : response.statusText,
        };
    } catch {
        return { code: `HTTP_${response.status}`, message: response.statusText };
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
        const { code, message } = await readError(response);
        throw new ApiError(response.status, code, message);
    }

    const payload = response.status === 204 ? undefined : await response.json();
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
        throw new ApiError(502, 'INVALID_RESPONSE', `Resposta inesperada de ${path}`);
    }
    return parsed.data;
}
