import { EmptyState } from '@/lib/_components/empty-state';
import { PageGreeting } from '@/lib/_components/page-greeting';
import { currentMonthRange } from '@/lib/_utils/dates';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { dreSummarySchema } from '@/lib/api/schemas/dre';
import { requireSession } from '@/lib/auth/session';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { SummaryCard } from './_components/summary-card';

async function loadSummary() {
    const { start, end } = currentMonthRange(new Date());
    try {
        return await apiFetch(`/reports/dre?start=${start}&end=${end}`, dreSummarySchema);
    } catch (error) {
        if (error instanceof ApiError && error.status < 500) return null;
        throw error;
    }
}

export default async function HomePage() {
    const [me, summary] = await Promise.all([requireSession(), loadSummary()]);

    return (
        <div className="space-y-6">
            <PageGreeting name={me.name} />

            {summary ? (
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <SummaryCard
                        title="Receitas"
                        amount={summary.totals.revenues}
                        icon={TrendingUp}
                        tone="positive"
                    />
                    <SummaryCard
                        title="Despesas"
                        amount={summary.totals.expenses}
                        icon={TrendingDown}
                        tone="negative"
                    />
                    <SummaryCard
                        title="Resultado"
                        amount={summary.totals.result}
                        icon={Wallet}
                        tone="auto"
                    />
                </section>
            ) : (
                <EmptyState
                    title="Sem resultado para o mês"
                    description="Configure o plano de contas da empresa para ver o resumo."
                />
            )}
        </div>
    );
}
