import { cn } from '@/lib/_utils/cn';
import { daysAgoLabel } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import { initials } from '@/lib/_utils/text';
import { TITLE_STATUS_LABELS, TITLE_TYPE_LABELS } from '@/lib/_utils/title-labels';
import type { Title } from '@/lib/api/schemas/title';
import { Clock } from 'lucide-react';
import Link from 'next/link';

/** Últimas transações (títulos) da empresa: iniciais, descrição, valor e há quanto tempo. */
export function RecentTransactions({ titles }: { titles: Title[] }) {
    const now = new Date();

    return (
        <section className="glass-card p-5">
            <h2 className="text-foreground mb-4 text-sm font-semibold">Transações recentes</h2>

            {titles.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma transação registrada ainda.</p>
            ) : (
                <div className="space-y-3">
                    {titles.map(title => (
                        <Link
                            key={title.id}
                            href={`/operacoes/titulos/${title.id}`}
                            className="border-border/30 hover:bg-muted/50 -mx-2 flex items-center gap-3 border-b px-2 py-2 last:border-0"
                        >
                            <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                                {initials(title.description)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-foreground truncate text-sm font-medium">
                                    {title.description}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {TITLE_TYPE_LABELS[title.type]} ·{' '}
                                    {TITLE_STATUS_LABELS[title.status]}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                                <span
                                    className={cn(
                                        'text-sm font-semibold',
                                        title.type === 'INCOME' ? 'text-positive' : 'text-negative',
                                    )}
                                >
                                    {title.type === 'INCOME' ? '' : '-'}
                                    {formatAmount(title.amount)}
                                </span>
                                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                    <Clock className="size-3" aria-hidden="true" />
                                    {daysAgoLabel(title.createdAt, now)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
