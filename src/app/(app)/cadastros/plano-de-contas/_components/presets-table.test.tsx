import { BusyProvider } from '@/lib/_components/busy-provider';
import type { Preset } from '@/lib/api/schemas/preset';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/billing', () => ({ getPlanAccountsAction: vi.fn() }));
vi.mock('@/actions/presets', () => ({
    updatePresetAction: vi.fn(),
    deletePresetAction: vi.fn(),
    createPresetAction: vi.fn(),
}));
vi.mock('@/lib/_hooks/use-pagination-query', () => ({
    usePaginationQuery: () => ({ onPageChange: vi.fn(), onPageSizeChange: vi.fn() }),
}));

const { PresetsTable } = await import('./presets-table');
const { NewPresetDialog } = await import('./new-preset-dialog');

const preset = (id: string, isActive = true): Preset => ({
    id,
    billingPlanId: 'p1',
    billingPlanName: 'Plano padrão',
    name: `Preset ${id}`,
    description: 'Contas do dia a dia',
    isActive,
    accounts: {} as Preset['accounts'],
    createdAt: '2026-10-01T10:00:00.000Z',
});

const render = (items: Preset[]) =>
    renderToStaticMarkup(
        <BusyProvider>
            <PresetsTable page={{ items, page: 1, pageSize: 10, total: items.length }} />
        </BusyProvider>,
    );

describe('PresetsTable', () => {
    it('usa a lista do padrão, sem tabela, com divisor entre os itens', () => {
        const html = render([preset('a'), preset('b')]);
        expect(html).not.toContain('<table');
        expect(html).toContain('lucide-sliders-horizontal');
        expect((html.match(/role="separator"/g) ?? []).length).toBe(1);
    });

    it('abre o modal de edição, sem link para outra página', () => {
        const html = render([preset('a')]);
        expect(html).toContain('aria-haspopup="dialog"');
        expect(html).not.toContain('href="/cadastros/plano-de-contas?aba=presets/');
    });

    it('mostra o plano, a descrição e a situação', () => {
        const html = render([preset('a'), preset('b', false)]);
        expect(html).toContain('Plano padrão');
        expect(html).toContain('Contas do dia a dia');
        expect(html).toContain('Ativo');
        expect(html).toContain('Inativo');
    });
});

describe('NewPresetDialog', () => {
    it('mostra o botão "Novo preset" com o + antes do texto', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <NewPresetDialog plans={[]} />
            </BusyProvider>,
        );
        expect(html.indexOf('lucide-plus')).toBeLessThan(html.indexOf('Novo preset'));
    });
});
