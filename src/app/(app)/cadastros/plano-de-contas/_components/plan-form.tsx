'use client';

import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { PillInput } from '@/lib/_components/pill-fields';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/_utils/form';
import type { BillingPlan } from '@/lib/api/schemas/billing';
import { useActionState, useEffect } from 'react';

type PlanFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    plan?: BillingPlan;
    /** Chamado depois que o plano é salvo. */
    onSuccess?: () => void;
};

/** Plano de contas nos campos em pílula (cadastro e edição). */
export function PlanForm({ action, plan, onSuccess }: PlanFormProps) {
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    useActionToast(state);

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Salvando plano…" />
            <div className="grid grid-cols-2 gap-3">
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Nome"
                    name="name"
                    defaultValue={plan?.name}
                    required
                    errors={state.fieldErrors?.name}
                />
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Descrição"
                    name="description"
                    defaultValue={plan?.description ?? ''}
                    errors={state.fieldErrors?.description}
                />
            </div>
            <div className="flex justify-end">
                <ConfirmSubmitButton
                    confirmTitle={plan ? 'Salvar plano' : 'Criar plano'}
                    confirmDescription="Confirmar e salvar as informações do plano?"
                    confirmLabel="Confirmar"
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending ? 'Salvando…' : plan ? 'Salvar plano' : 'Criar plano'}
                </ConfirmSubmitButton>
            </div>
        </form>
    );
}
