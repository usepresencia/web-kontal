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
import { formatAmount } from '@/lib/_utils/money';
import type { Page } from '@/lib/_utils/pagination';
import { formatDate } from '@/lib/_utils/title-labels';
import type { Title } from '@/lib/api/schemas/title';
import Link from 'next/link';
import { StatusBadge } from './status-badge';

/** Tabela paginada de títulos. */
export function TitlesTable({ page }: { page: Page<Title> }) {
    const pagination = usePaginationQuery();

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead>Situação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {page.items.map(title => (
                        <TableRow key={title.id}>
                            <TableCell>{formatDate(title.expirationDate)}</TableCell>
                            <TableCell className="font-medium">
                                {title.description}
                                {title.seriesIndex !== null && (
                                    <span className="text-muted-foreground ml-2 text-xs">
                                        #{title.seriesIndex}
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {formatAmount(title.amount)}
                            </TableCell>
                            <TableCell className="text-right">
                                {formatAmount(title.remainingAmount)}
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={title.status} />
                            </TableCell>
                            <TableCell className="text-right">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/operacoes/titulos/${title.id}`}>Abrir</Link>
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
