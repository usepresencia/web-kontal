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

describe('getTitlePaymentAccountsAction', () => {
    it('devolve as contas financeiras (ativo analítico ativo) do plano do preset do título', async () => {
        const { getTitlePaymentAccountsAction } = await import('./titles');
        apiFetch
            .mockResolvedValueOnce({ presetId: 'p1' })
            .mockResolvedValueOnce({ billingPlanId: 'plan1' })
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
                        code: '1.2',
                        name: 'Inativa',
                        accountType: 'ANALYTIC',
                        isActive: false,
                        nature: 'ASSET',
                    },
                    {
                        id: 'a3',
                        code: '2',
                        name: 'Fornecedores',
                        accountType: 'ANALYTIC',
                        isActive: true,
                        nature: 'LIABILITY',
                    },
                    {
                        id: 'a4',
                        code: '1',
                        name: 'Ativo',
                        accountType: 'SYNTHETIC',
                        isActive: true,
                        nature: 'ASSET',
                    },
                ],
            });
        expect(await getTitlePaymentAccountsAction(TITLE_ID)).toEqual([
            { value: 'a1', label: '1.1 Caixa' },
        ]);
        expect(apiFetch.mock.calls[2][0]).toContain('planId=plan1');
    });

    it('recusa identificador que não é UUID sem consultar a API', async () => {
        const { getTitlePaymentAccountsAction } = await import('./titles');
        expect(await getTitlePaymentAccountsAction('../x')).toEqual([]);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it('devolve lista vazia em erro 4xx da API', async () => {
        const { getTitlePaymentAccountsAction } = await import('./titles');
        const { ApiError } = await import('@/lib/api/errors');
        apiFetch.mockRejectedValue(new ApiError(404, 'NOT_FOUND', 'x'));
        expect(await getTitlePaymentAccountsAction(TITLE_ID)).toEqual([]);
    });
});

describe('getOpenTitlesAction', () => {
    it('lista os títulos em aberto do tipo pedido', async () => {
        const { getOpenTitlesAction } = await import('./titles');
        const items = [{ id: 't1' }];
        apiFetch.mockResolvedValue({ items });
        expect(await getOpenTitlesAction('EXPENSE')).toEqual(items);
        const url = apiFetch.mock.calls[0][0] as string;
        expect(url).toContain('type=EXPENSE');
        expect(url).toContain('status=OPEN');
        expect(url).toContain('pageSize=100');
    });

    it('recusa um tipo inválido sem consultar a API', async () => {
        const { getOpenTitlesAction } = await import('./titles');
        // @ts-expect-error tipo inválido de propósito
        expect(await getOpenTitlesAction('X')).toEqual([]);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it('devolve lista vazia em erro 4xx da API', async () => {
        const { getOpenTitlesAction } = await import('./titles');
        const { ApiError } = await import('@/lib/api/errors');
        apiFetch.mockRejectedValue(new ApiError(400, 'X', 'x'));
        expect(await getOpenTitlesAction('INCOME')).toEqual([]);
    });
});

describe('createTitleAction', () => {
    const form = (extra: Record<string, string> = {}) => {
        const data = new FormData();
        const fields = {
            type: 'EXPENSE',
            presetId: '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a5b',
            description: 'Aluguel',
            amount: '1.234,50',
            expirationDate: '2026-11-10',
            ...extra,
        };
        Object.entries(fields).forEach(([key, value]) => data.set(key, value));
        return data;
    };

    it('cria o título e devolve ok em vez de redirecionar, para o modal fechar', async () => {
        const { createTitleAction } = await import('./titles');
        apiFetch.mockResolvedValue({});
        const result = await createTitleAction({ ok: false }, form());
        expect(result.ok).toBe(true);
        expect(apiFetch.mock.calls[0][0]).toBe('/titles');
    });

    it('devolve os erros dos campos sem chamar a API', async () => {
        const { createTitleAction } = await import('./titles');
        const result = await createTitleAction({ ok: false }, form({ description: '' }));
        expect(result.ok).toBe(false);
        expect(apiFetch).not.toHaveBeenCalled();
    });
});
