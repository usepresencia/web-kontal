import { BusyProvider } from '@/lib/_components/busy-provider';
import type { BillingPlan } from '@/lib/api/schemas/billing';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/billing', () => ({
    getPlanAccountsAction: vi.fn(),
    updatePlanAction: vi.fn(),
    deletePlanAction: vi.fn(),
    deleteAccountAction: vi.fn(),
    createPlanAction: vi.fn(),
    createAccountAction: vi.fn(),
    updateAccountAction: vi.fn(),
}));
vi.mock('@/lib/_hooks/use-pagination-query', () => ({
    usePaginationQuery: () => ({ onPageChange: vi.fn(), onPageSizeChange: vi.fn() }),
}));

const { PlansTable } = await import('./plans-table');
const { NewPlanDialog } = await import('./new-plan-dialog');
const { AccountForm } = await import('./account-form');

const plan = (id: string, description: string | null = 'Plano de serviços'): BillingPlan =>
    ({ id, name: `Plano ${id}`, description }) as BillingPlan;

const render = (items: BillingPlan[]) =>
    renderToStaticMarkup(
        <BusyProvider>
            <PlansTable page={{ items, page: 1, pageSize: 10, total: items.length }} />
        </BusyProvider>,
    );

describe('PlansTable', () => {
    it('usa a lista do padrão, sem tabela, com divisor entre os itens', () => {
        const html = render([plan('a'), plan('b')]);
        expect(html).not.toContain('<table');
        expect(html).toContain('lucide-list-tree');
        expect((html.match(/role="separator"/g) ?? []).length).toBe(1);
    });

    it('abre o modal do plano, sem link para outra página', () => {
        const html = render([plan('a')]);
        expect(html).toContain('aria-haspopup="dialog"');
        expect(html).not.toContain('href="/cadastros/plano-de-contas/');
    });

    it('mostra a descrição ou "Sem descrição"', () => {
        expect(render([plan('a')])).toContain('Plano de serviços');
        expect(render([plan('a', null)])).toContain('Sem descrição');
    });
});

describe('NewPlanDialog', () => {
    it('mostra o botão "Novo plano" com o + antes do texto', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <NewPlanDialog />
            </BusyProvider>,
        );
        expect(html.indexOf('lucide-plus')).toBeLessThan(html.indexOf('Novo plano'));
    });
});

describe('AccountForm', () => {
    const html = (editing: boolean) =>
        renderToStaticMarkup(
            <BusyProvider>
                <AccountForm
                    planId="p1"
                    accounts={[]}
                    account={
                        editing
                            ? ({
                                  id: 'a1',
                                  name: 'Caixa',
                                  accountType: 'ANALYTIC',
                                  nature: 'ASSET',
                                  isActive: true,
                              } as never)
                            : undefined
                    }
                />
            </BusyProvider>,
        );

    it('usa os campos em pílula e pede confirmação antes de salvar', () => {
        const markup = html(false);
        expect(markup).toContain('rounded-full');
        expect(markup).not.toContain('type="submit"');
    });

    it('só pede conta pai e natureza ao criar, e o status ao editar', () => {
        expect(html(false)).toContain('name="parentId"');
        expect(html(false)).not.toContain('name="isActive"');
        expect(html(true)).toContain('name="isActive"');
        expect(html(true)).not.toContain('name="parentId"');
    });
});
