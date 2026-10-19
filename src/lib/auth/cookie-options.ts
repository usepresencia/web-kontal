/** Duração do cookie de token: um pouco abaixo da hora de validade do ID token do Firebase. */
export const TOKEN_MAX_AGE_SECONDS = 55 * 60;

/** Nomes dos cookies de sessão; em produção usam o prefixo __Host-, que exige Secure e path `/`. */
export function cookieNames(isProduction: boolean) {
    const prefix = isProduction ? '__Host-' : '';
    return { token: `${prefix}kontal-token`, tenant: `${prefix}kontal-tenant` };
}

/** Opções dos cookies de sessão: inacessíveis ao JavaScript e enviados só em navegação do mesmo site. */
export function sessionCookieOptions(maxAgeSeconds: number, isProduction: boolean) {
    return {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: isProduction,
        maxAge: maxAgeSeconds,
    };
}
