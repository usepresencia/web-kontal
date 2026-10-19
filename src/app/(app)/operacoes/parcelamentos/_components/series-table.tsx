'use client';

import { Divider } from '@/lib/_components/divider';
import { Pagination } from '@/lib/_components/pagination';
import { usePaginationQuery } from '@/lib/_hooks/use-pagination-query';
import type { Page } from '@/lib/_utils/pagination';
import { SERIES_FREQUENCY_LABELS, SERIES_KIND_LABELS, formatDate } from '@/lib/_utils/title-labels';
import type { Series } from '@/lib/api/schemas/title';
import { ChevronRight, Clock, Repeat } from 'lucide-react';
import { useState } from 'react';
import { SeriesDialog } from './series-dialog';

/** Lista paginada de parcelamentos no mesmo estilo das contas; cada linha abre o modal de detalhes. */
export function SeriesTable({ page }: { page: Page<Series> }) {
    const pagination = usePaginationQuery();
    const [selected, setSelected] = useState<Series | null>(null);

    return (
        <section className="bg-card space-y-4 rounded-2xl p-5 shadow-sm">
            <ul className="space-y-1">
                {page.items.map((series, index) => (
                    <li key={series.id}>
                        {index > 0 && <Divider className="my-1 mr-3 ml-12" />}
                        <button
                            type="button"
                            onClick={() => setSelected(series)}
                            aria-haspopup="dialog"
                            className="group hover:bg-muted/50 focus-visible:ring-ring -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-xl px-3 py-2 text-left focus-visible:ring-2 focus-visible:outline-none"
                        >
                            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                                <Repeat className="size-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-foreground truncate text-sm font-medium">
                                    {series.baseDescription}
                                </p>
                                <p className="text-muted-foreground flex items-center gap-2 text-xs">
                                    {SERIES_KIND_LABELS[series.kind]}
                                    {series.frequency && (
                                        <span className="bg-muted rounded-full px-2 py-0.5 text-[11px]">
                                            {SERIES_FREQUENCY_LABELS[
                                                series.frequency as keyof typeof SERIES_FREQUENCY_LABELS
                                            ] ?? series.frequency}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                                <span className="text-foreground text-sm font-semibold">
                                    {series.totalCount === null
                                        ? 'Sem fim'
                                        : `${series.totalCount} ocorrências`}
                                </span>
                                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                    <Clock className="size-3" aria-hidden="true" />
                                    Desde {formatDate(series.firstExpirationDate)}
                                </span>
                            </div>
                            <ChevronRight
                                className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                                aria-hidden="true"
                            />
                        </button>
                    </li>
                ))}
            </ul>
            <Pagination
                page={page.page}
                pageSize={page.pageSize}
                total={page.total}
                onPageChange={pagination.onPageChange}
                onPageSizeChange={pagination.onPageSizeChange}
                pageSizeLabel="Parcelamentos por página:"
            />
            <SeriesDialog series={selected} onClose={() => setSelected(null)} />
        </section>
    );
}
