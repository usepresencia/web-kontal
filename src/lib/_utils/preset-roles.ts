export const PRESET_ROLE_NATURE = {
    receivable: 'ASSET',
    payable: 'LIABILITY',
    revenue: 'REVENUE',
    expense: 'EXPENSE',
    interestIncome: 'REVENUE',
    discountGranted: 'EXPENSE',
    badDebt: 'EXPENSE',
    interestExpense: 'EXPENSE',
    discountObtained: 'REVENUE',
    debtForgiveness: 'REVENUE',
    openingBalance: 'EQUITY',
} as const;

export type PresetRole = keyof typeof PRESET_ROLE_NATURE;

export const PRESET_ROLES = Object.keys(PRESET_ROLE_NATURE) as PresetRole[];

export const REQUIRED_ROLES: PresetRole[] = ['receivable', 'payable'];

export const PRESET_ROLE_LABELS: Record<PresetRole, string> = {
    receivable: 'Contas a receber',
    payable: 'Contas a pagar',
    revenue: 'Receita',
    expense: 'Despesa',
    interestIncome: 'Receita de juros',
    discountGranted: 'Desconto concedido',
    badDebt: 'Perda com inadimplência',
    interestExpense: 'Despesa de juros',
    discountObtained: 'Desconto obtido',
    debtForgiveness: 'Perdão de dívida',
    openingBalance: 'Saldos iniciais (implantação)',
};

type AccountLike = {
    accountType: 'ANALYTIC' | 'SYNTHETIC';
    nature: string;
    isActive: boolean;
};

/** Contas que o papel aceita: analíticas, ativas e da natureza exigida pelo papel. */
export function accountsForRole<T extends AccountLike>(accounts: T[], role: PresetRole): T[] {
    return accounts.filter(
        account =>
            account.accountType === 'ANALYTIC' &&
            account.isActive &&
            account.nature === PRESET_ROLE_NATURE[role],
    );
}
