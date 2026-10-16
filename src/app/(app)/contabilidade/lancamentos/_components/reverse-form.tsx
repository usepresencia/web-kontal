'use client';

import { reverseEntryAction } from '@/actions/journal';
import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FormField } from '@/lib/_components/form-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { useActionState } from 'react';

/** Estorno de um lançamento manual, com descrição opcional. */
export function ReverseForm({ entryId }: { entryId: string }) {
    const [state, formAction, pending] = useActionState(
        reverseEntryAction.bind(null, entryId),
        INITIAL_FORM_STATE,
    );
    useActionToast(state);

    return (
        <form action={formAction} className="max-w-xl space-y-4">
            <FormPendingOverlay message="Estornando…" />
            <h2 className="font-display text-lg font-semibold">Estornar lançamento</h2>
            <FormField
                label="Descrição do estorno (opcional)"
                name="description"
                errors={state.fieldErrors?.description}
            />
            <ConfirmSubmitButton
                confirmTitle="Estornar lançamento"
                confirmDescription="O lançamento será estornado com um lançamento inverso. Continuar?"
                confirmLabel="Estornar"
                variant="outline"
                disabled={pending}
            >
                {pending ? 'Estornando…' : 'Estornar'}
            </ConfirmSubmitButton>
        </form>
    );
}
