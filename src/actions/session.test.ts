import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const verifyToken = vi.fn();
vi.mock('@/lib/api/verify-token', () => ({ verifyToken }));

const writeToken = vi.fn();
const writeTenantId = vi.fn();
const clearTenantId = vi.fn();
const clearSession = vi.fn();
vi.mock('@/lib/auth/session-cookies', () => ({
    writeToken,
    writeTenantId,
    clearTenantId,
    clearSession,
}));

const apiFetch = vi.fn();
vi.mock('@/lib/api/client', () => ({ apiFetch }));

vi.mock('@/lib/config/env', () => ({ presenciaUrl: () => 'http://presencia.test' }));

vi.mock('next/navigation', () => ({
    redirect: (url: string) => {
        throw new Error(`REDIRECT:${url}`);
    },
}));

const { createSessionAction, selectCompanyAction, switchCompanyAction, logoutAction } =
    await import('./session');

beforeEach(() => {
    vi.clearAllMocks();
});

describe('createSessionAction', () => {
    it('recusa token malformado sem chamar a API nem gravar cookie', async () => {
        expect(await createSessionAction('<script>')).toEqual({ ok: false, reason: 'INVALID' });
        expect(verifyToken).not.toHaveBeenCalled();
        expect(writeToken).not.toHaveBeenCalled();
    });

    it.each(['INVALID', 'FORBIDDEN', 'UNAVAILABLE'] as const)(
        'não grava cookie quando a API responde %s',
        async reason => {
            verifyToken.mockResolvedValue({ ok: false, reason });
            expect(await createSessionAction('a.b.c')).toEqual({ ok: false, reason });
            expect(writeToken).not.toHaveBeenCalled();
        },
    );

    it('grava o token, limpa a empresa anterior e nunca devolve o token', async () => {
        verifyToken.mockResolvedValue({ ok: true, session: {} });
        const result = await createSessionAction('a.b.c');
        expect(result).toEqual({ ok: true });
        expect(writeToken).toHaveBeenCalledWith('a.b.c');
        expect(clearTenantId).toHaveBeenCalled();
    });
});

describe('selectCompanyAction', () => {
    const tenants = [
        { companyId: 'c1', name: 'A', role: 'OWNER', isActive: true },
        { companyId: 'c2', name: 'B', role: 'OWNER', isActive: false },
    ];

    it('grava a empresa e vai para a home quando ela está na lista', async () => {
        apiFetch.mockResolvedValue(tenants);
        await expect(selectCompanyAction('c1')).rejects.toThrow('REDIRECT:/home');
        expect(writeTenantId).toHaveBeenCalledWith('c1');
    });

    it('recusa empresa que o usuário não acessa', async () => {
        apiFetch.mockResolvedValue(tenants);
        expect(await selectCompanyAction('outra')).toEqual({ ok: false });
        expect(writeTenantId).not.toHaveBeenCalled();
    });

    it('recusa empresa inativa', async () => {
        apiFetch.mockResolvedValue(tenants);
        expect(await selectCompanyAction('c2')).toEqual({ ok: false });
        expect(writeTenantId).not.toHaveBeenCalled();
    });

    it('recusa identificador malformado sem consultar a API', async () => {
        expect(await selectCompanyAction('')).toEqual({ ok: false });
        expect(await selectCompanyAction('x'.repeat(200))).toEqual({ ok: false });
        expect(apiFetch).not.toHaveBeenCalled();
    });
});

describe('switchCompanyAction', () => {
    const tenants = [
        { companyId: 'c1', name: 'A', role: 'OWNER', isActive: true },
        { companyId: 'c2', name: 'B', role: 'OWNER', isActive: false },
    ];

    it('grava a empresa sem redirecionar, para a tela atual recarregar', async () => {
        apiFetch.mockResolvedValue(tenants);
        expect(await switchCompanyAction('c1')).toEqual({ ok: true });
        expect(writeTenantId).toHaveBeenCalledWith('c1');
    });

    it('recusa empresa fora da lista, inativa ou malformada', async () => {
        apiFetch.mockResolvedValue(tenants);
        expect(await switchCompanyAction('outra')).toEqual({ ok: false });
        expect(await switchCompanyAction('c2')).toEqual({ ok: false });
        expect(await switchCompanyAction('')).toEqual({ ok: false });
        expect(writeTenantId).not.toHaveBeenCalled();
    });
});

describe('logoutAction', () => {
    it('apaga a sessão e leva ao login do Presencia', async () => {
        await expect(logoutAction()).rejects.toThrow('REDIRECT:http://presencia.test/login');
        expect(clearSession).toHaveBeenCalled();
    });
});
