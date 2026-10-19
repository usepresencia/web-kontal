import { BusyProvider } from '@/lib/_components/busy-provider';
import type { Company } from '@/lib/api/schemas/company';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/companies', () => ({
    deactivateCompanyAction: vi.fn(),
    createCompanyAction: vi.fn(),
    updateCompanyAction: vi.fn(),

    signLogoUploadAction: vi.fn(),
    saveLogoAction: vi.fn(),
    removeLogoAction: vi.fn(),
}));
vi.mock('@/actions/session', () => ({ selectCompanyAction: vi.fn() }));
vi.mock('@/lib/_hooks/use-pagination-query', () => ({
    usePaginationQuery: () => ({ onPageChange: vi.fn(), onPageSizeChange: vi.fn() }),
}));

const { CompaniesTable } = await import('./companies-table');
const { NewCompanyDialog } = await import('./new-company-dialog');
const { CompanyForm } = await import('@/lib/_components/company-form');

const company = (id: string, logoUrl: string | null = null): Company => ({
    id,
    name: `Empresa ${id}`,
    socialReason: 'Razão',
    cnpj: '12.345.678/0001-90',
    openingDate: '2020-01-01',
    cnae: '1',
    taxRegime: 'Simples',
    email: 'a@b.com',
    phone: '1',
    logoUrl,
    isActive: true,
    address: {
        zipCode: '1',
        street: 'Rua',
        number: '1',
        complement: null,
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
    },
    createdAt: '2026-10-01T10:00:00.000Z',
});

const render = (items: Company[]) =>
    renderToStaticMarkup(
        <BusyProvider>
            <CompaniesTable page={{ items, page: 1, pageSize: 10, total: items.length }} />
        </BusyProvider>,
    );

describe('CompaniesTable', () => {
    it('usa a lista do padrão, sem tabela, com divisor entre os itens', () => {
        const html = render([company('a'), company('b')]);
        expect(html).not.toContain('<table');
        expect(html).toContain('lucide-building-2');
        expect((html.match(/role="separator"/g) ?? []).length).toBe(1);
    });

    it('abre os detalhes em modal e mostra CNPJ e cidade', () => {
        const html = render([company('a')]);
        expect(html).toContain('aria-haspopup="dialog"');
        expect(html).toContain('12.345.678/0001-90');
        expect(html).toContain('São Paulo/SP');
    });

    it('mostra o logo no lugar do ícone quando a empresa tem logo', () => {
        const html = render([company('a', 'https://img/logo.png')]);
        expect(html).toContain('https://img/logo.png');
        expect(html).not.toContain('lucide-building-2');
    });
});

describe('botão do cabeçalho', () => {
    it('"Nova empresa" leva o + antes do texto', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <NewCompanyDialog />
            </BusyProvider>,
        );
        expect(html.indexOf('lucide-plus')).toBeLessThan(html.indexOf('Nova empresa'));
    });
});

describe('CompanyForm', () => {
    const html = renderToStaticMarkup(
        <BusyProvider>
            <CompanyForm action={vi.fn()} />
        </BusyProvider>,
    );

    it('usa os campos em pílula, em dois blocos, e pede confirmação', () => {
        expect(html).toContain('rounded-full');
        expect(html).toContain('Dados da empresa');
        expect(html).toContain('Endereço');
        expect(html).not.toContain('<fieldset');
        expect(html).not.toContain('type="submit"');
    });
});
