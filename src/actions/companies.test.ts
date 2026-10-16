import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const apiFetch = vi.fn();
vi.mock('@/lib/api/client', () => ({ apiFetch }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ notFound: vi.fn(), redirect: vi.fn() }));
vi.mock('react', async () => ({
    ...(await vi.importActual<typeof import('react')>('react')),
    cache: <T>(fn: T) => fn,
}));

const { createCompanyAction, deactivateCompanyAction } = await import('./companies');

const COMPANY_ID = '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a5b';

const me = (platformRole: string | null) => ({
    id: 'u1',
    firebaseUid: 'f1',
    email: 'a@b.com',
    name: 'Ana',
    isPlatformUser: platformRole !== null,
    platformRole,
});

const form = () => {
    const data = new FormData();
    data.set('name', 'Empresa');
    return data;
};

beforeEach(() => vi.clearAllMocks());

describe('createCompanyAction', () => {
    it('recusa quem não é administrador da plataforma sem chamar a API de empresas', async () => {
        apiFetch.mockResolvedValue(me('INTERNAL_BILLING'));
        const result = await createCompanyAction({ ok: false }, form());
        expect(result).toMatchObject({ ok: false });
        expect(result.message).toContain('administrador da plataforma');
        expect(apiFetch).toHaveBeenCalledTimes(1);
        expect(apiFetch.mock.calls[0][0]).toBe('/auth/me');
    });

    it('para o administrador valida o corpo antes de chamar a API', async () => {
        apiFetch.mockResolvedValue(me('INTERNAL_ADMIN'));
        const result = await createCompanyAction({ ok: false }, form());
        expect(result.ok).toBe(false);
        expect(result.fieldErrors).toBeDefined();
        expect(apiFetch).toHaveBeenCalledTimes(1);
    });
});

describe('deactivateCompanyAction', () => {
    it('recusa quem não é administrador sem chamar DELETE', async () => {
        apiFetch.mockResolvedValue(me(null));
        const result = await deactivateCompanyAction(COMPANY_ID);
        expect(result.ok).toBe(false);
        expect(apiFetch).toHaveBeenCalledTimes(1);
    });

    it('o administrador desativa pelo identificador', async () => {
        apiFetch.mockResolvedValueOnce(me('INTERNAL_ADMIN')).mockResolvedValueOnce(undefined);
        expect((await deactivateCompanyAction(COMPANY_ID)).ok).toBe(true);
        expect(apiFetch.mock.calls[1][0]).toBe(`/companies/${COMPANY_ID}`);
    });
});
