import { StatCard } from '@/lib/_components/stat-card';
import { cn } from '@/lib/_utils/cn';
import { formatAmount } from '@/lib/_utils/money';
import type { LucideIcon } from 'lucide-react';

type SummaryCardProps = {
    title: string;
    amount: string;
    icon: LucideIcon;
    tone?: 'positive' | 'negative' | 'auto';
};

/** Indicador financeiro do mês; a cor do valor segue o tom ou o sinal. */
export function SummaryCard({ title, amount, icon, tone }: SummaryCardProps) {
    const negative = tone === 'negative' || (tone === 'auto' && amount.startsWith('-'));
    const color = negative ? 'text-negative' : tone ? 'text-positive' : '';

    return (
        <StatCard
            title={title}
            value={<span className={cn(color)}>{formatAmount(amount)}</span>}
            icon={icon}
            description="no mês corrente"
        />
    );
}
