export const ACCOUNT_TYPE_LABELS = {
    ANALYTIC: 'Analítica',
    SYNTHETIC: 'Sintética',
} as const;

export const NATURE_LABELS = {
    ASSET: 'Ativo',
    LIABILITY: 'Passivo',
    EQUITY: 'Patrimônio líquido',
    REVENUE: 'Receita',
    EXPENSE: 'Despesa',
} as const;

export const DRE_CATEGORY_LABELS = {
    GROSS_REVENUE: 'Receita bruta',
    FINANCIAL_REVENUE: 'Receita financeira',
    OTHER_REVENUE: 'Outras receitas',
    REVENUE_DEDUCTION: 'Deduções da receita',
    COST_OF_SALES: 'Custo das vendas',
    OPERATING_EXPENSE: 'Despesa operacional',
    FINANCIAL_EXPENSE: 'Despesa financeira',
    OTHER_EXPENSE: 'Outras despesas',
    INCOME_TAX: 'Imposto de renda',
} as const;

export const BALANCE_CATEGORY_LABELS = {
    CURRENT_ASSET: 'Ativo circulante',
    NON_CURRENT_ASSET: 'Ativo não circulante',
    CURRENT_LIABILITY: 'Passivo circulante',
    NON_CURRENT_LIABILITY: 'Passivo não circulante',
    EQUITY: 'Patrimônio líquido',
} as const;

/** Categorias de DRE aceitas para cada natureza de conta. */
export const DRE_CATEGORIES_BY_NATURE: Record<string, (keyof typeof DRE_CATEGORY_LABELS)[]> = {
    REVENUE: ['GROSS_REVENUE', 'FINANCIAL_REVENUE', 'OTHER_REVENUE'],
    EXPENSE: [
        'REVENUE_DEDUCTION',
        'COST_OF_SALES',
        'OPERATING_EXPENSE',
        'FINANCIAL_EXPENSE',
        'OTHER_EXPENSE',
        'INCOME_TAX',
    ],
};

/** Categorias de balanço aceitas para cada natureza de conta. */
export const BALANCE_CATEGORIES_BY_NATURE: Record<
    string,
    (keyof typeof BALANCE_CATEGORY_LABELS)[]
> = {
    ASSET: ['CURRENT_ASSET', 'NON_CURRENT_ASSET'],
    LIABILITY: ['CURRENT_LIABILITY', 'NON_CURRENT_LIABILITY'],
    EQUITY: ['EQUITY'],
};

export const COST_BEHAVIOR_LABELS = {
    VARIABLE: 'Variável',
    FIXED: 'Fixo',
    DEPRECIATION: 'Depreciação',
} as const;
