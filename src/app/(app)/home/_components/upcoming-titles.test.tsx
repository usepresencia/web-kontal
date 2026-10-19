import type { Title } from '@/lib/api/schemas/title';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/_components/transactions/transaction-dialog', () => ({
    TransactionDialog: () => null,
}));

const title = (overrides: Partial<Title> = {}): Title => ({
    id: 't1',
    presetId: 'p1',
    partyId: 'c1',
    partyName: 'Copel',
    presetName: 'Energia',
    seriesId: null,
    seriesIndex: null,
    type: 'EXPENSE',
    status: 'OPEN',
    description: 'Conta de luz',
    amount: '150.00',
    settledAmount: '0.00',
    remainingAmount: '150.00',
    issueDate: '2026-10-01',
    expirationDate: '2020-01-01',
    feesPercentageMonthly: 0,
    createdAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
});

async function html(
    props: Partial<Parameters<typeof import('./upcoming-titles').UpcomingTitles>[0]>,
) {
    const { UpcomingTitles } = await import('./upcoming-titles');
    return renderToStaticMarkup(
        <UpcomingTitles
            heading="Próximos pagamentos"
            href="/operacoes/pagar"
            titles={[]}
            openCount={0}
            emptyText="Nenhum pagamento em aberto."
            query=""
            {...props}
        />,
    );
}

describe('UpcomingTitles', () => {
    it('mostra o título, o total em aberto e o link da lista completa', async () => {
        const markup = await html({ titles: [title()], openCount: 3 });
        expect(markup).toContain('Próximos pagamentos');
        expect(markup).toContain('3 em aberto');
        expect(markup).toContain('href="/operacoes/pagar"');
        expect(markup).toContain('Conta de luz');
    });

    it('marca o título vencido', async () => {
        expect(await html({ titles: [title()] })).toContain('venceu há');
    });

    it('mostra o texto de vazio', async () => {
        expect(await html({})).toContain('Nenhum pagamento em aberto.');
    });

    it('cita a busca quando ela não encontra nada', async () => {
        expect(await html({ query: 'luz' })).toContain('Nada encontrado para &quot;luz&quot;.');
    });
});
