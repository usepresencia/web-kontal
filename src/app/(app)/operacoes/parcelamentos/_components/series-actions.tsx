'use client';

import { cancelSeriesAction, extendSeriesAction } from '@/actions/titles';
import { useBusyRun } from '@/lib/_components/busy-provider';
import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { PillInput } from '@/lib/_components/pill-fields';
import { Button } from '@/lib/_components/ui/button';
import { ConfirmationDialog } from '@/lib/_components/ui/confirmation-dialog';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { notify } from '@/lib/_utils/notify';
import { useActionState, useEffect, useState } from 'react';

type ExtendSeriesFormProps = { seriesId: string; onSuccess?: () => void };

/** Acrescenta ocorrências ao parcelamento por quantidade ou data final. */
export function ExtendSeriesForm({ seriesId, onSuccess }: ExtendSeriesFormProps) {
    const [state, formAction, pending] = useActionState(
        extendSeriesAction.bind(null, seriesId),
        INITIAL_FORM_STATE,
    );
    useActionToast(state);

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Estendendo parcelamento…" />
            <div className="grid grid-cols-2 gap-3">
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Quantidade"
                    name="count"
                    type="number"
                    min={1}
                    errors={state.fieldErrors?.count}
                />
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Ou data final"
                    name="until"
                    type="date"
                    errors={state.fieldErrors?.until}
                />
            </div>
            <div className="flex justify-end">
                <ConfirmSubmitButton
                    confirmTitle="Estender parcelamento"
                    confirmDescription="Novas ocorrências serão acrescentadas ao parcelamento. Continuar?"
                    confirmLabel="Estender"
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending ? 'Estendendo…' : 'Estender'}
                </ConfirmSubmitButton>
            </div>
        </form>
    );
}

type CancelSeriesButtonProps = { seriesId: string; onDone?: () => void };

/** Cancelamento do parcelamento, com confirmação. */
export function CancelSeriesButton({ seriesId, onDone }: CancelSeriesButtonProps) {
    const run = useBusyRun();
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                variant="destructive"
                onClick={() => setOpen(true)}
                className="rounded-full px-6 font-semibold"
            >
                Cancelar parcelamento
            </Button>
            <ConfirmationDialog
                open={open}
                onOpenChange={setOpen}
                title="Cancelar parcelamento"
                description="Cancelar o parcelamento remove as ocorrências ainda sem transação. As já pagas ou recebidas permanecem."
                confirmLabel="Cancelar parcelamento"
                variant="destructive"
                onConfirm={async () => {
                    const result = await run(
                        () => cancelSeriesAction(seriesId),
                        'Cancelando parcelamento…',
                    );
                    if (result && !result.ok)
                        notify('error', result.message ?? 'Não foi possível cancelar.');
                    setOpen(false);
                    onDone?.();
                }}
            />
        </>
    );
}
