import { describe, expect, it } from 'vitest';
import { cookieNames, sessionCookieOptions } from './cookie-options';

describe('cookieNames', () => {
    it('usa o prefixo __Host- em produção', () => {
        expect(cookieNames(true)).toEqual({
            token: '__Host-kontal-token',
            tenant: '__Host-kontal-tenant',
        });
    });

    it('usa nomes simples em desenvolvimento, sem HTTPS', () => {
        expect(cookieNames(false)).toEqual({ token: 'kontal-token', tenant: 'kontal-tenant' });
    });
});

describe('sessionCookieOptions', () => {
    it('é httpOnly, Lax, na raiz e com a validade pedida', () => {
        expect(sessionCookieOptions(3300, false)).toEqual({
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: false,
            maxAge: 3300,
        });
    });

    it('exige Secure em produção', () => {
        expect(sessionCookieOptions(3300, true).secure).toBe(true);
    });
});
