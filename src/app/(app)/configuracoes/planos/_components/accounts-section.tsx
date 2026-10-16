'use client';

import { deleteAccountAction } from '@/actions/billing';
import { useBusyRun } from '@/lib/_components/busy-provider';
import { EmptyState } from '@/lib/_components/empty-state';
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
import { ACCOUNT_TYPE_LABELS, NATURE_LABELS } from '@/lib/_utils/billing-labels';
import type { BillingAccount } from '@/lib/api/schemas/billing';
import { useState } from 'react';
import { AccountDialog } from './account-dialog';

type AccountsSectionProps = { planId: string; accounts: BillingAccount[] };

/** Contas do plano, com criação, edição e exclusão. */
export function AccountsSection({ planId, accounts }: AccountsSectionProps) {
    const run = useBusyRun();
    const [dialog, setDialog] = useState<{ open: boolean; account?: BillingAccount }>({
        open: false,
    });
    const [toDelete, setToDelete] = useState<BillingAccount | null>(null);
    const [error, setError] = useState<string | null>(null);
    const sorted = [...accounts].sort((a, b) =>
        a.code.localeCompare(b.code, 'pt-BR', { numeric: true }),
    );

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Contas</h2>
                <Button onClick={() => setDialog({ open: true })}>Nova conta</Button>
            </div>

            {sorted.length === 0 ? (
                <EmptyState
                    title="Plano sem contas"
                    description="Crie a primeira conta do plano."
                />
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Natureza</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sorted.map(account => (
                            <TableRow key={account.id}>
                                <TableCell className="font-mono text-sm">{account.code}</TableCell>
                                <TableCell
                                    className={
                                        account.accountType === 'SYNTHETIC' ? 'font-semibold' : ''
                                    }
                                >
                                    <span style={{ paddingLeft: `${(account.level - 1) * 16}px` }}>
                                        {account.name}
                                    </span>
                                </TableCell>
                                <TableCell>{ACCOUNT_TYPE_LABELS[account.accountType]}</TableCell>
                                <TableCell>{NATURE_LABELS[account.nature]}</TableCell>
                                <TableCell>
                                    <Badge variant={account.isActive ? 'default' : 'secondary'}>
                                        {account.isActive ? 'Ativa' : 'Inativa'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="space-x-2 text-right">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setDialog({ open: true, account })}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setToDelete(account)}
                                    >
                                        Excluir
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {error && (
                <p role="alert" className="text-negative text-sm">
                    {error}
                </p>
            )}

            {dialog.open && (
                <AccountDialog
                    key={dialog.account?.id ?? 'new'}
                    planId={planId}
                    accounts={accounts}
                    account={dialog.account}
                    open
                    onOpenChange={open => !open && setDialog({ open: false })}
                />
            )}

            <ConfirmationDialog
                open={toDelete !== null}
                onOpenChange={open => !open && setToDelete(null)}
                title="Excluir conta"
                description={`Excluir ${toDelete?.code ?? ''} ${toDelete?.name ?? ''}? Contas com movimento ou com filhas não podem ser excluídas.`}
                confirmLabel="Excluir"
                variant="destructive"
                onConfirm={async () => {
                    if (!toDelete) return;
                    const result = await run(
                        () => deleteAccountAction(planId, toDelete.id),
                        'Excluindo conta…',
                    );
                    setError(result.ok ? null : (result.message ?? 'Não foi possível excluir.'));
                    setToDelete(null);
                }}
            />
        </section>
    );
}
