import { BusyProvider } from '@/lib/_components/busy-provider';
import type { Tenant } from '@/lib/api/schemas/tenant';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/session', () => ({
    selectCompanyAction: vi.fn(),
}));

const { CompanyList } = await import('./company-list');

const tenant = (companyId: string, name: string): Tenant => ({
    companyId,
    name,
    role: 'OWNER',
    isActive: true,
});

describe('CompanyList', () => {
    it('renderiza o seletor em dropdown com "Selecione..." e o botão Continuar desabilitado quando há múltiplas empresas', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <CompanyList
                    tenants={[
                        tenant('c1', 'Horizonte Comércio Digital'),
                        tenant('c2', 'Kontal Tecnologia & Gestão'),
                    ]}
                />
            </BusyProvider>,
        );
        expect(html).toContain('Selecione...');
        expect(html).toContain('Continuar');
        expect(html).toContain('aria-haspopup="listbox"');
        expect(html).toContain('lucide-building-2');
        expect(html).not.toContain('OWNER');
    });

    it('pré-seleciona a empresa quando o usuário possui apenas uma', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <CompanyList tenants={[tenant('c1', 'Kontal Tecnologia & Gestão')]} />
            </BusyProvider>,
        );
        expect(html).toContain('Kontal Tecnologia &amp; Gestão');
    });
});
