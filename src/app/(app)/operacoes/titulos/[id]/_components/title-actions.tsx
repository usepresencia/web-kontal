'use client';

import { deleteEntryAction, deleteTitleAction, writeOffTitleAction } from '@/actions/titles';
import { useBusyRun } from '@/lib/_components/busy-provider';
import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FormField } from '@/lib/_components/form-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
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
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { formatAmount } from '@/lib/_utils/money';
import { notify, notifyResult } from '@/lib/_utils/notify';
import { PAYMENT_METHOD_LABELS, formatDate } from '@/lib/_utils/title-labels';
import { SUCCESS } from '@/lib/_utils/toast-messages';
import type { Title, TitleEntry } from '@/lib/api/schemas/title';
import { useActionState, useState } from 'react';

/** Baixas já registradas, com a exclusão de cada uma. */
export function EntriesTable({ titleId, entries }: { titleId: string; entries: TitleEntry[] }) {
    const run = useBusyRun();
    const [toDelete, setToDelete] = useState<TitleEntry | null>(null);

    if (entries.length === 0) {
        return <p className="text-muted-foreground text-sm">Nenhuma transação registrada.</p>;
    }

    return (
        <div className="space-y-3">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead>Forma</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map(entry => (
                        <TableRow key={entry.id}>
                            <TableCell>{formatDate(entry.paidAt)}</TableCell>
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
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setToDelete(entry)}
                                >
                                    Excluir
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <ConfirmationDialog
                open={toDelete !== null}
                onOpenChange={open => !open && setToDelete(null)}
                title="Excluir transação"
                description="Excluir esta transação? O saldo do título volta a ficar em aberto. Transações em período fechado não podem ser excluídas."
                confirmLabel="Excluir"
                variant="destructive"
                onConfirm={async () => {
                    if (!toDelete) return;
                    const result = await run(
                        () => deleteEntryAction(titleId, toDelete.id),
                        'Excluindo transação…',
                    );
                    notifyResult(result, SUCCESS.transactionDeleted, 'Não foi possível excluir.');
                    setToDelete(null);
                }}
            />
        </div>
    );
}

/** Baixa do saldo em aberto sem pagamento. */
export function WriteOffForm({ titleId }: { titleId: string }) {
    const [state, formAction, pending] = useActionState(
        writeOffTitleAction.bind(null, titleId),
        INITIAL_FORM_STATE,
    );
    useActionToast(state);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Baixando…" />
            <h2 className="font-display text-lg font-semibold">Baixar por perda</h2>
            <div className="grid gap-4 md:grid-cols-2">
                <FormField
                    label="Data (opcional)"
                    name="paidAt"
                    type="date"
                    errors={state.fieldErrors?.paidAt}
                />
                <FormField
                    label="Observação"
                    name="description"
                    errors={state.fieldErrors?.description}
                />
            </div>
            <ConfirmSubmitButton
                confirmTitle="Baixar por perda"
                confirmDescription="O saldo em aberto será baixado sem pagamento. Continuar?"
                confirmLabel="Baixar"
                variant="outline"
                disabled={pending}
            >
                {pending ? 'Baixando…' : 'Baixar saldo por perda'}
            </ConfirmSubmitButton>
        </form>
    );
}

/** Exclusão do título, com confirmação. */
export function DeleteTitleButton({ title }: { title: Title }) {
    const run = useBusyRun();
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-2">
            <Button variant="destructive" onClick={() => setOpen(true)}>
                Excluir título
            </Button>
            <ConfirmationDialog
                open={open}
                onOpenChange={setOpen}
                title="Excluir título"
                description={`Excluir "${title.description}"? Títulos com transações ou em período fechado não podem ser excluídos.`}
                confirmLabel="Excluir"
                variant="destructive"
                onConfirm={async () => {
                    const result = await run(
                        () => deleteTitleAction(title.id, title.type),
                        'Excluindo título…',
                    );
                    if (result && !result.ok)
                        notify('error', result.message ?? 'Não foi possível excluir.');
                    setOpen(false);
                }}
            />
        </div>
    );
}
