import { BusyProvider } from '@/lib/_components/busy-provider';
import type { Party } from '@/lib/api/schemas/party';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/parties', () => ({
    createPartyAction: vi.fn(),
    updatePartyAction: vi.fn(),
    deletePartyAction: vi.fn(),
}));
vi.mock('@/lib/_hooks/use-pagination-query', () => ({
    usePaginationQuery: () => ({ onPageChange: vi.fn(), onPageSizeChange: vi.fn() }),
}));

const { PartiesTable } = await import('./parties-table');
const { NewPartyDialog } = await import('./new-party-dialog');
const { PartyForm } = await import('./party-form');

const presets = [{ value: 'p1', label: 'Energia elétrica' }];

const party = (id: string, overrides: Partial<Party> = {}): Party => ({
    id,
    kind: 'SUPPLIER',
    name: `Parte ${id}`,
    socialReason: 'Razão',
    document: '11222333000181',
    email: '',
    phone: '',
    address: null,
    isActive: true,
    defaultPresetId: 'p1',
    defaultPresetName: 'Energia elétrica',
    createdAt: '2026-10-01T10:00:00.000Z',
    ...overrides,
});

const render = (items: Party[]) =>
    renderToStaticMarkup(
        <BusyProvider>
            <PartiesTable
                page={{ items, page: 1, pageSize: 10, total: items.length }}
                presets={presets}
            />
        </BusyProvider>,
    );

describe('PartiesTable', () => {
    it('usa a lista do padrão, sem tabela, com divisor entre os itens', () => {
        const html = render([party('a'), party('b')]);
        expect(html).not.toContain('<table');
        expect(html).toContain('lucide-users');
        expect((html.match(/role="separator"/g) ?? []).length).toBe(1);
    });

    it('abre os detalhes em modal e mostra tipo, documento formatado e preset padrão', () => {
        const html = render([party('a')]);
        expect(html).toContain('aria-haspopup="dialog"');
        expect(html).toContain('Fornecedor');
        expect(html).toContain('11.222.333/0001-81');
        expect(html).toContain('Energia elétrica');
    });

    it('mostra a situação do cadastro', () => {
        const html = render([party('a'), party('b', { isActive: false })]);
        expect(html).toContain('Ativo');
        expect(html).toContain('Inativo');
    });
});

describe('NewPartyDialog', () => {
    it('mostra o botão com o + antes do texto', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <NewPartyDialog presets={presets} />
            </BusyProvider>,
        );
        expect(html.indexOf('lucide-plus')).toBeLessThan(html.indexOf('Novo cliente/fornecedor'));
    });
});

describe('PartyForm', () => {
    const html = renderToStaticMarkup(
        <BusyProvider>
            <PartyForm action={vi.fn()} presets={presets} />
        </BusyProvider>,
    );

    it('usa pílulas, pede confirmação e oferece o histórico padrão e o endereço opcional', () => {
        expect(html).toContain('rounded-full');
        expect(html).toContain('Histórico padrão');
        expect(html).toContain('Endereço (opcional)');
        expect(html).not.toContain('type="submit"');
    });

    it('só mostra o status ao editar', () => {
        expect(html).not.toContain('name="isActive"');
        const editing = renderToStaticMarkup(
            <BusyProvider>
                <PartyForm action={vi.fn()} presets={presets} party={party('a')} />
            </BusyProvider>,
        );
        expect(editing).toContain('name="isActive"');
    });
});
