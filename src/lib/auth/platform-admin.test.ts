import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const apiFetch = vi.fn();
vi.mock('@/lib/api/client', () => ({ apiFetch }));
const notFound = vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
});
vi.mock('next/navigation', () => ({ notFound, redirect: vi.fn() }));
vi.mock('react', async () => ({
    ...(await vi.importActual<typeof import('react')>('react')),
    cache: <T>(fn: T) => fn,
}));

const { isPlatformAdmin, requirePlatformAdmin } = await import('./session');

const me = (platformRole: string | null) => ({
    id: 'u1',
    firebaseUid: 'f1',
    email: 'a@b.com',
    name: 'Ana',
    isPlatformUser: platformRole !== null,
    platformRole,
});

beforeEach(() => vi.clearAllMocks());

describe('isPlatformAdmin', () => {
    it('só o INTERNAL_ADMIN é administrador da plataforma', () => {
        expect(isPlatformAdmin(me('INTERNAL_ADMIN'))).toBe(true);
        expect(isPlatformAdmin(me('INTERNAL_BILLING'))).toBe(false);
        expect(isPlatformAdmin(me(null))).toBe(false);
    });
});

describe('requirePlatformAdmin', () => {
    it('devolve o usuário quando é o administrador', async () => {
        apiFetch.mockResolvedValue(me('INTERNAL_ADMIN'));
        await expect(requirePlatformAdmin()).resolves.toMatchObject({ id: 'u1' });
        expect(notFound).not.toHaveBeenCalled();
    });

    it('responde 404 para qualquer outro usuário, mesmo conhecendo o endereço', async () => {
        apiFetch.mockResolvedValue(me(null));
        await expect(requirePlatformAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
        apiFetch.mockResolvedValue(me('INTERNAL_BILLING'));
        await expect(requirePlatformAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
    });
});
