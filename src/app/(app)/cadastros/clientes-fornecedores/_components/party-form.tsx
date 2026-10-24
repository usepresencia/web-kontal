'use client';

import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { PillCombobox, PillInput, PillSelect } from '@/lib/_components/pill-fields';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { useCnpjLookup } from '@/lib/_hooks/use-cnpj-lookup';
import { maskCep, maskCpfCnpj, maskPhone } from '@/lib/_utils/document';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/_utils/form';
import { PARTY_KIND_LABELS, type Party, type PartyKind } from '@/lib/api/schemas/party';
import { useActionState, useEffect, useState, type ComponentProps, type ReactNode } from 'react';

type PartyFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    presets: { value: string; label: string }[];
    party?: Party;
    /** Tipo pré-definido (quando aberto via dropdown): esconde o campo Tipo no formulário. */
    defaultKind?: PartyKind;
    /** Ação extra à esquerda do botão de salvar (ex.: excluir). */
    footerStart?: ReactNode;
    /** Chamado depois que o cadastro é salvo. */
    onSuccess?: () => void;
};

const KIND_OPTIONS = Object.entries(PARTY_KIND_LABELS).map(([value, label]) => ({ value, label }));

const SECTION_CLASS = 'text-muted-foreground pl-4 text-xs font-semibold tracking-wide uppercase';

type PartyFormValues = {
    name: string;
    socialReason: string;
    document: string;
    email: string;
    phone: string;
    'address.zipCode': string;
    'address.street': string;
    'address.number': string;
    'address.complement': string;
    'address.neighborhood': string;
    'address.city': string;
    'address.state': string;
};

/** Cliente ou fornecedor nos campos em pílula: dados, preset padrão e endereço opcional. */
export function PartyForm({
    action,
    presets,
    party,
    defaultKind,
    footerStart,
    onSuccess,
}: PartyFormProps) {
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    useActionToast(state);
    const [kind, setKind] = useState<string>(party?.kind ?? defaultKind ?? 'SUPPLIER');
    const [preset, setPreset] = useState(party?.defaultPresetId ?? '');
    const [status, setStatus] = useState(party?.isActive === false ? 'false' : 'true');

    const address = party?.address;
    const [values, setValues] = useState<PartyFormValues>(() => ({
        name: party?.name ?? '',
        socialReason: party?.socialReason ?? '',
        document: maskCpfCnpj(party?.document ?? ''),
        email: party?.email ?? '',
        phone: maskPhone(party?.phone ?? ''),
        'address.zipCode': maskCep(address?.zipCode ?? ''),
        'address.street': address?.street ?? '',
        'address.number': address?.number ?? '',
        'address.complement': address?.complement ?? '',
        'address.neighborhood': address?.neighborhood ?? '',
        'address.city': address?.city ?? '',
        'address.state': address?.state ?? '',
    }));

    const lookup = useCnpjLookup(party?.document, setValues);

    const errors = (field: string) => state.fieldErrors?.[field];

    const setField = (name: keyof PartyFormValues, value: string) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleDocumentChange = (raw: string) => {
        const masked = maskCpfCnpj(raw);
        setField('document', masked);
        lookup(masked.replace(/\D/g, ''));
    };

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    const field = (
        label: string,
        name: keyof PartyFormValues,
        extra: Partial<ComponentProps<typeof PillInput>> = {},
    ) => (
        <PillInput
            className={FILTER_PILL_CLASS}
            label={label}
            name={name}
            value={values[name]}
            onChange={e => setField(name, e.target.value)}
            errors={errors(name)}
            {...extra}
        />
    );

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Salvando cadastro…" />

            <div className="grid grid-cols-2 gap-3">
                {field('Nome', 'name', { required: true })}
                {field('Razão social', 'socialReason', { required: true })}
                {field('CPF ou CNPJ', 'document', {
                    inputMode: 'numeric',
                    placeholder: '000.000.000-00 ou 00.000.000/0000-00',
                    maxLength: 18,
                    required: true,
                    onChange: e => handleDocumentChange(e.target.value),
                })}
                {defaultKind ? (
                    <input type="hidden" name="kind" value={defaultKind} />
                ) : (
                    <PillSelect
                        className={FILTER_PILL_CLASS}
                        label="Tipo"
                        name="kind"
                        value={kind}
                        onChange={setKind}
                        options={KIND_OPTIONS}
                        errors={errors('kind')}
                    />
                )}
                {field('E-mail', 'email', { type: 'email' })}
                {field('Telefone', 'phone', {
                    type: 'tel',
                    inputMode: 'numeric',
                    placeholder: '(00) 00000-0000',
                    maxLength: 15,
                    onChange: e => setField('phone', maskPhone(e.target.value)),
                })}
                <PillCombobox
                    className={FILTER_PILL_CLASS}
                    label="Histórico padrão"
                    name="defaultPresetId"
                    value={preset}
                    onChange={setPreset}
                    options={presets}
                    allowEmpty
                    emptyLabel="Sem histórico padrão"
                    placeholder="Sem histórico padrão"
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
                {field('CEP', 'address.zipCode', {
                    inputMode: 'numeric',
                    placeholder: '00000-000',
                    maxLength: 9,
                    onChange: e => setField('address.zipCode', maskCep(e.target.value)),
                })}
                {field('Rua', 'address.street')}
                {field('Número', 'address.number')}
                {field('Complemento', 'address.complement')}
                {field('Bairro', 'address.neighborhood')}
                {field('Cidade', 'address.city')}
                {field('UF', 'address.state', { maxLength: 2 })}
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
