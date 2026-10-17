'use client';

import { FormField } from '@/lib/_components/form-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { Button } from '@/lib/_components/ui/button';
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
            {state.message && (
                <p
                    role={state.ok ? 'status' : 'alert'}
                    className={state.ok ? 'text-positive' : 'text-negative'}
                >
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={pending}>
                {pending ? 'Salvando…' : submitLabel}
            </Button>
        </form>
    );
}
