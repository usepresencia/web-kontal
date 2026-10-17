import { describe, expect, it } from 'vitest';
import { buildCsp, buildSecurityHeaders } from './csp';

const directives = (csp: string) =>
    Object.fromEntries(csp.split('; ').map(part => [part.split(' ')[0], part]));

describe('buildCsp', () => {
    it('amarra scripts ao nonce e bloqueia frames, base e objetos', () => {
        const d = directives(buildCsp({ nonce: 'abc', isDev: false }));
        expect(d['script-src']).toBe("script-src 'self' 'nonce-abc' 'strict-dynamic'");
        expect(d['frame-ancestors']).toBe("frame-ancestors 'none'");
        expect(d['base-uri']).toBe("base-uri 'none'");
        expect(d['object-src']).toBe("object-src 'none'");
        expect(d['form-action']).toBe("form-action 'self'");
        expect(d['default-src']).toBe("default-src 'self'");
    });

    it('não permite eval nem inline em produção', () => {
        const csp = buildCsp({ nonce: 'abc', isDev: false });
        expect(csp).not.toContain('unsafe-eval');
        expect(directives(csp)['script-src']).not.toContain('unsafe-inline');
    });

    it('permite eval só em desenvolvimento', () => {
        expect(buildCsp({ nonce: 'abc', isDev: true })).toContain("'unsafe-eval'");
    });
});

describe('buildSecurityHeaders', () => {
    it('inclui os cabeçalhos de endurecimento', () => {
        const headers = buildSecurityHeaders({ pathname: '/home', nonce: 'n', isDev: false });
        expect(headers['X-Content-Type-Options']).toBe('nosniff');
        expect(headers['X-Frame-Options']).toBe('DENY');
        expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
        expect(headers['Strict-Transport-Security']).toContain('max-age=');
        expect(headers['Content-Security-Policy']).toContain("'nonce-n'");
    });

    it('não envia referrer na página de callback do SSO', () => {
        const headers = buildSecurityHeaders({
            pathname: '/sso-callback',
            nonce: 'n',
            isDev: false,
        });
        expect(headers['Referrer-Policy']).toBe('no-referrer');
    });
});
