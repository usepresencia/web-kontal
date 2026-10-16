import { cn } from '@/lib/_utils/cn';
import { daysAgoLabel } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import { initials } from '@/lib/_utils/text';
import { TITLE_STATUS_LABELS, TITLE_TYPE_LABELS } from '@/lib/_utils/title-labels';
import type { Title } from '@/lib/api/schemas/title';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { NewTransactionMenu } from './new-transaction-menu';

type RecentTransactionsProps = {
    titles: Title[];
    /** Total de títulos em aberto da empresa. */
    openCount: number;
    query: string;
};

/** Últimas transações (títulos): iniciais, descrição, tipo, situação, valor e há quanto tempo. */
export function RecentTransactions({ titles, openCount, query }: RecentTransactionsProps) {
    const now = new Date();

    return (
        <section className="bg-card rounded-3xl p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-foreground text-2xl font-semibold">
                        Transações recentes
                    </h2>
                    <p className="text-muted-foreground text-sm">{openCount} em aberto</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/operacoes/pagar"
                        className="text-muted-foreground hover:text-foreground text-base"
                    >
                        Ver todas
                    </Link>
                    <NewTransactionMenu />
                </div>
            </div>

            {titles.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    {query
                        ? `Nenhuma transação encontrada para "${query}".`
                        : 'Nenhuma transação registrada ainda.'}
                </p>
            ) : (
                <ul className="space-y-1">
                    {titles.map(title => {
                        const income = title.type === 'INCOME';
                        return (
                            <li key={title.id}>
                                <Link
                                    href={`/operacoes/titulos/${title.id}`}
                                    className="hover:bg-muted/50 -mx-3 flex items-center gap-4 rounded-2xl px-3 py-3"
                                >
                                    <div
                                        className={cn(
                                            'flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                                            income
                                                ? 'bg-positive/10 text-positive'
                                                : 'bg-negative/10 text-negative',
                                        )}
                                    >
                                        {initials(title.description)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-foreground truncate text-lg font-medium">
                                            {title.description}
                                        </p>
                                        <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                            {TITLE_TYPE_LABELS[title.type]}
                                            <span className="bg-muted rounded-full px-2.5 py-0.5 text-xs">
                                                {TITLE_STATUS_LABELS[title.status]}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span
                                            className={cn(
                                                'text-lg font-semibold',
                                                income ? 'text-positive' : 'text-negative',
                                            )}
                                        >
                                            {income ? '+' : '-'}
                                            {formatAmount(title.amount)}
                                        </span>
                                        <span className="text-muted-foreground flex items-center gap-1 text-sm">
                                            <Clock className="size-3.5" aria-hidden="true" />
                                            {daysAgoLabel(title.createdAt, now)}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
