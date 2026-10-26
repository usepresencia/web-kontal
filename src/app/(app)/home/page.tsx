import { EmptyState } from '@/lib/_components/empty-state';
import {
    currentMonthRange,
    monthAbbreviation,
    previousMonthRange,
    transactionDate,
} from '@/lib/_utils/dates';
import { matchesQuery, percentChange, shareOfTotal } from '@/lib/_utils/kpi';
import { formatAmount } from '@/lib/_utils/money';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { cashSummarySchema, type CashSummary } from '@/lib/api/schemas/cash-summary';
import { titlePageSchema, type Title } from '@/lib/api/schemas/title';
import { requireSession } from '@/lib/auth/session';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { HomeHeader } from './_components/home-header';
import { KpiCard } from './_components/kpi-card';
import { RecentTransactions } from './_components/recent-transactions';
import { ResultCard } from './_components/result-card';
import { UpcomingTitles } from './_components/upcoming-titles';

const RECENT_COUNT = 5;
const UPCOMING_COUNT = 5;

const upcomingPath = (type: 'EXPENSE' | 'INCOME') =>
    `/titles?type=${type}&status=OPEN&page=1&pageSize=50`;

/** Executa a consulta e devolve o `fallback` em erro 4xx da API (ex.: empresa sem plano de contas). */
async function orFallback<T>(request: Promise<T>, fallback: T): Promise<T> {
    try {
        return await request;
    } catch (error) {
        if (error instanceof ApiError && error.status < 500) return fallback;
        throw error;
    }
}

/** Resumo de caixa (regime de caixa: só o que foi pago/recebido no período, não o emitido). */
const loadCashSummary = (range: { start: string; end: string }): Promise<CashSummary | null> =>
    orFallback(
        apiFetch(`/reports/cash-flow?start=${range.start}&end=${range.end}`, cashSummarySchema),
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

    const [me, summary, previous, recentPage, openPage, payablePage, receivablePage] =
        await Promise.all([
            requireSession(),
            loadCashSummary(currentMonthRange(now)),
            loadCashSummary(previousMonthRange(now)),
            orFallback(apiFetch('/titles?page=1&pageSize=50', titlePageSchema), null),
            orFallback(apiFetch('/titles?page=1&pageSize=1&status=OPEN', titlePageSchema), null),
            orFallback(apiFetch(upcomingPath('EXPENSE'), titlePageSchema), null),
            orFallback(apiFetch(upcomingPath('INCOME'), titlePageSchema), null),
        ]);

    // A API ordena por vencimento; o filtro da busca é aplicado aqui, como nas transações recentes.
    const upcoming = (page: typeof payablePage): Title[] =>
        (page?.items ?? [])
            .filter(title => matchesQuery(title.description, query))
            .slice(0, UPCOMING_COUNT);

    // Não há ordenação por data da transação na API: pega uma página e ordena aqui.
    const recent: Title[] = [...(recentPage?.items ?? [])]
        .filter(title => matchesQuery(title.description, query))
        .sort(
            (a, b) =>
                transactionDate(b).localeCompare(transactionDate(a)) ||
                b.createdAt.localeCompare(a.createdAt),
        )
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
                        value={formatAmount(summary.totals.inflows)}
                        tone="positive"
                        icon={TrendingUp}
                        description="recebido no mês corrente"
                        change={changeOf(summary.totals.inflows, previous?.totals.inflows, true)}
                    />
                    <KpiCard
                        title="Despesas"
                        value={formatAmount(summary.totals.outflows)}
                        tone="negative"
                        icon={TrendingDown}
                        description="pago no mês corrente"
                        change={changeOf(summary.totals.outflows, previous?.totals.outflows, false)}
                    />
                    <ResultCard
                        amount={summary.totals.net}
                        share={shareOfTotal(summary.totals.inflows, summary.totals.outflows)}
                    />
                </section>
            ) : (
                <EmptyState
                    title="Sem resultado para o mês"
                    description="Configure o plano de contas da empresa para ver o resumo."
                />
            )}

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <UpcomingTitles
                    heading="Próximos pagamentos"
                    href="/operacoes/pagar"
                    titles={upcoming(payablePage)}
                    openCount={payablePage?.total ?? 0}
                    emptyText="Nenhum pagamento em aberto."
                    query={query}
                />
                <UpcomingTitles
                    heading="Próximos recebimentos"
                    href="/operacoes/receber"
                    titles={upcoming(receivablePage)}
                    openCount={receivablePage?.total ?? 0}
                    emptyText="Nenhum recebimento em aberto."
                    query={query}
                />
            </section>

            <RecentTransactions titles={recent} openCount={openPage?.total ?? 0} query={query} />
        </div>
    );
}
