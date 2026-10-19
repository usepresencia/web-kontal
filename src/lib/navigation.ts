import {
    ArrowDownCircle,
    ArrowUpCircle,
    BookOpen,
    BookPlus,
    Building2,
    Coins,
    Home,
    Landmark,
    LineChart,
    ListTree,
    Lock,
    PiggyBank,
    Receipt,
    Repeat,
    Scale,
    Store,
    Users,
    type LucideIcon,
} from 'lucide-react';

export type NavItem = { title: string; href: string; icon: LucideIcon };

export type NavSection = {
    title: string;
    items: NavItem[];
    /** Seção só para o administrador da plataforma (`INTERNAL_ADMIN`). */
    platformOnly?: boolean;
};

/** Menu lateral em grupos; cada tela de migração acrescenta o seu item na seção certa. */
export const NAV_SECTIONS: NavSection[] = [
    {
        title: 'Principal',
        items: [{ title: 'Início', href: '/home', icon: Home }],
    },
    {
        title: 'Operações',
        items: [
            { title: 'Contas a pagar', href: '/operacoes/pagar', icon: ArrowUpCircle },
            { title: 'Contas a receber', href: '/operacoes/receber', icon: ArrowDownCircle },
            { title: 'Transações', href: '/operacoes/transacoes', icon: Receipt },
            { title: 'Parcelamentos', href: '/operacoes/parcelamentos', icon: Repeat },
        ],
    },
    {
        title: 'Contabilidade',
        items: [
            { title: 'Lançamentos contábeis', href: '/contabilidade/lancamentos', icon: BookPlus },
            { title: 'Fechamento', href: '/contabilidade/fechamento', icon: Lock },
        ],
    },
    {
        title: 'Relatórios',
        items: [
            { title: 'DRE', href: '/relatorios/dre', icon: LineChart },
            { title: 'DRE gerencial', href: '/relatorios/dre-gerencial', icon: PiggyBank },
            { title: 'Fluxo de caixa', href: '/relatorios/fluxo-de-caixa', icon: Coins },
            { title: 'Balancete', href: '/relatorios/balancete', icon: Scale },
            { title: 'Balanço', href: '/relatorios/balanco', icon: Landmark },
            { title: 'Livro diário', href: '/relatorios/diario', icon: BookOpen },
            { title: 'Razão', href: '/relatorios/razao', icon: BookOpen },
        ],
    },
    {
        title: 'Cadastros',
        items: [
            {
                title: 'Clientes e fornecedores',
                href: '/cadastros/clientes-fornecedores',
                icon: Users,
            },
            { title: 'Plano de contas', href: '/cadastros/plano-de-contas', icon: ListTree },
        ],
    },
    {
        title: 'Configurações',
        items: [{ title: 'Minha empresa', href: '/configuracoes/minha-empresa', icon: Store }],
    },
    {
        title: 'Plataforma',
        platformOnly: true,
        items: [{ title: 'Empresas da plataforma', href: '/plataforma/empresas', icon: Building2 }],
    },
];

/** Seções do menu que o usuário pode ver: as da plataforma só aparecem ao administrador. */
export function visibleSections(isPlatformAdmin: boolean): NavSection[] {
    return NAV_SECTIONS.filter(section => isPlatformAdmin || !section.platformOnly);
}
