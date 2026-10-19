'use client';

import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { FieldError, PillInput } from '@/lib/_components/pill-fields';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { useCnpjLookup } from '@/lib/_hooks/use-cnpj-lookup';
import { maskCep, maskCnpj } from '@/lib/_utils/document';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/_utils/form';
import type { Company } from '@/lib/api/schemas/company';
import { useActionState, useEffect, useState, type ComponentProps } from 'react';

type CompanyFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    company?: Company;
    /** Chamado depois que a empresa é salva. */
    onSuccess?: () => void;
};

const SECTION_CLASS = 'text-muted-foreground pl-4 text-xs font-semibold tracking-wide uppercase';

type CompanyFormValues = {
    name: string;
    socialReason: string;
    cnpj: string;
    openingDate: string;
    cnae: string;
    taxRegime: string;
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

/** Empresa nos campos em pílula, usada no cadastro e na edição; dados e endereço em dois blocos. */
export function CompanyForm({ action, company, onSuccess }: CompanyFormProps) {
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    useActionToast(state);
    const [values, setValues] = useState<CompanyFormValues>(() => ({
        name: company?.name ?? '',
        socialReason: company?.socialReason ?? '',
        cnpj: maskCnpj(company?.cnpj ?? ''),
        openingDate: company?.openingDate ?? '',
        cnae: company?.cnae ?? '',
        taxRegime: company?.taxRegime ?? '',
        email: company?.email ?? '',
        phone: company?.phone ?? '',
        'address.zipCode': maskCep(company?.address.zipCode ?? ''),
        'address.street': company?.address.street ?? '',
        'address.number': company?.address.number ?? '',
        'address.complement': company?.address.complement ?? '',
        'address.neighborhood': company?.address.neighborhood ?? '',
        'address.city': company?.address.city ?? '',
        'address.state': company?.address.state ?? '',
    }));

    const lookup = useCnpjLookup(company?.cnpj, setValues);

    const errors = (field: string) => state.fieldErrors?.[field];

    const setField = (name: keyof CompanyFormValues, value: string) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleCnpjChange = (raw: string) => {
        const masked = maskCnpj(raw);
        setField('cnpj', masked);
        lookup(masked.replace(/\D/g, ''));
    };

    const field = (
        label: string,
        name: keyof CompanyFormValues,
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

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Salvando empresa…" />

            <p className={SECTION_CLASS}>Dados da empresa</p>
            <div className="grid grid-cols-2 gap-3">
                {field('Nome fantasia', 'name', { required: true })}
                {field('Razão social', 'socialReason', { required: true })}
                {field('CNPJ', 'cnpj', {
                    inputMode: 'numeric',
                    placeholder: '00.000.000/0000-00',
                    maxLength: 18,
                    required: true,
                    onChange: e => handleCnpjChange(e.target.value),
                })}
                {field('Data de abertura', 'openingDate', { type: 'date' })}
                {field('CNAE', 'cnae', { required: true })}
                {field('Regime tributário', 'taxRegime', { required: true })}
                {field('E-mail', 'email', { type: 'email', required: true })}
                {field('Telefone', 'phone', { type: 'tel', required: true })}
            </div>

            <p className={SECTION_CLASS}>Endereço</p>
            <div className="grid grid-cols-2 gap-3">
                {field('CEP', 'address.zipCode', {
                    inputMode: 'numeric',
                    placeholder: '00000-000',
                    maxLength: 9,
                    required: true,
                    onChange: e => setField('address.zipCode', maskCep(e.target.value)),
                })}
                {field('Rua', 'address.street', { required: true })}
                {field('Número', 'address.number', { required: true })}
                {field('Complemento', 'address.complement')}
                {field('Bairro', 'address.neighborhood', {
                    required: true,
                })}
                {field('Cidade', 'address.city', { required: true })}
                {field('UF', 'address.state', {
                    maxLength: 2,
                    required: true,
                })}
            </div>
            <FieldError errors={errors('address')} />
            {state.fieldErrors?.openingDate && <FieldError errors={errors('openingDate')} />}

            <div className="flex justify-end">
                <ConfirmSubmitButton
                    confirmTitle={company ? 'Salvar empresa' : 'Cadastrar empresa'}
                    confirmDescription="Confirmar e salvar as informações da empresa?"
                    confirmLabel="Confirmar"
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending ? 'Salvando…' : company ? 'Salvar empresa' : 'Cadastrar empresa'}
                </ConfirmSubmitButton>
            </div>
        </form>
    );
}
