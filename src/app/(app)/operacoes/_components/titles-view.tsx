import { DatePickerField } from '@/lib/_components/date-picker-field';
import { DropdownSelect } from '@/lib/_components/dropdown-select';
import { EmptyState } from '@/lib/_components/empty-state';
import { FilterButton } from '@/lib/_components/filter-button';
import { FILTER_PILL_CLASS, FilterField } from '@/lib/_components/filter-field';
import { daysAgoLabel } from '@/lib/_utils/dates';
import { parsePageParams } from '@/lib/_utils/pagination';
import { TITLE_STATUS_LABELS, entryLabels, formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { TITLE_STATUSES, titlePageSchema } from '@/lib/api/schemas/title';
import { NewTitleButton } from './new-title-button';
import { TitlesTable } from './titles-table';

type TitlesViewProps = {
    type: 'INCOME' | 'EXPENSE';
    basePath: string;
    heading: string;
    subtitle: string;
    searchParams: Record<string, string | string[] | undefined>;
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const isoDate = (value: string | undefined) =>
    value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;

/** Listagem de títulos de um tipo, com filtros de situação e vencimento e paginação. */
export async function TitlesView({
    type,
    basePath,
    heading,
    subtitle,
    searchParams,
}: TitlesViewProps) {
    const { page, pageSize } = parsePageParams(searchParams);
    const status = TITLE_STATUSES.find(item => item === first(searchParams.status));
    const dueFrom = isoDate(first(searchParams.dueFrom));
    const dueTo = isoDate(first(searchParams.dueTo));

    const query = new URLSearchParams({ type, page: String(page), pageSize: String(pageSize) });
    if (status) query.set('status', status);
    if (dueFrom) query.set('dueFrom', dueFrom);
    if (dueTo) query.set('dueTo', dueTo);

    const titles = await apiFetch(`/titles?${query}`, titlePageSchema);
    const now = new Date();
    const rows = titles.items.map(title => ({
        title,
        ago: daysAgoLabel(title.createdAt, now),
        caption: `Vence ${formatDate(title.expirationDate)}`,
    }));

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{heading}</h1>
                    <p className="text-muted-foreground text-sm">{subtitle}</p>
                </div>
                <NewTitleButton href={`${basePath}/novo`} label={entryLabels(type).create} />
            </header>

            <form method="get" className="flex flex-wrap items-end gap-3">
                <FilterField label="Situação">
                    <DropdownSelect
                        name="status"
                        defaultValue={status ?? ''}
                        className={`${FILTER_PILL_CLASS} w-36`}
                        options={[
                            { value: '', label: 'Todas' },
                            ...TITLE_STATUSES.map(item => ({
                                value: item,
                                label: TITLE_STATUS_LABELS[item],
                            })),
                        ]}
                    />
                </FilterField>
                <FilterField label="Vencimento de">
                    <DatePickerField
                        name="dueFrom"
                        defaultValue={dueFrom}
                        clearable
                        className={`${FILTER_PILL_CLASS} w-36`}
                    />
                </FilterField>
                <FilterField label="até">
                    <DatePickerField
                        name="dueTo"
                        defaultValue={dueTo}
                        clearable
                        className={`${FILTER_PILL_CLASS} w-36`}
                    />
                </FilterField>
                <FilterButton />
            </form>

            {titles.items.length === 0 ? (
                <EmptyState title="Nenhum título encontrado" />
            ) : (
                <TitlesTable rows={rows} page={titles} />
            )}
        </div>
    );
}
