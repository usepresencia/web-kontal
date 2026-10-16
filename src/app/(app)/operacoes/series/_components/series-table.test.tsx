import { BusyProvider } from '@/lib/_components/busy-provider';
import type { Series } from '@/lib/api/schemas/title';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/titles', () => ({
    getSeriesAction: vi.fn(),
    cancelSeriesAction: vi.fn(),
    extendSeriesAction: vi.fn(),
}));
vi.mock('@/lib/_hooks/use-pagination-query', () => ({
    usePaginationQuery: () => ({ onPageChange: vi.fn(), onPageSizeChange: vi.fn() }),
}));

const { SeriesTable } = await import('./series-table');

const series = (id: string, overrides: Partial<Series> = {}): Series => ({
    id,
    kind: 'INSTALLMENT',
    frequency: 'MONTHLY',
    totalCount: 3,
    baseDescription: `Compra ${id}`,
    firstIssueDate: '2026-10-01',
    firstExpirationDate: '2026-11-10',
    createdAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
});

const render = (items: Series[]) =>
    renderToStaticMarkup(
        <BusyProvider>
            <SeriesTable page={{ items, page: 1, pageSize: 10, total: items.length }} />
        </BusyProvider>,
    );

describe('SeriesTable', () => {
    it('usa a lista do padrão, sem tabela, com divisor entre os itens', () => {
        const html = render([series('a'), series('b')]);
        expect(html).not.toContain('<table');
        expect(html).toContain('lucide-repeat');
        expect((html.match(/role="separator"/g) ?? []).length).toBe(1);
    });

    it('abre os detalhes em modal, sem link para outra página', () => {
        const html = render([series('a')]);
        expect(html).toContain('aria-haspopup="dialog"');
        expect(html).not.toContain('href="/operacoes/series/');
    });

    it('mostra o tipo, a frequência, as ocorrências e o primeiro vencimento', () => {
        const html = render([series('a')]);
        expect(html).toContain('Parcelado');
        expect(html).toContain('Mensal');
        expect(html).toContain('3 ocorrências');
        expect(html).toContain('10/11/2026');
    });

    it('chama a recorrência sem fim de "Sem fim" e usa "Parcelamentos" no rodapé', () => {
        const html = render([series('a', { kind: 'RECURRING', totalCount: null })]);
        expect(html).toContain('Sem fim');
        expect(html).toContain('Parcelamentos por página:');
    });
});
