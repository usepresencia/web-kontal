import { TransactionList } from '@/lib/_components/transactions/transaction-list';
import { daysAgoLabel, dueLabel } from '@/lib/_utils/dates';
import type { Title } from '@/lib/api/schemas/title';
import Link from 'next/link';

type UpcomingTitlesProps = {
    heading: string;
    /** Rota da lista completa do tipo. */
    href: string;
    titles: Title[];
    /** Total de títulos em aberto do tipo. */
    openCount: number;
    emptyText: string;
    query: string;
};

/** Próximos títulos em aberto por vencimento, com a situação do prazo; cada linha abre o modal de detalhes. */
export function UpcomingTitles({
    heading,
    href,
    titles,
    openCount,
    emptyText,
    query,
}: UpcomingTitlesProps) {
    const now = new Date();
    const rows = titles.map(title => ({
        title,
        ago: daysAgoLabel(title.createdAt, now),
        caption: dueLabel(title.expirationDate, now),
    }));

    return (
        <section className="bg-card rounded-2xl p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-foreground text-lg font-semibold">
                        {heading}
                    </h2>
                    <p className="text-muted-foreground text-xs">{openCount} em aberto</p>
                </div>
                <Link href={href} className="text-muted-foreground hover:text-foreground text-sm">
                    Ver todos
                </Link>
            </div>

            {titles.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    {query ? `Nada encontrado para "${query}".` : emptyText}
                </p>
            ) : (
                <TransactionList rows={rows} />
            )}
        </section>
    );
}
