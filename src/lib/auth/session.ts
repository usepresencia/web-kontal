import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { meSchema, type Me } from '@/lib/api/schemas/session';
import { notFound, redirect } from 'next/navigation';
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

const PLATFORM_ADMIN_ROLE = 'INTERNAL_ADMIN';

/** Indica se o usuário é o administrador da plataforma (`INTERNAL_ADMIN`). */
export function isPlatformAdmin(me: Pick<Me, 'platformRole'>): boolean {
    return me.platformRole === PLATFORM_ADMIN_ROLE;
}

/** Exige o administrador da plataforma: para qualquer outro usuário a página responde 404. */
export async function requirePlatformAdmin(): Promise<Me> {
    const me = await requireSession();
    if (!isPlatformAdmin(me)) notFound();
    return me;
}
