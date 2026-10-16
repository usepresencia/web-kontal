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

export type NavItem = { label: string; href: string; icon: LucideIcon };

/** Itens do menu lateral; cada tela de migração acrescenta o seu item. */
export const NAV_ITEMS: NavItem[] = [
    { label: 'Início', href: '/home', icon: Home },
    { label: 'Empresas', href: '/empresas', icon: Building2 },
    { label: 'Contas a pagar', href: '/operacoes/pagar', icon: ArrowUpCircle },
    { label: 'Contas a receber', href: '/operacoes/receber', icon: ArrowDownCircle },
    { label: 'Baixas', href: '/operacoes/baixas', icon: Receipt },
    { label: 'Séries', href: '/operacoes/series', icon: Repeat },
    { label: 'Lançamentos', href: '/contabilidade/lancamentos', icon: BookPlus },
    { label: 'Fechamento', href: '/contabilidade/fechamento', icon: Lock },
    { label: 'Fluxo de caixa', href: '/relatorios/fluxo-de-caixa', icon: Coins },
    { label: 'DRE gerencial', href: '/relatorios/dre-gerencial', icon: PiggyBank },
    { label: 'DRE', href: '/relatorios/dre', icon: LineChart },
    { label: 'Balancete', href: '/relatorios/balancete', icon: Scale },
    { label: 'Balanço', href: '/relatorios/balanco', icon: Landmark },
    { label: 'Livro diário', href: '/relatorios/diario', icon: BookOpen },
    { label: 'Razão', href: '/relatorios/razao', icon: BookOpen },
    { label: 'Plano de contas', href: '/configuracoes/planos', icon: ListTree },
    { label: 'Presets', href: '/configuracoes/presets', icon: SlidersHorizontal },
];
