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

/** Confere que o usuário acessa a empresa ativa informada e a grava no cookie. */
async function activateCompany(companyId: string): Promise<boolean> {
    if (companyId.length === 0 || companyId.length > MAX_COMPANY_ID_LENGTH) return false;

    const tenants = await apiFetch('/auth/tenants', tenantsSchema, { tenant: false });
    if (!tenants.some(tenant => tenant.companyId === companyId && tenant.isActive)) return false;

    await writeTenantId(companyId);
    return true;
}

/** Define a empresa ativa, depois de conferir que o usuário a acessa, e abre a home. */
export async function selectCompanyAction(companyId: string): Promise<{ ok: false }> {
    if (!(await activateCompany(companyId))) return { ok: false };
    redirect('/home');
}

/** Troca a empresa ativa sem sair da tela atual; o cliente recarrega a página em seguida. */
export async function switchCompanyAction(companyId: string): Promise<{ ok: boolean }> {
    return { ok: await activateCompany(companyId) };
}

/** Apaga a sessão do Kontal e leva ao login do Presencia. */
export async function logoutAction(): Promise<void> {
    await clearSession();
    redirect(`${presenciaUrl() ?? ''}/login`);
}
