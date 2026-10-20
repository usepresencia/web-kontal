import { NewTransactionDialog } from '@/lib/_components/transactions/new-transaction-dialog';
import { TransactionList } from '@/lib/_components/transactions/transaction-list';
import { daysAgoLabel, transactionDate } from '@/lib/_utils/dates';
import type { Title } from '@/lib/api/schemas/title';
import Link from 'next/link';

type RecentTransactionsProps = {
    titles: Title[];
    /** Total de títulos em aberto da empresa. */
    openCount: number;
    query: string;
};

/** Últimas transações (títulos): iniciais, descrição, tipo, situação, valor e há quanto tempo. */
export function RecentTransactions({ titles, openCount, query }: RecentTransactionsProps) {
    const now = new Date();
    const rows = titles.map(title => ({ title, ago: daysAgoLabel(transactionDate(title), now) }));

    return (
        <section className="bg-card rounded-2xl p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-foreground text-lg font-semibold">
                        Transações recentes
                    </h2>
                    <p className="text-muted-foreground text-xs">{openCount} em aberto</p>
                </div>
                <div className="flex items-center gap-4">
                    <Link
                        href="/operacoes/pagar"
                        className="text-muted-foreground hover:text-foreground text-sm"
                    >
                        Ver todas
                    </Link>
                    <NewTransactionDialog />
                </div>
            </div>

            {titles.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    {query
                        ? `Nenhuma transação encontrada para "${query}".`
                        : 'Nenhuma transação registrada ainda.'}
                </p>
            ) : (
                <TransactionList rows={rows} />
            )}
        </section>
    );
}
