'use client';

import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FormField } from '@/lib/_components/form-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/_utils/form';
import type { BillingPlan } from '@/lib/api/schemas/billing';
import { useActionState } from 'react';

type PlanFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    plan?: BillingPlan;
    submitLabel: string;
};

/** Formulário de plano de contas (cadastro e edição). */
export function PlanForm({ action, plan, submitLabel }: PlanFormProps) {
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    useActionToast(state);

    return (
        <form action={formAction} className="max-w-xl space-y-4">
            <FormPendingOverlay message="Salvando plano…" />
            <FormField
                label="Nome"
                name="name"
                defaultValue={plan?.name}
                errors={state.fieldErrors?.name}
                required
            />
            <FormField
                label="Descrição"
                name="description"
                defaultValue={plan?.description ?? ''}
                errors={state.fieldErrors?.description}
            />
            <ConfirmSubmitButton
                confirmTitle={submitLabel}
                confirmDescription="Confirmar e salvar as informações do plano?"
                confirmLabel="Confirmar"
                disabled={pending}
            >
                {pending ? 'Salvando…' : submitLabel}
            </ConfirmSubmitButton>
        </form>
    );
}
