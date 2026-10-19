'use client';

import { reverseEntryAction } from '@/actions/journal';
import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { PillInput } from '@/lib/_components/pill-fields';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { useActionState, useEffect } from 'react';

type ReverseFormProps = { entryId: string; onSuccess?: () => void };

/** Estorno de um lançamento manual, com descrição opcional. */
export function ReverseForm({ entryId, onSuccess }: ReverseFormProps) {
    const [state, formAction, pending] = useActionState(
        reverseEntryAction.bind(null, entryId),
        INITIAL_FORM_STATE,
    );
    useActionToast(state);

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Estornando…" />
            <PillInput
                className={FILTER_PILL_CLASS}
                label="Descrição do estorno (opcional)"
                name="description"
                errors={state.fieldErrors?.description}
            />
            <div className="flex justify-end">
                <ConfirmSubmitButton
                    confirmTitle="Estornar lançamento"
                    confirmDescription="O lançamento será estornado com um lançamento inverso. Continuar?"
                    confirmLabel="Estornar"
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending ? 'Estornando…' : 'Estornar'}
                </ConfirmSubmitButton>
            </div>
        </form>
    );
}
