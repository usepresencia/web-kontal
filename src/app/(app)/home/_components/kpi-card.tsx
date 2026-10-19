import { cn } from '@/lib/_utils/cn';
import type { LucideIcon } from 'lucide-react';

type KpiCardProps = {
    title: string;
    value: string;
    tone: 'positive' | 'negative';
    icon: LucideIcon;
    description: string;
    /** Variação sobre o mês anterior; `favorable` define a cor (despesa subindo é ruim). */
    change?: { label: string; favorable: boolean };
};

/** Cartão de indicador do mês: valor grande, ícone em círculo e variação sobre o mês anterior. */
export function KpiCard({ title, value, tone, icon: Icon, description, change }: KpiCardProps) {
    const toneText = tone === 'positive' ? 'text-positive' : 'text-negative';
    const toneSoft = tone === 'positive' ? 'bg-positive/10' : 'bg-negative/10';

    return (
        <div className="bg-card animate-fade-in flex flex-col justify-between rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {title}
                </p>
                <div
                    className={cn('flex size-9 items-center justify-center rounded-full', toneSoft)}
                >
                    <Icon className={cn('size-4', toneText)} aria-hidden="true" />
                </div>
            </div>
            <p className={cn('font-display my-4 text-2xl font-bold tracking-tight', toneText)}>
                {value}
            </p>
            <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs">{description}</span>
                {change && (
                    <span
                        className={cn(
                            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            change.favorable
                                ? 'bg-positive/10 text-positive'
                                : 'bg-negative/10 text-negative',
                        )}
                    >
                        {change.label}
                    </span>
                )}
            </div>
        </div>
    );
}
