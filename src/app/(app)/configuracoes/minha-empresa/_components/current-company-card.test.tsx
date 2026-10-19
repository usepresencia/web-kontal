import { BusyProvider } from '@/lib/_components/busy-provider';
import type { Company } from '@/lib/api/schemas/company';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/companies', () => ({
    getCurrentCompanyAction: vi.fn(),
    updateCompanyAction: vi.fn(),
    signLogoUploadAction: vi.fn(),
    saveLogoAction: vi.fn(),
    removeLogoAction: vi.fn(),
}));

const { CurrentCompanyCard } = await import('./current-company-card');

const mockCompany: Company = {
    id: 'company-1',
    name: 'Empresa Teste',
    socialReason: 'Empresa Teste Ltda',
    cnpj: '12345678000100',
    openingDate: '2020-01-01',
    cnae: '6201-5/01',
    taxRegime: 'Simples Nacional',
    email: 'contato@teste.com',
    phone: '11999999999',
    logoUrl: null,
    isActive: true,
    createdAt: '2020-01-01T00:00:00Z',
    address: {
        zipCode: '01310-100',
        street: 'Av. Paulista',
        number: '1000',
        complement: null,
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
    },
};

describe('CurrentCompanyCard', () => {
    it('exibe o nome da empresa no card clicável', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <CurrentCompanyCard company={mockCompany} />
            </BusyProvider>,
        );
        expect(html).toContain('Empresa Teste');
        expect(html).toContain('aria-haspopup="dialog"');
    });

    it('exibe razão social e CNPJ no subtítulo', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <CurrentCompanyCard company={mockCompany} />
            </BusyProvider>,
        );
        expect(html).toContain('Empresa Teste Ltda');
        expect(html).toContain('12.345.678/0001-00');
    });

    it('exibe cidade/estado e e-mail no subtítulo', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <CurrentCompanyCard company={mockCompany} />
            </BusyProvider>,
        );
        expect(html).toContain('São Paulo');
        expect(html).toContain('SP');
        expect(html).toContain('contato@teste.com');
    });

    it('não renderiza o botão "Editar empresa atual" separado', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <CurrentCompanyCard company={mockCompany} />
            </BusyProvider>,
        );
        expect(html).not.toContain('Editar empresa atual');
    });

    it('usa o padrão de lista com section e ul', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <CurrentCompanyCard company={mockCompany} />
            </BusyProvider>,
        );
        expect(html).toContain('<section');
        expect(html).toContain('<ul');
        expect(html).toContain('<li');
    });
});
