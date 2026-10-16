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
import { PAYMENT_METHOD_LABELS, formatDate } from '@/lib/_utils/title-labels';
import type { TitleEntry } from '@/lib/api/schemas/title';
import Link from 'next/link';

/** Lista paginada de baixas de todos os títulos. */
export function BaixasTable({ page }: { page: Page<TitleEntry> }) {
    const pagination = usePaginationQuery();

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead>Forma</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {page.items.map(entry => (
                        <TableRow key={entry.id}>
                            <TableCell>{formatDate(entry.paidAt)}</TableCell>
                            <TableCell className="font-medium">{entry.titleDescription}</TableCell>
                            <TableCell>
                                <Badge variant={entry.kind === 'PAYMENT' ? 'default' : 'secondary'}>
                                    {entry.kind === 'PAYMENT' ? 'Pagamento' : 'Perda'}
                                </Badge>
                            </TableCell>
                            <TableCell>{entry.billingAccountName ?? '—'}</TableCell>
                            <TableCell>
                                {entry.paymentMethod
                                    ? (PAYMENT_METHOD_LABELS[
                                          entry.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS
                                      ] ?? entry.paymentMethod)
                                    : '—'}
                            </TableCell>
                            <TableCell className="text-right">
                                {formatAmount(entry.totalAmount)}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/operacoes/titulos/${entry.titleId}`}>
                                        Abrir título
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
            />
        </div>
    );
}
