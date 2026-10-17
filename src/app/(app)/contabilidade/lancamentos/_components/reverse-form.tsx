'use client';

import { reverseEntryAction } from '@/actions/journal';
import { FormField } from '@/lib/_components/form-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { Button } from '@/lib/_components/ui/button';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { useActionState } from 'react';

/** Estorno de um lançamento manual, com descrição opcional. */
export function ReverseForm({ entryId }: { entryId: string }) {
    const [state, formAction, pending] = useActionState(
        reverseEntryAction.bind(null, entryId),
        INITIAL_FORM_STATE,
    );

    return (
        <form action={formAction} className="max-w-xl space-y-4">
            <FormPendingOverlay message="Estornando…" />
            <h2 className="font-display text-lg font-semibold">Estornar lançamento</h2>
            <FormField
                label="Descrição do estorno (opcional)"
                name="description"
                errors={state.fieldErrors?.description}
            />
            {state.message && (
                <p role="alert" className="text-negative text-sm">
                    {state.message}
                </p>
            )}
            <Button type="submit" variant="outline" disabled={pending}>
                {pending ? 'Estornando…' : 'Estornar'}
            </Button>
        </form>
    );
}
