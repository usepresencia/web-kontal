import type { Title } from '@/lib/api/schemas/title';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/_components/transactions/transaction-dialog', () => ({
    TransactionDialog: () => null,
}));
vi.mock('@/lib/_components/transactions/new-transaction-dialog', () => ({
    NewTransactionDialog: () => null,
}));

const title = (overrides: Partial<Title> = {}): Title => ({
    id: 't1',
    presetId: 'p1',
    partyId: 'c1',
    partyName: 'OpenAI',
    presetName: 'Licenças e Ferramentas',
    seriesId: null,
    seriesIndex: null,
    type: 'EXPENSE',
    status: 'SETTLED',
    description: 'ChatGPT',
    amount: '30.94',
    settledAmount: '30.94',
    remainingAmount: '0.00',
    issueDate: '2026-10-16',
    expirationDate: '2026-10-16',
    feesPercentageMonthly: 0,
    createdAt: '2026-10-20T10:00:00.000Z',
    ...overrides,
});

async function html(titles: Title[]) {
    const { RecentTransactions } = await import('./recent-transactions');
    return renderToStaticMarkup(<RecentTransactions titles={titles} openCount={0} query="" />);
}

describe('RecentTransactions', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 20, 12, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('mostra há quanto tempo foi a transação, e não a data de criação do registro', async () => {
        const markup = await html([title()]);
        expect(markup).toContain('4d atrás');
        expect(markup).not.toContain('hoje');
    });

    it('usa a data de implantação quando o título é de saldo inicial', async () => {
        const markup = await html([title({ openingDate: '2026-10-10', isOpening: true })]);
        expect(markup).toContain('10d atrás');
    });
});
