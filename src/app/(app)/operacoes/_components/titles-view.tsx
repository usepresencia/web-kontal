import { EmptyState } from '@/lib/_components/empty-state';
import { FilterButton } from '@/lib/_components/filter-button';
import { Button } from '@/lib/_components/ui/button';
import { daysAgoLabel } from '@/lib/_utils/dates';
import { parsePageParams } from '@/lib/_utils/pagination';
import { TITLE_STATUS_LABELS, formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { TITLE_STATUSES, titlePageSchema } from '@/lib/api/schemas/title';
import Link from 'next/link';
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
                <Button asChild>
                    <Link href={`${basePath}/novo`}>Novo título</Link>
                </Button>
            </header>

            <form method="get" className="flex flex-wrap items-end gap-3">
                <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">Situação</span>
                    <select
                        name="status"
                        defaultValue={status ?? ''}
                        className="border-input bg-background block h-10 rounded-md border px-3"
                    >
                        <option value="">Todas</option>
                        {TITLE_STATUSES.map(item => (
                            <option key={item} value={item}>
                                {TITLE_STATUS_LABELS[item]}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">Vencimento de</span>
                    <input
                        type="date"
                        name="dueFrom"
                        defaultValue={dueFrom}
                        className="border-input bg-background block h-10 rounded-md border px-3"
                    />
                </label>
                <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">até</span>
                    <input
                        type="date"
                        name="dueTo"
                        defaultValue={dueTo}
                        className="border-input bg-background block h-10 rounded-md border px-3"
                    />
                </label>
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
