import { BusyProvider } from '@/lib/_components/busy-provider';
import type { TitleEntry } from '@/lib/api/schemas/title';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/titles', () => ({ getTitleAction: vi.fn(), getTitleEntriesAction: vi.fn() }));
vi.mock('@/lib/_hooks/use-pagination-query', () => ({
    usePaginationQuery: () => ({ onPageChange: vi.fn(), onPageSizeChange: vi.fn() }),
}));

const { TransactionsTable } = await import('./transactions-table');

const entry = (id: string, overrides: Partial<TitleEntry> = {}): TitleEntry => ({
    id,
    titleId: `t-${id}`,
    titleDescription: `Título ${id}`,
    titleType: 'EXPENSE',
    kind: 'PAYMENT',
    billingAccountId: 'a1',
    billingAccountName: 'Caixa',
    principalAmount: '10.00',
    interestAmount: '0.00',
    fineAmount: '0.00',
    discountAmount: '0.00',
    totalAmount: '10.00',
    paidAt: '2026-10-16',
    paymentMethod: 'PIX',
    description: null,
    createdAt: '2026-10-16T10:00:00.000Z',
    ...overrides,
});

const render = (items: TitleEntry[]) =>
    renderToStaticMarkup(
        <BusyProvider>
            <TransactionsTable page={{ items, page: 1, pageSize: 10, total: items.length }} />
        </BusyProvider>,
    );

describe('TransactionsTable', () => {
    it('usa a lista do padrão das contas, sem tabela, com divisor entre os itens', () => {
        const html = render([entry('a'), entry('b')]);
        expect(html).not.toContain('<table');
        expect(html).toContain('lucide-credit-card');
        expect((html.match(/role="separator"/g) ?? []).length).toBe(1);
    });

    it('mostra a recebida em verde com + e a paga em vermelho com -', () => {
        const income = render([entry('a', { titleType: 'INCOME' })]);
        const expense = render([entry('a')]);
        expect(income).toContain('text-positive');
        expect(income).toContain('+');
        expect(expense).toContain('text-negative');
    });

    it('abre os detalhes em modal, sem navegar para outra página', () => {
        const html = render([entry('a')]);
        expect(html).toContain('aria-haspopup="dialog"');
        expect(html).not.toContain('href="/operacoes/titulos');
    });

    it('mostra forma, conta e data da baixa', () => {
        const html = render([entry('a')]);
        expect(html).toContain('Pix');
        expect(html).toContain('Caixa');
        expect(html).toContain('16/10/2026');
    });

    it('chama a baixa por perda de "Perda"', () => {
        expect(render([entry('a', { kind: 'WRITE_OFF', paymentMethod: null })])).toContain('Perda');
    });

    it('não repete "A pagar" nem "A receber" numa baixa já registrada', () => {
        expect(render([entry('a')])).not.toContain('A pagar');
        expect(render([entry('a', { titleType: 'INCOME' })])).not.toContain('A receber');
    });
});
