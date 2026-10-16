import { EmptyState } from '@/lib/_components/empty-state';
import { currentMonthRange } from '@/lib/_utils/dates';
import { apiFetch } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { dreSummarySchema } from '@/lib/api/schemas/dre';
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
    const summary = await loadSummary();

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold">Início</h1>
                <p className="text-muted-foreground text-sm">Resultado do mês corrente.</p>
            </header>

            {summary ? (
                <section className="grid gap-4 md:grid-cols-3">
                    <SummaryCard
                        title="Receitas"
                        amount={summary.totals.revenues}
                        tone="positive"
                    />
                    <SummaryCard
                        title="Despesas"
                        amount={summary.totals.expenses}
                        tone="negative"
                    />
                    <SummaryCard title="Resultado" amount={summary.totals.result} tone="auto" />
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
