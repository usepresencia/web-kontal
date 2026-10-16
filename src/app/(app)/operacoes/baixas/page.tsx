import { EmptyState } from '@/lib/_components/empty-state';
import { Button } from '@/lib/_components/ui/button';
import { parseIsoDate } from '@/lib/_utils/dates';
import { parsePageParams } from '@/lib/_utils/pagination';
import { TITLE_TYPE_LABELS } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { accountPageSchema } from '@/lib/api/schemas/billing';
import { entryPageSchema } from '@/lib/api/schemas/title';
import { z } from 'zod';
import { BaixasTable } from './_components/baixas-table';

const inputClass = 'border-input bg-background block h-10 rounded-md border px-3';
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function EntriesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const query = await searchParams;
    const { page, pageSize } = parsePageParams(query);
    const paidFrom = parseIsoDate(query.paidFrom);
    const paidTo = parseIsoDate(query.paidTo);
    const titleType =
        first(query.titleType) === 'INCOME' || first(query.titleType) === 'EXPENSE'
            ? first(query.titleType)
            : undefined;
    const accountId = z.uuid().safeParse(first(query.billingAccountId));

    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (paidFrom) params.set('paidFrom', paidFrom);
    if (paidTo) params.set('paidTo', paidTo);
    if (titleType) params.set('titleType', titleType);
    if (accountId.success) params.set('billingAccountId', accountId.data);

    const [entries, accounts] = await Promise.all([
        apiFetch(`/entries?${params}`, entryPageSchema),
        apiFetch('/billing-accounts?page=1&pageSize=100', accountPageSchema),
    ]);
    const financial = accounts.items.filter(
        account => account.accountType === 'ANALYTIC' && account.nature === 'ASSET',
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Baixas</h1>

            <form method="get" className="flex flex-wrap items-end gap-3">
                <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">Pago de</span>
                    <input
                        type="date"
                        name="paidFrom"
                        defaultValue={paidFrom ?? ''}
                        className={inputClass}
                    />
                </label>
                <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">até</span>
                    <input
                        type="date"
                        name="paidTo"
                        defaultValue={paidTo ?? ''}
                        className={inputClass}
                    />
                </label>
                <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">Tipo</span>
                    <select name="titleType" defaultValue={titleType ?? ''} className={inputClass}>
                        <option value="">Todos</option>
                        {Object.entries(TITLE_TYPE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">Conta financeira</span>
                    <select
                        name="billingAccountId"
                        defaultValue={accountId.success ? accountId.data : ''}
                        className={`${inputClass} max-w-xs`}
                    >
                        <option value="">Todas</option>
                        {financial.map(account => (
                            <option key={account.id} value={account.id}>
                                {account.code} {account.name}
                            </option>
                        ))}
                    </select>
                </label>
                <Button type="submit" variant="outline">
                    Filtrar
                </Button>
            </form>

            {entries.items.length === 0 ? (
                <EmptyState title="Nenhuma baixa encontrada" />
            ) : (
                <BaixasTable page={entries} />
            )}
        </div>
    );
}
