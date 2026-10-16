import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { meSchema, type Me } from '@/lib/api/schemas/session';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import 'server-only';

const FORBIDDEN_PATH = '/acesso-negado';

/**
 * Confirma a sessão na api-kontal a cada requisição (zero trust) e devolve o usuário.
 * Sem sessão envia ao Presencia; sem permissão envia à página de acesso negado.
 */
export const requireSession = cache(async (): Promise<Me> => {
    try {
        return await apiFetch('/auth/me', meSchema, { tenant: false });
    } catch (error) {
        if (error instanceof ApiError && error.status === 403) redirect(FORBIDDEN_PATH);
        throw error;
    }
});
