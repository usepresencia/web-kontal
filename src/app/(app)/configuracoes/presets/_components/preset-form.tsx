'use client';

import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FormField } from '@/lib/_components/form-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { SelectField } from '@/lib/_components/select-field';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/_utils/form';
import {
    PRESET_ROLES,
    PRESET_ROLE_LABELS,
    REQUIRED_ROLES,
    accountsForRole,
} from '@/lib/_utils/preset-roles';
import type { BillingAccount } from '@/lib/api/schemas/billing';
import type { Preset } from '@/lib/api/schemas/preset';
import { useActionState } from 'react';

type PresetFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    accounts: BillingAccount[];
    /** Plano do preset: enviado no cadastro e fixo na edição. */
    billingPlanId: string;
    preset?: Preset;
    submitLabel: string;
};

/** Formulário de preset: nome e uma conta do plano para cada papel. */
export function PresetForm({
    action,
    accounts,
    billingPlanId,
    preset,
    submitLabel,
}: PresetFormProps) {
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    useActionToast(state);
    const errors = (field: string) => state.fieldErrors?.[field];

    return (
        <form action={formAction} className="max-w-2xl space-y-6">
            <FormPendingOverlay message="Salvando preset…" />
            {!preset && <input type="hidden" name="billingPlanId" value={billingPlanId} />}

            <div className="grid gap-4 md:grid-cols-2">
                <FormField
                    label="Nome"
                    name="name"
                    defaultValue={preset?.name}
                    errors={errors('name')}
                    required
                />
                <FormField
                    label="Descrição"
                    name="description"
                    defaultValue={preset?.description ?? ''}
                    errors={errors('description')}
                />
                {preset && (
                    <SelectField
                        label="Status"
                        name="isActive"
                        options={[
                            { value: 'true', label: 'Ativo' },
                            { value: 'false', label: 'Inativo' },
                        ]}
                        defaultValue={preset.isActive ? 'true' : 'false'}
                    />
                )}
            </div>

            <fieldset className="grid gap-4 md:grid-cols-2">
                <legend className="font-display mb-2 text-lg font-semibold">
                    Contas por papel
                </legend>
                {PRESET_ROLES.map(role => (
                    <SelectField
                        key={role}
                        label={`${PRESET_ROLE_LABELS[role]}${REQUIRED_ROLES.includes(role) ? ' *' : ''}`}
                        name={`accounts.${role}`}
                        options={accountsForRole(accounts, role).map(account => ({
                            value: account.id,
                            label: `${account.code} ${account.name}`,
                        }))}
                        defaultValue={preset?.accounts[role]?.id}
                        allowEmpty={!REQUIRED_ROLES.includes(role)}
                        errors={errors(`accounts.${role}`) ?? errors('accounts')}
                    />
                ))}
            </fieldset>

            <ConfirmSubmitButton
                confirmTitle={submitLabel}
                confirmDescription="Confirmar e salvar as informações do preset?"
                confirmLabel="Confirmar"
                disabled={pending}
            >
                {pending ? 'Salvando…' : submitLabel}
            </ConfirmSubmitButton>
        </form>
    );
}
