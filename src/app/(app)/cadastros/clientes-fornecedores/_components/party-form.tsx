'use client';

import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { PillInput, PillSelect } from '@/lib/_components/pill-fields';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/_utils/form';
import { PARTY_KIND_LABELS, type Party } from '@/lib/api/schemas/party';
import { useActionState, useEffect, useState, type ComponentProps, type ReactNode } from 'react';

type PartyFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    presets: { value: string; label: string }[];
    party?: Party;
    /** Ação extra à esquerda do botão de salvar (ex.: excluir). */
    footerStart?: ReactNode;
    /** Chamado depois que o cadastro é salvo. */
    onSuccess?: () => void;
};

const KIND_OPTIONS = Object.entries(PARTY_KIND_LABELS).map(([value, label]) => ({ value, label }));

const SECTION_CLASS = 'text-muted-foreground pl-4 text-xs font-semibold tracking-wide uppercase';

/** Cliente ou fornecedor nos campos em pílula: dados, preset padrão e endereço opcional. */
export function PartyForm({ action, presets, party, footerStart, onSuccess }: PartyFormProps) {
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    useActionToast(state);
    const [kind, setKind] = useState<string>(party?.kind ?? 'SUPPLIER');
    const [preset, setPreset] = useState(party?.defaultPresetId ?? '');
    const [status, setStatus] = useState(party?.isActive === false ? 'false' : 'true');
    const errors = (field: string) => state.fieldErrors?.[field];
    const address = party?.address;

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    const field = (
        label: string,
        name: string,
        value: string | undefined,
        extra: Partial<ComponentProps<typeof PillInput>> = {},
    ) => (
        <PillInput
            className={FILTER_PILL_CLASS}
            label={label}
            name={name}
            defaultValue={value}
            errors={errors(name)}
            {...extra}
        />
    );

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Salvando cadastro…" />

            <div className="grid grid-cols-2 gap-3">
                {field('Nome', 'name', party?.name, { required: true })}
                {field('Razão social', 'socialReason', party?.socialReason, { required: true })}
                {field('CPF ou CNPJ', 'document', party?.document, {
                    inputMode: 'numeric',
                    required: true,
                })}
                <PillSelect
                    className={FILTER_PILL_CLASS}
                    label="Tipo"
                    name="kind"
                    value={kind}
                    onChange={setKind}
                    options={KIND_OPTIONS}
                    errors={errors('kind')}
                />
                {field('E-mail', 'email', party?.email, { type: 'email' })}
                {field('Telefone', 'phone', party?.phone, { type: 'tel' })}
                <PillSelect
                    className={FILTER_PILL_CLASS}
                    label="Preset padrão"
                    name="defaultPresetId"
                    value={preset}
                    onChange={setPreset}
                    options={presets}
                    allowEmpty
                    emptyLabel="Sem preset padrão"
                    placeholder="Sem preset padrão"
                    errors={errors('defaultPresetId')}
                />
                {party && (
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

            <p className={SECTION_CLASS}>Endereço (opcional)</p>
            <div className="grid grid-cols-2 gap-3">
                {field('CEP', 'address.zipCode', address?.zipCode, { inputMode: 'numeric' })}
                {field('Rua', 'address.street', address?.street)}
                {field('Número', 'address.number', address?.number)}
                {field('Complemento', 'address.complement', address?.complement ?? '')}
                {field('Bairro', 'address.neighborhood', address?.neighborhood)}
                {field('Cidade', 'address.city', address?.city)}
                {field('UF', 'address.state', address?.state, { maxLength: 2 })}
            </div>

            <div className="flex items-center justify-between gap-3">
                <div>{footerStart}</div>
                <ConfirmSubmitButton
                    confirmTitle={party ? 'Salvar cadastro' : 'Criar cadastro'}
                    confirmDescription="Confirmar e salvar as informações do cliente ou fornecedor?"
                    confirmLabel="Confirmar"
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending ? 'Salvando…' : party ? 'Salvar cadastro' : 'Criar cadastro'}
                </ConfirmSubmitButton>
            </div>
        </form>
    );
}
