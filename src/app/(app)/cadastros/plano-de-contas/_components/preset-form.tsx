'use client';

import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { PillCombobox, PillInput, PillSelect } from '@/lib/_components/pill-fields';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/_utils/form';
import {
    PRESET_ROLES,
    PRESET_ROLE_LABELS,
    REQUIRED_ROLES,
    accountsForRole,
    type PresetRole,
} from '@/lib/_utils/preset-roles';
import type { BillingAccount } from '@/lib/api/schemas/billing';
import type { Preset } from '@/lib/api/schemas/preset';
import { useActionState, useEffect, useState, type ReactNode } from 'react';
import { accountOptionLabel } from './account-option-label';

type PresetFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    accounts: BillingAccount[];
    /** Plano do preset: enviado no cadastro e fixo na edição. */
    billingPlanId: string;
    preset?: Preset;
    /** Ação extra à esquerda do botão de salvar (ex.: excluir). */
    footerStart?: ReactNode;
    /** Chamado depois que o preset é salvo. */
    onSuccess?: () => void;
};

/** Preset nos campos em pílula: nome, descrição, status (na edição) e uma conta do plano para cada papel. */
export function PresetForm({
    action,
    accounts,
    billingPlanId,
    preset,
    footerStart,
    onSuccess,
}: PresetFormProps) {
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    useActionToast(state);
    const [status, setStatus] = useState(preset?.isActive === false ? 'false' : 'true');
    const [roles, setRoles] = useState<Record<string, string>>(() =>
        Object.fromEntries(PRESET_ROLES.map(role => [role, preset?.accounts[role]?.id ?? ''])),
    );
    const errors = (field: string) => state.fieldErrors?.[field];

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Salvando histórico padrão…" />
            {!preset && <input type="hidden" name="billingPlanId" value={billingPlanId} />}

            <div className="grid grid-cols-2 gap-3">
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Nome"
                    name="name"
                    defaultValue={preset?.name}
                    required
                    errors={errors('name')}
                />
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Descrição"
                    name="description"
                    defaultValue={preset?.description ?? ''}
                    errors={errors('description')}
                />
                {preset && (
                    <PillSelect
                        className={FILTER_PILL_CLASS}
                        label="Status"
                        name="isActive"
                        value={status}
                        onChange={setStatus}
                        options={[
                            { value: 'true', label: 'Ativo' },
                            { value: 'false', label: 'Inativo' },
                        ]}
                    />
                )}
            </div>

            <p className="text-muted-foreground pl-4 text-xs font-semibold tracking-wide uppercase">
                Contas por papel
            </p>
            <div className="grid grid-cols-2 gap-3">
                {PRESET_ROLES.map((role: PresetRole) => (
                    <PillCombobox
                        key={role}
                        className={FILTER_PILL_CLASS}
                        label={`${PRESET_ROLE_LABELS[role]}${REQUIRED_ROLES.includes(role) ? ' *' : ''}`}
                        name={`accounts.${role}`}
                        value={roles[role]}
                        onChange={value => setRoles(current => ({ ...current, [role]: value }))}
                        options={accountsForRole(accounts, role).map(account => ({
                            value: account.id,
                            label: accountOptionLabel(account),
                            searchText: `${account.code} ${account.name}`,
                        }))}
                        allowEmpty={!REQUIRED_ROLES.includes(role)}
                        errors={errors(`accounts.${role}`) ?? errors('accounts')}
                    />
                ))}
            </div>

            <div className="flex items-center justify-between gap-3">
                <div>{footerStart}</div>
                <ConfirmSubmitButton
                    confirmTitle={preset ? 'Salvar histórico padrão' : 'Criar histórico padrão'}
                    confirmDescription="Confirmar e salvar as informações do histórico padrão?"
                    confirmLabel="Confirmar"
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending
                        ? 'Salvando…'
                        : preset
                          ? 'Salvar histórico padrão'
                          : 'Criar histórico padrão'}
                </ConfirmSubmitButton>
            </div>
        </form>
    );
}
