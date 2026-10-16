import { EmptyState } from '@/lib/_components/empty-state';
import { Button } from '@/lib/_components/ui/button';
import { parseIsoDate } from '@/lib/_utils/dates';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { journalPageSchema } from '@/lib/api/schemas/journal';
import Link from 'next/link';
import { EntriesTable } from './_components/entries-table';

export default async function JournalEntriesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const query = await searchParams;
    const { page, pageSize } = parsePageParams(query);
    const from = parseIsoDate(query.from);
    const to = parseIsoDate(query.to);

    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const entries = await apiFetch(`/journal-entries?${params}`, journalPageSchema);

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold">Lançamentos</h1>
                <Button asChild>
                    <Link href="/contabilidade/lancamentos/novo">Novo lançamento</Link>
                </Button>
            </header>

            <form method="get" className="flex flex-wrap items-end gap-3">
                <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">De</span>
                    <input
                        type="date"
                        name="from"
                        defaultValue={from ?? ''}
                        className="border-input bg-background block h-10 rounded-md border px-3"
                    />
                </label>
                <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">Até</span>
                    <input
                        type="date"
                        name="to"
                        defaultValue={to ?? ''}
                        className="border-input bg-background block h-10 rounded-md border px-3"
                    />
                </label>
                <Button type="submit" variant="outline">
                    Filtrar
                </Button>
            </form>

            {entries.items.length === 0 ? (
                <EmptyState title="Nenhum lançamento encontrado" />
            ) : (
                <EntriesTable page={entries} />
            )}
        </div>
    );
}
