import { cookies } from 'next/headers';
import 'server-only';
import { cookieNames, sessionCookieOptions, TOKEN_MAX_AGE_SECONDS } from './cookie-options';

const isProduction = () => process.env.NODE_ENV === 'production';

/** Token da sessão, lido do cookie httpOnly. */
export async function readToken(): Promise<string | null> {
    const store = await cookies();
    return store.get(cookieNames(isProduction()).token)?.value ?? null;
}

/** Empresa ativa da sessão, lida do cookie httpOnly. */
export async function readTenantId(): Promise<string | null> {
    const store = await cookies();
    return store.get(cookieNames(isProduction()).tenant)?.value ?? null;
}

/** Grava o token da sessão em cookie httpOnly. */
export async function writeToken(token: string): Promise<void> {
    const store = await cookies();
    store.set(
        cookieNames(isProduction()).token,
        token,
        sessionCookieOptions(TOKEN_MAX_AGE_SECONDS, isProduction()),
    );
}

/** Grava a empresa ativa em cookie httpOnly, com a mesma validade do token. */
export async function writeTenantId(companyId: string): Promise<void> {
    const store = await cookies();
    store.set(
        cookieNames(isProduction()).tenant,
        companyId,
        sessionCookieOptions(TOKEN_MAX_AGE_SECONDS, isProduction()),
    );
}

/** Apaga os cookies de sessão. */
export async function clearSession(): Promise<void> {
    const store = await cookies();
    const names = cookieNames(isProduction());
    store.delete(names.token);
    store.delete(names.tenant);
}
