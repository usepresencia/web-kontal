'use client';

import { cancelSeriesAction, extendSeriesAction } from '@/actions/titles';
import { useBusyRun } from '@/lib/_components/busy-provider';
import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FormField } from '@/lib/_components/form-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { Button } from '@/lib/_components/ui/button';
import { ConfirmationDialog } from '@/lib/_components/ui/confirmation-dialog';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { notify } from '@/lib/_utils/notify';
import { useActionState, useState } from 'react';

/** Acrescenta ocorrências à série por quantidade ou data final. */
export function ExtendSeriesForm({ seriesId }: { seriesId: string }) {
    const [state, formAction, pending] = useActionState(
        extendSeriesAction.bind(null, seriesId),
        INITIAL_FORM_STATE,
    );
    useActionToast(state);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Estendendo série…" />
            <h2 className="font-display text-lg font-semibold">Estender série</h2>
            <div className="grid gap-4 md:grid-cols-2">
                <FormField
                    label="Quantidade"
                    name="count"
                    type="number"
                    min={1}
                    errors={state.fieldErrors?.count}
                />
                <FormField
                    label="ou data final"
                    name="until"
                    type="date"
                    errors={state.fieldErrors?.until}
                />
            </div>
            <ConfirmSubmitButton
                confirmTitle="Estender série"
                confirmDescription="Novas ocorrências serão acrescentadas à série. Continuar?"
                confirmLabel="Estender"
                variant="outline"
                disabled={pending}
            >
                {pending ? 'Estendendo…' : 'Estender'}
            </ConfirmSubmitButton>
        </form>
    );
}

/** Cancelamento da série, com confirmação. */
export function CancelSeriesButton({ seriesId }: { seriesId: string }) {
    const run = useBusyRun();
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-2">
            <Button variant="destructive" onClick={() => setOpen(true)}>
                Cancelar série
            </Button>
            <ConfirmationDialog
                open={open}
                onOpenChange={setOpen}
                title="Cancelar série"
                description="Cancelar a série remove as ocorrências ainda sem baixa. As já baixadas permanecem."
                confirmLabel="Cancelar série"
                variant="destructive"
                onConfirm={async () => {
                    const result = await run(
                        () => cancelSeriesAction(seriesId),
                        'Cancelando série…',
                    );
                    if (result && !result.ok)
                        notify('error', result.message ?? 'Não foi possível cancelar.');
                    setOpen(false);
                }}
            />
        </div>
    );
}
