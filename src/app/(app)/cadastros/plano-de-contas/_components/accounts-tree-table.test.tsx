import { BusyProvider } from '@/lib/_components/busy-provider';
import type { BillingAccount, BillingPlan } from '@/lib/api/schemas/billing';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock('@/actions/billing', () => ({
    getPlanAccountsAction: vi.fn(),
    updatePlanAction: vi.fn(),
    deletePlanAction: vi.fn(),
    setDefaultPlanAction: vi.fn(),
    deleteAccountAction: vi.fn(),
    createPlanAction: vi.fn(),
    createAccountAction: vi.fn(),
    updateAccountAction: vi.fn(),
}));

const { AccountsTreeTable } = await import('./accounts-tree-table');

const plan: BillingPlan = {
    id: 'p1',
    name: 'Plano Geral',
    description: 'Plano padrão da empresa',
    isDefault: false,
    createdAt: '2026-01-01',
};

const sampleAccounts: BillingAccount[] = [
    {
        id: 'acc-1',
        name: 'ATIVO',
        code: '1',
        level: 1,
        accountType: 'SYNTHETIC',
        nature: 'ASSET',
        dreCategory: null,
        balanceCategory: null,
        isActive: true,
        billingPlanId: 'p1',
        parentId: null,
        createdAt: '2026-01-01',
    },
    {
        id: 'acc-1-1',
        name: 'Ativo Circulante',
        code: '1.1',
        level: 2,
        accountType: 'SYNTHETIC',
        nature: 'ASSET',
        dreCategory: null,
        balanceCategory: null,
        isActive: true,
        billingPlanId: 'p1',
        parentId: 'acc-1',
        createdAt: '2026-01-01',
    },
    {
        id: 'acc-1-1-1',
        name: 'Caixa Geral',
        code: '1.1.1',
        level: 3,
        accountType: 'ANALYTIC',
        nature: 'ASSET',
        dreCategory: null,
        balanceCategory: null,
        isActive: true,
        billingPlanId: 'p1',
        parentId: 'acc-1-1',
        createdAt: '2026-01-01',
    },
];

const renderTree = (accounts: BillingAccount[] = sampleAccounts, current: BillingPlan = plan) =>
    renderToStaticMarkup(
        <BusyProvider>
            <AccountsTreeTable plan={current} initialAccounts={accounts} />
        </BusyProvider>,
    );

describe('AccountsTreeTable (Árvore de contas nos detalhes do plano)', () => {
    it('marca o plano padrão com o selo e não marca os demais', () => {
        expect(renderTree(sampleAccounts, { ...plan, isDefault: true })).toContain('Padrão');
        expect(renderTree()).not.toContain('>Padrão<');
    });

    it('segue o padrão de UI de tabelas das demais telas sem a tag <table>', () => {
        const html = renderTree();
        expect(html).not.toContain('<table');
        expect(html).toContain('role="separator"');
        expect(html).toContain('lucide-chevron-right');
    });

    it('apresenta a árvore hierárquica com recuo pelo nível da conta', () => {
        const html = renderTree();
        expect(html).toContain('ATIVO');
        expect(html).toContain('Ativo Circulante');
        expect(html).toContain('Caixa Geral');
        // Nível 3 tem recuo (3 - 1) * 20 = 40px
        expect(html).toContain('padding-left:40px');
    });

    it('exibe o botão Nova conta e não exibe botões de expandir/recolher globais', () => {
        const html = renderTree();
        expect(html).toContain('Nova conta');
        expect(html).not.toContain('Expandir');
        expect(html).not.toContain('Recolher todas as contas');
    });

    it('exibe ação de toggle em contas com filhas', () => {
        const html = renderTree();
        expect(html).toContain('aria-label="Recolher conta ATIVO"');
        expect(html).toContain('aria-label="Recolher conta Ativo Circulante"');
    });

    it('exibe mensagem quando o plano não tem contas', () => {
        const html = renderTree([]);
        expect(html).toContain('Plano sem contas');
    });
});
