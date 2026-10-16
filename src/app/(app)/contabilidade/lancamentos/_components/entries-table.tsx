'use client';

import { Pagination } from '@/lib/_components/pagination';
import { Badge } from '@/lib/_components/ui/badge';
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
import { formatAmount } from '@/lib/_utils/money';
import type { Page } from '@/lib/_utils/pagination';
import { formatDate } from '@/lib/_utils/title-labels';
import type { JournalDetail } from '@/lib/api/schemas/journal';
import Link from 'next/link';

const REFERENCE_LABELS: Record<string, string> = {
    TITLE_CREATION: 'Título',
    TITLE_CANCELLATION: 'Cancelamento',
    SETTLEMENT: 'Baixa',
    SETTLEMENT_REVERSAL: 'Estorno de baixa',
    MANUAL: 'Manual',
    MANUAL_REVERSAL: 'Estorno manual',
};

/** Lista paginada de lançamentos contábeis. */
export function EntriesTable({ page }: { page: Page<JournalDetail> }) {
    const pagination = usePaginationQuery();

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nº</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {page.items.map(entry => (
                        <TableRow key={entry.id}>
                            <TableCell>{entry.number}</TableCell>
                            <TableCell>{formatDate(entry.date)}</TableCell>
                            <TableCell className="font-medium">{entry.description}</TableCell>
                            <TableCell>
                                <Badge variant="secondary">
                                    {REFERENCE_LABELS[entry.referenceType ?? ''] ??
                                        entry.referenceType ??
                                        '—'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {formatAmount(entry.totalDebits)}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/contabilidade/lancamentos/${entry.id}`}>
                                        Abrir
                                    </Link>
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
                onPageSizeChange={pagination.onPageSizeChange}
            />
        </div>
    );
}
