import { EmptyState } from '@/lib/_components/empty-state';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { seriesPageSchema } from '@/lib/api/schemas/title';
import { NewSeriesDialog } from './_components/new-series-dialog';
import { SeriesTable } from './_components/series-table';

export default async function SeriesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { page, pageSize } = parsePageParams(await searchParams);
    const series = await apiFetch(
        `/title-series?page=${page}&pageSize=${pageSize}`,
        seriesPageSchema,
    );

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Parcelamentos</h1>
                    <p className="text-muted-foreground text-sm">
                        Gerencie seus parcelamentos e recorrências
                    </p>
                </div>
                <NewSeriesDialog />
            </header>
            {series.items.length === 0 ? (
                <EmptyState
                    title="Nenhum parcelamento"
                    description="Crie um parcelamento ou recorrência para vê-los aqui."
                />
            ) : (
                <SeriesTable page={series} />
            )}
        </div>
    );
}
