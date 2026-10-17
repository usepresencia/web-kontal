import { EmptyState } from '@/lib/_components/empty-state';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/lib/_components/ui/table';
import { formatMonth, nextMonth } from '@/lib/_utils/dates';
import { formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { accountPageSchema } from '@/lib/api/schemas/billing';
import { periodClosingsSchema } from '@/lib/api/schemas/reports';
import { ClosePeriodForm, ReopenButton } from './_components/period-actions';

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
        <div className="max-w-3xl space-y-8">
            <header className="space-y-1">
                <h1 className="text-2xl font-bold">Fechamento de período</h1>
                <p className="text-muted-foreground text-sm">
                    {closings.closedThrough
                        ? `Lançamentos até ${formatDate(closings.closedThrough)} estão travados.`
                        : 'Nenhum período fechado.'}
                </p>
            </header>

            <ClosePeriodForm suggestedMonth={suggested} equityAccounts={equityAccounts} />

            <section className="space-y-3">
                <h2 className="font-display text-lg font-semibold">Fechamentos</h2>
                {closings.items.length === 0 ? (
                    <EmptyState title="Nenhum fechamento" />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mês</TableHead>
                                <TableHead>Travado até</TableHead>
                                <TableHead>Apuração</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...closings.items]
                                .sort((a, b) => b.month.localeCompare(a.month))
                                .map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell>{formatMonth(item.month)}</TableCell>
                                        <TableCell>{formatDate(item.throughDate)}</TableCell>
                                        <TableCell>{item.closingEntryId ? 'Sim' : '—'}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                )}
                {closings.items.length > 0 && <ReopenButton />}
            </section>
        </div>
    );
}
