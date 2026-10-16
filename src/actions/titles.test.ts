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
            financialAccounts: [{ value: 'a1', label: '1.1 Caixa' }],
        });
    });

    it('não oferece contas de destino em título a receber, só as financeiras', async () => {
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
                ],
            });
        const result = await getTitleFormOptionsAction('INCOME');
        expect(result.destinationAccounts).toEqual([]);
        expect(result.financialAccounts).toEqual([{ value: 'a1', label: '1.1 Caixa' }]);
    });

    it('devolve vazio para um tipo inválido sem consultar a API', async () => {
        const { getTitleFormOptionsAction } = await import('./titles');
        // @ts-expect-error tipo inválido de propósito
        expect(await getTitleFormOptionsAction('X')).toEqual({
            presets: [],
            destinationAccounts: [],
            financialAccounts: [],
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

describe('createTitleAction com pagamento ou recebimento na hora', () => {
    const ACCOUNT_ID = '4a1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a5b';
    const form = (extra: Record<string, string> = {}) => {
        const data = new FormData();
        const fields = {
            type: 'INCOME',
            presetId: '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a5b',
            description: 'Venda',
            amount: '500,00',
            expirationDate: '2026-11-10',
            payNow: 'true',
            paymentAccountId: ACCOUNT_ID,
            paymentMethod: 'PIX',
            paidAt: '2026-10-16',
            ...extra,
        };
        Object.entries(fields).forEach(([key, value]) => data.set(key, value));
        return data;
    };

    it('cria o título e registra a baixa do valor total na conta escolhida', async () => {
        const { createTitleAction } = await import('./titles');
        apiFetch
            .mockResolvedValueOnce({ id: TITLE_ID, amount: '500.00' })
            .mockResolvedValueOnce({});
        const result = await createTitleAction({ ok: false }, form());
        expect(result.ok).toBe(true);
        expect(apiFetch.mock.calls[1][0]).toBe(`/titles/${TITLE_ID}/entries`);
        expect(apiFetch.mock.calls[1][2].body).toEqual({
            billingAccountId: ACCOUNT_ID,
            principalAmount: '500.00',
            paidAt: '2026-10-16',
            paymentMethod: 'PIX',
        });
    });

    it('avisa que o título foi criado quando só a baixa falha', async () => {
        const { createTitleAction } = await import('./titles');
        const { ApiError } = await import('@/lib/api/errors');
        apiFetch
            .mockResolvedValueOnce({ id: TITLE_ID, amount: '500.00' })
            .mockRejectedValueOnce(new ApiError(422, 'INVALID', 'Conta inválida'));
        const result = await createTitleAction({ ok: false }, form());
        expect(result.ok).toBe(false);
        expect(result.title).toBe('Título criado, sem transação');
        expect(result.message).toContain('a transação não foi registrada');
    });

    it('exige conta, forma e data quando marcado', async () => {
        const { createTitleAction } = await import('./titles');
        const result = await createTitleAction({ ok: false }, form({ paymentAccountId: '' }));
        expect(result.fieldErrors?.paymentAccountId).toBeDefined();
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it('recusa o pagamento na hora em título parcelado', async () => {
        const { createTitleAction } = await import('./titles');
        const result = await createTitleAction(
            { ok: false },
            form({ repeat: 'INSTALLMENT', count: '3' }),
        );
        expect(result.fieldErrors?.payNow).toBeDefined();
        expect(apiFetch).not.toHaveBeenCalled();
    });
});

describe('getTitleAction', () => {
    it('devolve o título pedido', async () => {
        const { getTitleAction } = await import('./titles');
        apiFetch.mockResolvedValue({ id: TITLE_ID });
        expect(await getTitleAction(TITLE_ID)).toEqual({ id: TITLE_ID });
        expect(apiFetch.mock.calls[0][0]).toBe(`/titles/${TITLE_ID}`);
    });

    it('recusa identificador inválido sem consultar a API', async () => {
        const { getTitleAction } = await import('./titles');
        expect(await getTitleAction('../x')).toBeNull();
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it('devolve null em erro 4xx da API', async () => {
        const { getTitleAction } = await import('./titles');
        const { ApiError } = await import('@/lib/api/errors');
        apiFetch.mockRejectedValue(new ApiError(404, 'NOT_FOUND', 'x'));
        expect(await getTitleAction(TITLE_ID)).toBeNull();
    });
});

describe('getSeriesAction', () => {
    it('devolve o parcelamento pedido', async () => {
        const { getSeriesAction } = await import('./titles');
        apiFetch.mockResolvedValue({ id: TITLE_ID, titles: [] });
        expect(await getSeriesAction(TITLE_ID)).toEqual({ id: TITLE_ID, titles: [] });
        expect(apiFetch.mock.calls[0][0]).toBe(`/title-series/${TITLE_ID}`);
    });

    it('recusa identificador inválido sem consultar a API', async () => {
        const { getSeriesAction } = await import('./titles');
        expect(await getSeriesAction('x')).toBeNull();
        expect(apiFetch).not.toHaveBeenCalled();
    });
});
