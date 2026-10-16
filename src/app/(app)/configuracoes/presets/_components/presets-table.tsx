'use client';

import { deletePresetAction } from '@/actions/presets';
import { useBusyRun } from '@/lib/_components/busy-provider';
import { Pagination } from '@/lib/_components/pagination';
import { Badge } from '@/lib/_components/ui/badge';
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
import { notifyResult } from '@/lib/_utils/notify';
import type { Page } from '@/lib/_utils/pagination';
import { SUCCESS } from '@/lib/_utils/toast-messages';
import type { Preset } from '@/lib/api/schemas/preset';
import Link from 'next/link';
import { useState } from 'react';

/** Lista paginada de presets. */
export function PresetsTable({ page }: { page: Page<Preset> }) {
    const run = useBusyRun();
    const pagination = usePaginationQuery();
    const [toDelete, setToDelete] = useState<Preset | null>(null);

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {page.items.map(preset => (
                        <TableRow key={preset.id}>
                            <TableCell className="font-medium">{preset.name}</TableCell>
                            <TableCell>{preset.billingPlanName}</TableCell>
                            <TableCell>
                                <Badge variant={preset.isActive ? 'default' : 'secondary'}>
                                    {preset.isActive ? 'Ativo' : 'Inativo'}
                                </Badge>
                            </TableCell>
                            <TableCell className="space-x-2 text-right">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/configuracoes/presets/${preset.id}`}>Editar</Link>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setToDelete(preset)}
                                >
                                    Excluir
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
                pageSizeLabel="Presets por página:"
            />

            <ConfirmationDialog
                open={toDelete !== null}
                onOpenChange={open => !open && setToDelete(null)}
                title="Excluir preset"
                description={`Excluir o preset ${toDelete?.name ?? ''}? Presets usados em títulos não podem ser excluídos.`}
                confirmLabel="Excluir"
                variant="destructive"
                onConfirm={async () => {
                    if (!toDelete) return;
                    const result = await run(
                        () => deletePresetAction(toDelete.id),
                        'Excluindo preset…',
                    );
                    notifyResult(result, SUCCESS.presetDeleted, 'Não foi possível excluir.');
                    setToDelete(null);
                }}
            />
        </div>
    );
}
