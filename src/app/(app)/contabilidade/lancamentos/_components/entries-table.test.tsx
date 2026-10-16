import { BusyProvider } from '@/lib/_components/busy-provider';
import type { JournalDetail } from '@/lib/api/schemas/journal';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/journal', () => ({
    getJournalEntryAction: vi.fn(),
    reverseEntryAction: vi.fn(),
}));
vi.mock('@/lib/_hooks/use-pagination-query', () => ({
    usePaginationQuery: () => ({ onPageChange: vi.fn(), onPageSizeChange: vi.fn() }),
}));

const { EntriesTable } = await import('./entries-table');

const entry = (id: string, referenceType: string | null = 'MANUAL'): JournalDetail => ({
    id,
    number: 7,
    date: '2026-10-16',
    description: `Lançamento ${id}`,
    referenceType,
    totalDebits: '120.00',
    totalCredits: '120.00',
    lines: [],
});

const render = (items: JournalDetail[]) =>
    renderToStaticMarkup(
        <BusyProvider>
            <EntriesTable page={{ items, page: 1, pageSize: 10, total: items.length }} />
        </BusyProvider>,
    );

describe('EntriesTable', () => {
    it('usa a lista do padrão, sem tabela, com divisor entre os itens', () => {
        const html = render([entry('a'), entry('b')]);
        expect(html).not.toContain('<table');
        expect(html).toContain('lucide-book-open');
        expect((html.match(/role="separator"/g) ?? []).length).toBe(1);
    });

    it('abre os detalhes em modal, sem link para outra página', () => {
        const html = render([entry('a')]);
        expect(html).toContain('aria-haspopup="dialog"');
        expect(html).not.toContain('href="/contabilidade/lancamentos/');
    });

    it('mostra número, origem, valor e data', () => {
        const html = render([entry('a')]);
        expect(html).toContain('Nº 7');
        expect(html).toContain('Manual');
        expect(html).toContain('R$ 120,00');
        expect(html).toContain('16/10/2026');
    });

    it('chama de transação a origem que vem da baixa de um título', () => {
        expect(render([entry('a', 'SETTLEMENT')])).toContain('Transação');
        expect(render([entry('a', 'SETTLEMENT_REVERSAL')])).toContain('Estorno de transação');
        expect(render([entry('a', 'SETTLEMENT')])).not.toContain('Baixa');
    });
});
