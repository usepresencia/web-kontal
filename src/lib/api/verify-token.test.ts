import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { verifyToken } = await import('./verify-token');

const session = {
    user: { id: 'u1', email: 'a@b.c', name: 'A', avatarUrl: null, phone: null },
    isPlatformUser: true,
    platformRole: 'INTERNAL_ADMIN',
    memberships: [],
};

beforeEach(() => {
    vi.unstubAllGlobals();
    process.env.KONTAL_API_URL = 'http://api.test/api/v1';
});

describe('verifyToken', () => {
    it('valida o token em POST /auth/session com o Bearer informado', async () => {
        const fetchMock = vi.fn(async () => new Response(JSON.stringify(session), { status: 200 }));
        vi.stubGlobal('fetch', fetchMock);

        const result = await verifyToken('tok');

        expect(result).toEqual({ ok: true, session });
        const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
        expect(url).toBe('http://api.test/api/v1/auth/session');
        expect(init.method).toBe('POST');
        expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
    });

    it.each([
        [401, 'INVALID'],
        [403, 'FORBIDDEN'],
        [500, 'UNAVAILABLE'],
    ])('mapeia %i para %s', async (status, reason) => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response('{}', { status })),
        );
        expect(await verifyToken('tok')).toEqual({ ok: false, reason });
    });

    it('mapeia falha de rede para UNAVAILABLE', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => {
                throw new Error('ECONNREFUSED');
            }),
        );
        expect(await verifyToken('tok')).toEqual({ ok: false, reason: 'UNAVAILABLE' });
    });

    it('mapeia resposta fora do contrato para UNAVAILABLE', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => new Response('{"x":1}', { status: 200 })),
        );
        expect(await verifyToken('tok')).toEqual({ ok: false, reason: 'UNAVAILABLE' });
    });
});
