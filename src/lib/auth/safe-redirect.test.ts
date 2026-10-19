import { describe, expect, it } from 'vitest';
import { isSafeInternalPath } from './safe-redirect';

describe('isSafeInternalPath', () => {
    it.each(['/home', '/pages/company?x=1', '/plataforma/empresas/abc-123', '/'])(
        'aceita %s',
        path => {
            expect(isSafeInternalPath(path)).toBe(true);
        },
    );

    it.each([
        '',
        'home',
        '//evil.com',
        'https://evil.com',
        '/\\evil.com',
        'javascript:alert(1)',
        '/%2F%2Fevil.com',
        '/ok\nSet-Cookie: a=b',
        '/a\u0000b',
    ])('recusa %j', path => {
        expect(isSafeInternalPath(path)).toBe(false);
    });
});
