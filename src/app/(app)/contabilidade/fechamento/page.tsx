import { EmptyState } from '@/lib/_components/empty-state';
import { nextMonth } from '@/lib/_utils/dates';
import { apiFetch } from '@/lib/api/client';
import { accountPageSchema } from '@/lib/api/schemas/billing';
import { periodClosingsSchema } from '@/lib/api/schemas/reports';
import { ClosingsList } from './_components/closings-list';
import { ClosePeriodDialog, ReopenButton } from './_components/period-actions';

export default async function PeriodClosingPage() {
    const closings = await apiFetch('/period-closings', periodClosingsSchema);
    const accounts = await apiFetch('/billing-accounts?page=1&pageSize=100', accountPageSchema);

    const latest = closings.items.reduce<string | null>(
        (max, item) => (max === null || item.month > max ? item.month : max),
        null,
    );
    const suggested = latest ? nextMonth(latest) : new Date().toISOString().slice(0, 7);
    const equityAccounts = accounts.items
        .filter(
            account =>
                account.accountType === 'ANALYTIC' &&
                account.isActive &&
                account.nature === 'EQUITY',
        )
        .map(account => ({ value: account.id, label: `${account.code} ${account.name}` }));

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Fechamento de período</h1>
                    <p className="text-muted-foreground text-sm">
                        Gerencie os fechamentos e trave os lançamentos dos meses já conferidos
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {closings.items.length > 0 && <ReopenButton />}
                    <ClosePeriodDialog suggestedMonth={suggested} equityAccounts={equityAccounts} />
                </div>
            </header>

            {closings.items.length === 0 ? (
                <EmptyState
                    title="Nenhum fechamento"
                    description="Feche um mês para travar os lançamentos até o fim dele."
                />
            ) : (
                <ClosingsList items={closings.items} />
            )}
        </div>
    );
}
