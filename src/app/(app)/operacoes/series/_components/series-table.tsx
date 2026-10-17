'use client';

import { Pagination } from '@/lib/_components/pagination';
import { Button } from '@/lib/_components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/lib/_components/ui/table';
import { usePaginationQuery } from '@/lib/_hooks/use-pagination-query';
import type { Page } from '@/lib/_utils/pagination';
import { SERIES_FREQUENCY_LABELS, SERIES_KIND_LABELS, formatDate } from '@/lib/_utils/title-labels';
import type { Series } from '@/lib/api/schemas/title';
import Link from 'next/link';

/** Lista paginada de séries de títulos. */
export function SeriesTable({ page }: { page: Page<Series> }) {
    const pagination = usePaginationQuery();

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Frequência</TableHead>
                        <TableHead>Ocorrências</TableHead>
                        <TableHead>Primeiro vencimento</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {page.items.map(series => (
                        <TableRow key={series.id}>
                            <TableCell className="font-medium">{series.baseDescription}</TableCell>
                            <TableCell>{SERIES_KIND_LABELS[series.kind]}</TableCell>
                            <TableCell>
                                {series.frequency
                                    ? (SERIES_FREQUENCY_LABELS[
                                          series.frequency as keyof typeof SERIES_FREQUENCY_LABELS
                                      ] ?? series.frequency)
                                    : '—'}
                            </TableCell>
                            <TableCell>{series.totalCount ?? '—'}</TableCell>
                            <TableCell>{formatDate(series.firstExpirationDate)}</TableCell>
                            <TableCell className="text-right">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/operacoes/series/${series.id}`}>Abrir</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Pagination
                page={page.page}
                pageSize={page.pageSize}
                total={page.total}
                onPageChange={pagination.onPageChange}
            />
        </div>
    );
}
