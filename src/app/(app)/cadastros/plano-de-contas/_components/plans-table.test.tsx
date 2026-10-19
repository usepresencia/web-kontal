import { BusyProvider } from '@/lib/_components/busy-provider';
import type { BillingAccount, BillingPlan } from '@/lib/api/schemas/billing';
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
    ({
        id,
        name: `Plano ${id}`,
        description,
        isDefault: false,
        createdAt: '2026-01-01',
    }) as BillingPlan;

const render = (items: BillingPlan[]) =>
    renderToStaticMarkup(
        <BusyProvider>
            <PlansTable page={{ items, page: 1, pageSize: 10, total: items.length }} />
        </BusyProvider>,
    );

describe('PlansTable', () => {
    it('mostra o selo Padrão só no plano padrão', () => {
        const html = render([{ ...plan('a'), isDefault: true }, plan('b')]);
        expect((html.match(/>Padrão</g) ?? []).length).toBe(1);
    });

    it('usa a lista no padrão das demais telas, sem tabela, com divisor entre os itens', () => {
        const html = render([plan('a'), plan('b')]);
        expect(html).not.toContain('<table');
        expect(html).toContain('lucide-list-tree');
        expect((html.match(/role="separator"/g) ?? []).length).toBe(1);
    });

    it('avança para os detalhes do plano ao clicar na linha', () => {
        const html = render([plan('p1')]);
        expect(html).toContain('href="/cadastros/plano-de-contas/p1"');
        expect(html).toContain('lucide-chevron-right');
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
    const sampleAccounts: BillingAccount[] = [
        {
            id: 'a1',
            name: 'Caixa',
            code: '1.1.1',
            level: 3,
            accountType: 'ANALYTIC',
            nature: 'ASSET',
            dreCategory: null,
            balanceCategory: null,
            isActive: true,
            billingPlanId: 'p1',
            parentId: null,
            createdAt: '2026-01-01',
        },
    ];

    const html = (editing: boolean, defaultParentId?: string) =>
        renderToStaticMarkup(
            <BusyProvider>
                <AccountForm
                    planId="p1"
                    accounts={sampleAccounts}
                    defaultParentId={defaultParentId}
                    account={editing ? sampleAccounts[0] : undefined}
                />
            </BusyProvider>,
        );

    it('usa os campos em pílula e pede confirmação antes de salvar', () => {
        const markup = html(false);
        expect(markup).toContain('rounded-full');
        expect(markup).not.toContain('type="submit"');
    });

    it('pede a natureza só ao criar, o status só ao editar e a conta pai nos dois', () => {
        expect(html(false)).toContain('name="nature"');
        expect(html(false)).not.toContain('name="isActive"');
        expect(html(true)).toContain('name="isActive"');
        expect(html(true)).not.toContain('name="nature"');
        expect(html(false)).toContain('name="parentId"');
        expect(html(true)).toContain('name="parentId"');
    });

    it('pré-seleciona a conta pai ao criar subconta com defaultParentId', () => {
        const markup = html(false, 'a1');
        expect(markup).toContain('value="a1"');
    });
});
