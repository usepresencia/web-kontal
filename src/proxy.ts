import { cookieNames } from '@/lib/auth/cookie-options';
import { buildSecurityHeaders } from '@/lib/security/csp';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = [
    '/sso-callback',
    '/api/session/expired',
    '/api/health',
    '/acesso-negado',
    '/design',
];

const isPublic = (pathname: string) =>
    PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`));

/**
 * Aplica CSP com nonce e cabeçalhos de segurança a toda página e faz a checagem otimista de
 * sessão (presença do cookie). Quem decide a autorização é a api-kontal, a cada chamada.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isProduction = process.env.NODE_ENV === 'production';
    const nonce = btoa(crypto.randomUUID());
    const securityHeaders = buildSecurityHeaders({ pathname, nonce, isDev: !isProduction });

    if (!isPublic(pathname) && !request.cookies.get(cookieNames(isProduction).token)) {
        const response = NextResponse.redirect(new URL('/api/session/expired', request.url));
        Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value));
        return response;
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', securityHeaders['Content-Security-Policy']);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value));
    return response;
}

export const config = {
    matcher: [
        {
            source: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
            missing: [{ type: 'header', key: 'next-router-prefetch' }],
        },
    ],
};
