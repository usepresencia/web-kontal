'use client';

import { closePeriodAction, reopenPeriodAction } from '@/actions/periods';
import { useBusyRun } from '@/lib/_components/busy-provider';
import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { MonthPickerField } from '@/lib/_components/month-picker-field';
import { FieldError, PillSelect } from '@/lib/_components/pill-fields';
import { Button } from '@/lib/_components/ui/button';
import { ConfirmationDialog } from '@/lib/_components/ui/confirmation-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    MODAL_CLASS,
} from '@/lib/_components/ui/dialog';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { notifyResult } from '@/lib/_utils/notify';
import { SUCCESS } from '@/lib/_utils/toast-messages';
import { Plus } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';

type ClosePeriodFormProps = {
    suggestedMonth: string;
    equityAccounts: { value: string; label: string }[];
    /** Chamado depois que o período é fechado. */
    onSuccess?: () => void;
};

/** Fecha o próximo mês nos campos em pílula; em dezembro, informe a conta de lucros acumulados para a apuração. */
function ClosePeriodForm({ suggestedMonth, equityAccounts, onSuccess }: ClosePeriodFormProps) {
    const [state, formAction, pending] = useActionState(closePeriodAction, INITIAL_FORM_STATE);
    const [account, setAccount] = useState('');
    useActionToast(state);

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Fechando período…" />
            <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0">
                    <label
                        htmlFor="month"
                        className="text-muted-foreground mb-1 block pl-4 text-xs font-medium"
                    >
                        Mês
                    </label>
                    <MonthPickerField
                        name="month"
                        defaultValue={suggestedMonth}
                        className={`${FILTER_PILL_CLASS} w-full`}
                        aria-invalid={state.fieldErrors?.month ? true : undefined}
                    />
                    <FieldError errors={state.fieldErrors?.month} />
                </div>
                <PillSelect
                    className={FILTER_PILL_CLASS}
                    label="Lucros acumulados (dezembro)"
                    name="retainedEarningsAccountId"
                    value={account}
                    onChange={setAccount}
                    options={equityAccounts}
                    allowEmpty
                    emptyLabel="Padrão do plano"
                    placeholder="Padrão do plano"
                    errors={state.fieldErrors?.retainedEarningsAccountId}
                />
            </div>
            <div className="flex justify-end">
                <ConfirmSubmitButton
                    confirmTitle="Fechar período"
                    confirmDescription="O mês deixa de aceitar lançamentos. Continuar?"
                    confirmLabel="Fechar"
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending ? 'Fechando…' : 'Fechar período'}
                </ConfirmSubmitButton>
            </div>
        </form>
    );
}

type ClosePeriodDialogProps = Omit<ClosePeriodFormProps, 'onSuccess'>;

/** Botão "Fechar período": abre em modal o fechamento do próximo mês. */
export function ClosePeriodDialog(props: ClosePeriodDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus aria-hidden="true" />
                    Fechar período
                </Button>
            </DialogTrigger>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader className="space-y-0.5">
                    <DialogTitle className="font-display text-xl font-bold tracking-tight">
                        Fechar período
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        O mês fechado deixa de aceitar lançamentos; em dezembro, o resultado do ano
                        é apurado.
                    </DialogDescription>
                </DialogHeader>
                <ClosePeriodForm {...props} onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}

/** Reabre o último período fechado, com confirmação. */
export function ReopenButton() {
    const run = useBusyRun();
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)}>
                Reabrir último fechamento
            </Button>
            <ConfirmationDialog
                open={open}
                onOpenChange={setOpen}
                title="Reabrir período"
                description="O último mês fechado volta a aceitar lançamentos. Se for dezembro, a apuração do resultado é estornada."
                confirmLabel="Reabrir"
                variant="destructive"
                onConfirm={async () => {
                    const result = await run(() => reopenPeriodAction(), 'Reabrindo período…');
                    notifyResult(result, SUCCESS.periodReopened, 'Não foi possível reabrir.');
                    setOpen(false);
                }}
            />
        </>
    );
}
