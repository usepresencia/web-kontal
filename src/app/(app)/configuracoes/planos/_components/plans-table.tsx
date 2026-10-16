'use client';

import { deletePlanAction } from '@/actions/billing';
import { useBusyRun } from '@/lib/_components/busy-provider';
import { Pagination } from '@/lib/_components/pagination';
import { Button } from '@/lib/_components/ui/button';
import { ConfirmationDialog } from '@/lib/_components/ui/confirmation-dialog';
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
import type { BillingPlan } from '@/lib/api/schemas/billing';
import Link from 'next/link';
import { useState } from 'react';

/** Lista paginada de planos de contas. */
export function PlansTable({ page }: { page: Page<BillingPlan> }) {
    const run = useBusyRun();
    const pagination = usePaginationQuery();
    const [toDelete, setToDelete] = useState<BillingPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {page.items.map(plan => (
                        <TableRow key={plan.id}>
                            <TableCell className="font-medium">{plan.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {plan.description}
                            </TableCell>
                            <TableCell className="space-x-2 text-right">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/configuracoes/planos/${plan.id}`}>Abrir</Link>
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setToDelete(plan)}>
                                    Excluir
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {error && (
                <p role="alert" className="text-negative text-sm">
                    {error}
                </p>
            )}

            <Pagination
                page={page.page}
                pageSize={page.pageSize}
                total={page.total}
                onPageChange={pagination.onPageChange}
                onPageSizeChange={pagination.onPageSizeChange}
                pageSizeLabel="Planos por página:"
            />

            <ConfirmationDialog
                open={toDelete !== null}
                onOpenChange={open => !open && setToDelete(null)}
                title="Excluir plano"
                description={`Excluir o plano ${toDelete?.name ?? ''}? Planos com contas em uso não podem ser excluídos.`}
                confirmLabel="Excluir"
                variant="destructive"
                onConfirm={async () => {
                    if (!toDelete) return;
                    const result = await run(
                        () => deletePlanAction(toDelete.id),
                        'Excluindo plano…',
                    );
                    setError(result.ok ? null : (result.message ?? 'Não foi possível excluir.'));
                    setToDelete(null);
                }}
            />
        </div>
    );
}
