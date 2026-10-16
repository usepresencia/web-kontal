import { cn } from '@/lib/_utils/cn';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type StatCardProps = {
    title: string;
    value: ReactNode;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: LucideIcon;
    description?: string;
};

/** Cartão de indicador: título, valor em destaque, ícone e variação opcional. */
export function StatCard({
    title,
    value,
    change,
    changeType = 'neutral',
    icon: Icon,
    description,
}: StatCardProps) {
    return (
        <div className="glass-card animate-fade-in p-5">
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        {title}
                    </p>
                    <p className="text-foreground text-2xl font-bold">{value}</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-2.5">
                    <Icon className="text-primary size-4" aria-hidden="true" />
                </div>
            </div>
            {(change || description) && (
                <div className="mt-3 flex items-center gap-1.5">
                    {change && (
                        <span
                            className={cn(
                                'text-xs font-medium',
                                changeType === 'positive' && 'text-positive',
                                changeType === 'negative' && 'text-negative',
                                changeType === 'neutral' && 'text-muted-foreground',
                            )}
                        >
                            {change}
                        </span>
                    )}
                    {description && (
                        <span className="text-muted-foreground text-xs">{description}</span>
                    )}
                </div>
            )}
        </div>
    );
}
