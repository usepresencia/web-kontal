import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const apiFetch = vi.fn();
vi.mock('@/lib/api/client', () => ({ apiFetch }));

const { getFullJournalReportAction, getFullLedgerReportAction } = await import('./reports');

const ACCOUNT_ID = '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a5b';

const day = (date: string) => ({
    date,
    totalDebits: '10.00',
    totalCredits: '10.00',
    entries: [],
});

beforeEach(() => vi.clearAllMocks());

describe('getFullJournalReportAction', () => {
    it('busca todas as páginas do período e junta os dias num só relatório', async () => {
        apiFetch
            .mockResolvedValueOnce({ items: [day('2026-10-01'), day('2026-10-02')], total: 3 })
            .mockResolvedValueOnce({ items: [day('2026-10-03')], total: 3 });
        const report = await getFullJournalReportAction('2026-10-01', '2026-10-31');
        expect(apiFetch).toHaveBeenCalledTimes(2);
        expect(apiFetch.mock.calls[1][0]).toContain('page=2');
        expect(report?.sections).toHaveLength(3);
        expect(report?.filename).toBe('livro-diario-2026-10-01-a-2026-10-31');
    });

    it('para quando a API devolve uma página vazia', async () => {
        apiFetch.mockResolvedValue({ items: [], total: 5 });
        const report = await getFullJournalReportAction('2026-10-01', '2026-10-31');
        expect(apiFetch).toHaveBeenCalledTimes(1);
        expect(report?.sections).toEqual([]);
    });

    it('recusa datas inválidas sem consultar a API', async () => {
        expect(await getFullJournalReportAction('x', '2026-10-31')).toBeNull();
        expect(apiFetch).not.toHaveBeenCalled();
    });
});

describe('getFullLedgerReportAction', () => {
    const ledger = (items: unknown[], total: number) => ({
        account: { id: ACCOUNT_ID, code: '1.1', name: 'Caixa' },
        openingBalance: { amount: '0.00', side: 'D' },
        closingBalance: { amount: '5.00', side: 'D' },
        items,
        total,
    });
    const item = (number: number) => ({
        date: '2026-10-01',
        number,
        description: 'x',
        debit: '5.00',
        credit: '0.00',
        balance: { amount: '5.00', side: 'D' },
    });

    it('junta as movimentações de todas as páginas numa só tabela', async () => {
        apiFetch
            .mockResolvedValueOnce(ledger([item(1), item(2)], 3))
            .mockResolvedValueOnce(ledger([item(3)], 3));
        const report = await getFullLedgerReportAction(ACCOUNT_ID, '2026-10-01', '2026-10-31');
        expect(report?.sections[0].rows).toHaveLength(3);
        expect(report?.sections[0].title).toBe('1.1 Caixa');
    });

    it('recusa conta que não é UUID sem consultar a API', async () => {
        expect(await getFullLedgerReportAction('x', '2026-10-01', '2026-10-31')).toBeNull();
        expect(apiFetch).not.toHaveBeenCalled();
    });
});
