'use client';

import { closePeriodAction, reopenPeriodAction } from '@/actions/periods';
import { useBusyRun } from '@/lib/_components/busy-provider';
import { FormField } from '@/lib/_components/form-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { SelectField } from '@/lib/_components/select-field';
import { Button } from '@/lib/_components/ui/button';
import { ConfirmationDialog } from '@/lib/_components/ui/confirmation-dialog';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { useActionState, useState } from 'react';

type ClosePeriodFormProps = {
    suggestedMonth: string;
    equityAccounts: { value: string; label: string }[];
};

/** Fecha o próximo mês; em dezembro, informe a conta de lucros acumulados para a apuração. */
export function ClosePeriodForm({ suggestedMonth, equityAccounts }: ClosePeriodFormProps) {
    const [state, formAction, pending] = useActionState(closePeriodAction, INITIAL_FORM_STATE);

    return (
        <form action={formAction} className="max-w-xl space-y-4">
            <FormPendingOverlay message="Fechando período…" />
            <h2 className="font-display text-lg font-semibold">Fechar período</h2>
            <FormField
                label="Mês"
                name="month"
                type="month"
                defaultValue={suggestedMonth}
                errors={state.fieldErrors?.month}
                required
            />
            <SelectField
                label="Conta de lucros acumulados (apuração de dezembro)"
                name="retainedEarningsAccountId"
                options={equityAccounts}
                allowEmpty
                placeholder="Padrão do plano"
                errors={state.fieldErrors?.retainedEarningsAccountId}
            />
            {state.message && (
                <p
                    role={state.ok ? 'status' : 'alert'}
                    className={state.ok ? 'text-positive' : 'text-negative'}
                >
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={pending}>
                {pending ? 'Fechando…' : 'Fechar período'}
            </Button>
        </form>
    );
}

/** Reabre o último período fechado, com confirmação. */
export function ReopenButton() {
    const run = useBusyRun();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="space-y-2">
            <Button variant="outline" onClick={() => setOpen(true)}>
                Reabrir último fechamento
            </Button>
            {error && (
                <p role="alert" className="text-negative text-sm">
                    {error}
                </p>
            )}
            <ConfirmationDialog
                open={open}
                onOpenChange={setOpen}
                title="Reabrir período"
                description="O último mês fechado volta a aceitar lançamentos. Se for dezembro, a apuração do resultado é estornada."
                confirmLabel="Reabrir"
                variant="destructive"
                onConfirm={async () => {
                    const result = await run(() => reopenPeriodAction(), 'Reabrindo período…');
                    setError(result.ok ? null : (result.message ?? 'Não foi possível reabrir.'));
                    setOpen(false);
                }}
            />
        </div>
    );
}
