import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const apiFetch = vi.fn();
vi.mock('@/lib/api/client', () => ({ apiFetch }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
    redirect: (url: string) => {
        throw new Error(`REDIRECT:${url}`);
    },
}));

const { getTitleEntriesAction } = await import('./titles');

const TITLE_ID = '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a5b';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getTitleEntriesAction', () => {
    it('devolve as baixas do título', async () => {
        const items = [{ id: 'e1' }];
        apiFetch.mockResolvedValue({ items });
        expect(await getTitleEntriesAction(TITLE_ID)).toEqual(items);
        expect(apiFetch.mock.calls[0][0]).toBe(`/titles/${TITLE_ID}/entries?page=1&pageSize=100`);
    });

    it('recusa identificador que não é UUID sem consultar a API', async () => {
        expect(await getTitleEntriesAction('../../auth/me')).toEqual([]);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it('devolve lista vazia em erro 4xx da API', async () => {
        const { ApiError } = await import('@/lib/api/errors');
        apiFetch.mockRejectedValue(new ApiError(404, 'NOT_FOUND', 'x'));
        expect(await getTitleEntriesAction(TITLE_ID)).toEqual([]);
    });
});

describe('createTitleAction com retorno à home', () => {
    const createTitleAction = import('./titles').then(module => module.createTitleAction);

    function form(extra: Record<string, string> = {}) {
        const data = new FormData();
        Object.entries({
            presetId: TITLE_ID,
            type: 'EXPENSE',
            description: 'Aluguel',
            amount: '100,00',
            expirationDate: '2026-11-10',
            ...extra,
        }).forEach(([key, value]) => data.append(key, value));
        return data;
    }

    it('devolve ok sem redirecionar quando o retorno é a home', async () => {
        apiFetch.mockResolvedValue({ id: 't1' });
        const result = await (await createTitleAction)({ ok: false }, form({ returnTo: '/home' }));
        expect(result).toMatchObject({ ok: true });
    });

    it('redireciona à lista do tipo quando não há retorno', async () => {
        apiFetch.mockResolvedValue({ id: 't1' });
        await expect((await createTitleAction)({ ok: false }, form())).rejects.toThrow(
            'REDIRECT:/operacoes/pagar',
        );
    });

    it('ignora um retorno que não seja a home (open redirect)', async () => {
        apiFetch.mockResolvedValue({ id: 't1' });
        await expect(
            (await createTitleAction)({ ok: false }, form({ returnTo: 'https://evil.com' })),
        ).rejects.toThrow('REDIRECT:/operacoes/pagar');
    });
});

describe('getTitleFormOptionsAction', () => {
    it('devolve só os presets e as contas de destino de um título a pagar', async () => {
        const { getTitleFormOptionsAction } = await import('./titles');
        apiFetch
            .mockResolvedValueOnce({ items: [{ id: 'p1', name: 'Padrão' }] })
            .mockResolvedValueOnce({
                items: [
                    {
                        id: 'a1',
                        code: '1.1',
                        name: 'Caixa',
                        accountType: 'ANALYTIC',
                        isActive: true,
                        nature: 'ASSET',
                    },
                    {
                        id: 'a2',
                        code: '2.1',
                        name: 'Fornecedores',
                        accountType: 'ANALYTIC',
                        isActive: true,
                        nature: 'LIABILITY',
                    },
                    {
                        id: 'a3',
                        code: '3',
                        name: 'Sintética',
                        accountType: 'SYNTHETIC',
                        isActive: true,
                        nature: 'EXPENSE',
                    },
                ],
            });
        expect(await getTitleFormOptionsAction('EXPENSE')).toEqual({
            presets: [{ value: 'p1', label: 'Padrão' }],
            destinationAccounts: [{ value: 'a1', label: '1.1 Caixa' }],
        });
    });

    it('não busca contas de destino em título a receber', async () => {
        const { getTitleFormOptionsAction } = await import('./titles');
        apiFetch.mockResolvedValueOnce({ items: [{ id: 'p1', name: 'Padrão' }] });
        const result = await getTitleFormOptionsAction('INCOME');
        expect(result.destinationAccounts).toEqual([]);
        expect(apiFetch).toHaveBeenCalledTimes(1);
    });

    it('devolve vazio para um tipo inválido sem consultar a API', async () => {
        const { getTitleFormOptionsAction } = await import('./titles');
        // @ts-expect-error tipo inválido de propósito
        expect(await getTitleFormOptionsAction('X')).toEqual({
            presets: [],
            destinationAccounts: [],
        });
        expect(apiFetch).not.toHaveBeenCalled();
    });
});
