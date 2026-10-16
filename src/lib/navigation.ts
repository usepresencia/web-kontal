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
    SlidersHorizontal,
    type LucideIcon,
} from 'lucide-react';

export type NavItem = { title: string; href: string; icon: LucideIcon };

export type NavSection = { title: string; items: NavItem[] };

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
            { title: 'Baixas', href: '/operacoes/baixas', icon: Receipt },
            { title: 'Séries', href: '/operacoes/series', icon: Repeat },
        ],
    },
    {
        title: 'Contabilidade',
        items: [
            { title: 'Lançamentos', href: '/contabilidade/lancamentos', icon: BookPlus },
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
            { title: 'Empresas', href: '/empresas', icon: Building2 },
            { title: 'Plano de contas', href: '/configuracoes/planos', icon: ListTree },
            { title: 'Presets', href: '/configuracoes/presets', icon: SlidersHorizontal },
        ],
    },
];
