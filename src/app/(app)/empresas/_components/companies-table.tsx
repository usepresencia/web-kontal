'use client';

import { deactivateCompanyAction } from '@/actions/companies';
import { selectCompanyAction } from '@/actions/session';
import { useBusyFlag, useBusyRun } from '@/lib/_components/busy-provider';
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
import { notifyResult } from '@/lib/_utils/notify';
import type { Page } from '@/lib/_utils/pagination';
import type { Company } from '@/lib/api/schemas/company';
import { useState, useTransition } from 'react';

/** Lista paginada de empresas com as ações de abrir e desativar. */
export function CompaniesTable({ page }: { page: Page<Company> }) {
    const run = useBusyRun();
    const pagination = usePaginationQuery();
    const [selecting, startTransition] = useTransition();
    useBusyFlag(selecting, 'Abrindo empresa…');
    const [toDeactivate, setToDeactivate] = useState<Company | null>(null);

    return (
        <div className="space-y-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CNPJ</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {page.items.map(company => (
                        <TableRow key={company.id}>
                            <TableCell className="font-medium">{company.name}</TableCell>
                            <TableCell>{company.cnpj}</TableCell>
                            <TableCell>
                                {company.address.city}/{company.address.state}
                            </TableCell>
                            <TableCell className="space-x-2 text-right">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                        startTransition(async () => {
                                            await selectCompanyAction(company.id);
                                        })
                                    }
                                >
                                    Abrir
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setToDeactivate(company)}
                                >
                                    Desativar
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
                pageSizeLabel="Empresas por página:"
            />

            <ConfirmationDialog
                open={toDeactivate !== null}
                onOpenChange={open => !open && setToDeactivate(null)}
                title="Desativar empresa"
                description={`Desativar ${toDeactivate?.name ?? ''}? Ela deixa de aparecer para os usuários.`}
                confirmLabel="Desativar"
                variant="destructive"
                onConfirm={async () => {
                    if (!toDeactivate) return;
                    const result = await run(
                        () => deactivateCompanyAction(toDeactivate.id),
                        'Desativando empresa…',
                    );
                    notifyResult(result, 'Empresa desativada.', 'Não foi possível desativar.');
                    setToDeactivate(null);
                }}
            />
        </div>
    );
}
