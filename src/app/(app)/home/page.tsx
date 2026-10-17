import { EmptyState } from '@/lib/_components/empty-state';
import { currentMonthRange, monthAbbreviation, previousMonthRange } from '@/lib/_utils/dates';
import { matchesQuery, percentChange, shareOfTotal } from '@/lib/_utils/kpi';
import { formatAmount } from '@/lib/_utils/money';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { dreSummarySchema, type DreSummary } from '@/lib/api/schemas/dre';
import { titlePageSchema, type Title } from '@/lib/api/schemas/title';
import { requireSession } from '@/lib/auth/session';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { HomeHeader } from './_components/home-header';
import { KpiCard } from './_components/kpi-card';
import { RecentTransactions } from './_components/recent-transactions';
import { ResultCard } from './_components/result-card';

const RECENT_COUNT = 5;

/** Executa a consulta e devolve o `fallback` em erro 4xx da API (ex.: empresa sem plano de contas). */
async function orFallback<T>(request: Promise<T>, fallback: T): Promise<T> {
    try {
        return await request;
    } catch (error) {
        if (error instanceof ApiError && error.status < 500) return fallback;
        throw error;
    }
}

const loadDre = (range: { start: string; end: string }): Promise<DreSummary | null> =>
    orFallback(
        apiFetch(`/reports/dre?start=${range.start}&end=${range.end}`, dreSummarySchema),
        null,
    );

export default async function HomePage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const rawQuery = (await searchParams).q;
    const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.slice(0, 100) ?? '';
    const now = new Date();

    const [me, summary, previous, recentPage, openPage] = await Promise.all([
        requireSession(),
        loadDre(currentMonthRange(now)),
        loadDre(previousMonthRange(now)),
        orFallback(apiFetch('/titles?page=1&pageSize=50', titlePageSchema), null),
        orFallback(apiFetch('/titles?page=1&pageSize=1&status=OPEN', titlePageSchema), null),
    ]);

    // Não há ordenação por criação na API: pega uma página e ordena aqui.
    const recent: Title[] = [...(recentPage?.items ?? [])]
        .filter(title => matchesQuery(title.description, query))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, RECENT_COUNT);

    const previousLabel = monthAbbreviation(Number(previousMonthRange(now).start.slice(5, 7)) - 1);

    const changeOf = (current: string, before: string | undefined, higherIsBetter: boolean) => {
        if (before === undefined) return undefined;
        const percent = percentChange(current, before);
        if (percent === null) return undefined;
        return {
            label: `${percent > 0 ? '+' : ''}${percent}% vs ${previousLabel}`,
            favorable: percent === 0 || percent > 0 === higherIsBetter,
        };
    };

    return (
        <div className="space-y-6">
            <HomeHeader name={me.name} query={query} />

            {summary ? (
                <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <KpiCard
                        title="Receitas"
                        value={formatAmount(summary.totals.revenues)}
                        tone="positive"
                        icon={TrendingUp}
                        description="no mês corrente"
                        change={changeOf(summary.totals.revenues, previous?.totals.revenues, true)}
                    />
                    <KpiCard
                        title="Despesas"
                        value={formatAmount(summary.totals.expenses)}
                        tone="negative"
                        icon={TrendingDown}
                        description="no mês corrente"
                        change={changeOf(summary.totals.expenses, previous?.totals.expenses, false)}
                    />
                    <ResultCard
                        amount={summary.totals.result}
                        share={shareOfTotal(summary.totals.revenues, summary.totals.expenses)}
                    />
                </section>
            ) : (
                <EmptyState
                    title="Sem resultado para o mês"
                    description="Configure o plano de contas da empresa para ver o resumo."
                />
            )}

            <RecentTransactions titles={recent} openCount={openPage?.total ?? 0} query={query} />
        </div>
    );
}
