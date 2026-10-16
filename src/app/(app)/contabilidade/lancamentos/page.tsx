import { DatePickerField } from '@/lib/_components/date-picker-field';
import { EmptyState } from '@/lib/_components/empty-state';
import { FilterButton } from '@/lib/_components/filter-button';
import { FILTER_PILL_CLASS, FilterField } from '@/lib/_components/filter-field';
import { FilterForm } from '@/lib/_components/filter-form';
import { parseIsoDate } from '@/lib/_utils/dates';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { journalPageSchema } from '@/lib/api/schemas/journal';
import { EntriesTable } from './_components/entries-table';
import { NewEntryDialog } from './_components/new-entry-dialog';

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
                <div>
                    <h1 className="text-2xl font-bold">Lançamentos contábeis</h1>
                    <p className="text-muted-foreground text-sm">
                        Registros de débito e crédito gerados pelas operações ou lançados
                        manualmente
                    </p>
                </div>
                <NewEntryDialog />
            </header>

            <FilterForm className="flex flex-wrap items-end gap-3">
                <FilterField label="De">
                    <DatePickerField
                        name="from"
                        defaultValue={from ?? ''}
                        clearable
                        className={`${FILTER_PILL_CLASS} w-36`}
                    />
                </FilterField>
                <FilterField label="Até">
                    <DatePickerField
                        name="to"
                        defaultValue={to ?? ''}
                        clearable
                        className={`${FILTER_PILL_CLASS} w-36`}
                    />
                </FilterField>
                <FilterButton />
            </FilterForm>

            {entries.items.length === 0 ? (
                <EmptyState title="Nenhum lançamento encontrado" />
            ) : (
                <EntriesTable page={entries} />
            )}
        </div>
    );
}
