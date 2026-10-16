'use server';

import { apiFetch } from '@/lib/api/client';
import { tenantsSchema } from '@/lib/api/schemas/tenant';
import { verifyToken } from '@/lib/api/verify-token';
import { clearSession, clearTenantId, writeTenantId, writeToken } from '@/lib/auth/session-cookies';
import { isWellFormedToken } from '@/lib/auth/token';
import { presenciaUrl } from '@/lib/config/env';
import { redirect } from 'next/navigation';

export type CreateSessionResult =
    { ok: true } | { ok: false; reason: 'INVALID' | 'FORBIDDEN' | 'UNAVAILABLE' };

const MAX_COMPANY_ID_LENGTH = 64;

/** Valida o ID token do Presencia na api-kontal e abre a sessão em cookie httpOnly. */
export async function createSessionAction(token: string): Promise<CreateSessionResult> {
    if (!isWellFormedToken(token)) return { ok: false, reason: 'INVALID' };

    const result = await verifyToken(token);
    if (!result.ok) return { ok: false, reason: result.reason };

    await writeToken(token);
    await clearTenantId();
    return { ok: true };
}

/** Define a empresa ativa, depois de conferir que o usuário a acessa, e abre a home. */
export async function selectCompanyAction(companyId: string): Promise<{ ok: false }> {
    if (companyId.length === 0 || companyId.length > MAX_COMPANY_ID_LENGTH) return { ok: false };

    const tenants = await apiFetch('/auth/tenants', tenantsSchema, { tenant: false });
    if (!tenants.some(tenant => tenant.companyId === companyId && tenant.isActive)) {
        return { ok: false };
    }

    await writeTenantId(companyId);
    redirect('/home');
}

/** Apaga a sessão do Kontal e leva ao login do Presencia. */
export async function logoutAction(): Promise<void> {
    await clearSession();
    redirect(`${presenciaUrl() ?? ''}/login`);
}
