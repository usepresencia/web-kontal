import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

vi.mock('server-only', () => ({}));

const cookieValues: Record<string, string> = {};
vi.mock('next/headers', () => ({
    cookies: async () => ({
        get: (name: string) => (name in cookieValues ? { value: cookieValues[name] } : undefined),
    }),
}));

vi.mock('next/navigation', () => ({
    redirect: (url: string) => {
        throw new Error(`REDIRECT:${url}`);
    },
}));

const { apiFetch } = await import('./client');
const { ApiError } = await import('./errors');

const schema = z.object({ id: z.string(), name: z.string() });

function mockFetch(status: number, body: unknown) {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

beforeEach(() => {
    vi.unstubAllGlobals();
    Object.keys(cookieValues).forEach(key => delete cookieValues[key]);
    process.env.KONTAL_API_URL = 'http://api.test/api/v1';
    cookieValues['kontal-token'] = 'tok';
    cookieValues['kontal-tenant'] = 'company-1';
});

describe('apiFetch', () => {
    it('envia o token e a empresa e valida a resposta', async () => {
        const fetchMock = mockFetch(200, { id: '1', name: 'A' });
        const result = await apiFetch('/companies/1', schema);
        expect(result).toEqual({ id: '1', name: 'A' });
        const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
        expect(url).toBe('http://api.test/api/v1/companies/1');
        const headers = init.headers as Record<string, string>;
        expect(headers.Authorization).toBe('Bearer tok');
        expect(headers['X-Tenant-Id']).toBe('company-1');
    });

    it('não envia a empresa quando a chamada não é da empresa', async () => {
        const fetchMock = mockFetch(200, { id: '1', name: 'A' });
        await apiFetch('/auth/me', schema, { tenant: false });
        const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
        expect((init.headers as Record<string, string>)['X-Tenant-Id']).toBeUndefined();
    });

    it('descarta campos fora do schema', async () => {
        mockFetch(200, { id: '1', name: 'A', secret: 'x' });
        expect(await apiFetch('/x', schema)).toEqual({ id: '1', name: 'A' });
    });

    it('falha com INVALID_RESPONSE quando falta campo obrigatório', async () => {
        mockFetch(200, { id: '1' });
        await expect(apiFetch('/x', schema)).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
    });

    it('envia ao fim da sessão quando a API responde 401', async () => {
        mockFetch(401, { message: 'expired' });
        await expect(apiFetch('/x', schema)).rejects.toThrow('REDIRECT:/api/session/expired');
    });

    it('envia ao fim da sessão quando não há token', async () => {
        delete cookieValues['kontal-token'];
        mockFetch(200, {});
        await expect(apiFetch('/x', schema)).rejects.toThrow('REDIRECT:/api/session/expired');
    });

    it('converte erro da API em ApiError com status e código', async () => {
        mockFetch(409, { code: 'PERIOD_CLOSED', message: 'fechado' });
        const error = await apiFetch('/x', schema).catch(e => e);
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({ status: 409, code: 'PERIOD_CLOSED' });
    });

    it('expõe os erros por campo de uma validação 400', async () => {
        mockFetch(400, {
            message: 'Validation failed',
            errors: { name: ['Obrigatório'], address: ['CEP inválido', 'x'], bad: 'não é lista' },
        });
        const error = await apiFetch('/x', schema).catch(e => e);
        expect(error).toMatchObject({
            status: 400,
            fieldErrors: { name: ['Obrigatório'], address: ['CEP inválido', 'x'] },
        });
    });

    it('envia o corpo como JSON', async () => {
        const fetchMock = mockFetch(200, { id: '1', name: 'A' });
        await apiFetch('/x', schema, { method: 'POST', body: { name: 'A' } });
        const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
        expect(init.method).toBe('POST');
        expect(init.body).toBe('{"name":"A"}');
        expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    });
});
