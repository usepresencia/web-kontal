'use client';

import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { FieldError, PillInput } from '@/lib/_components/pill-fields';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/_utils/form';
import type { Company } from '@/lib/api/schemas/company';
import { useActionState, useEffect } from 'react';

type CompanyFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    company?: Company;
    /** Chamado depois que a empresa é salva. */
    onSuccess?: () => void;
};

const SECTION_CLASS = 'text-muted-foreground pl-4 text-xs font-semibold tracking-wide uppercase';

/** Empresa nos campos em pílula, usada no cadastro e na edição; dados e endereço em dois blocos. */
export function CompanyForm({ action, company, onSuccess }: CompanyFormProps) {
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    useActionToast(state);
    const errors = (field: string) => state.fieldErrors?.[field];
    const field = (
        label: string,
        name: string,
        value: string | undefined,
        extra: Partial<React.ComponentProps<typeof PillInput>> = {},
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

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Salvando empresa…" />

            <p className={SECTION_CLASS}>Dados da empresa</p>
            <div className="grid grid-cols-2 gap-3">
                {field('Nome fantasia', 'name', company?.name, { required: true })}
                {field('Razão social', 'socialReason', company?.socialReason, { required: true })}
                {field('CNPJ', 'cnpj', company?.cnpj, { inputMode: 'numeric', required: true })}
                {field('Data de abertura', 'openingDate', company?.openingDate, { type: 'date' })}
                {field('CNAE', 'cnae', company?.cnae, { required: true })}
                {field('Regime tributário', 'taxRegime', company?.taxRegime, { required: true })}
                {field('E-mail', 'email', company?.email, { type: 'email', required: true })}
                {field('Telefone', 'phone', company?.phone, { type: 'tel', required: true })}
            </div>

            <p className={SECTION_CLASS}>Endereço</p>
            <div className="grid grid-cols-2 gap-3">
                {field('CEP', 'address.zipCode', company?.address.zipCode, {
                    inputMode: 'numeric',
                    required: true,
                })}
                {field('Rua', 'address.street', company?.address.street, { required: true })}
                {field('Número', 'address.number', company?.address.number, { required: true })}
                {field('Complemento', 'address.complement', company?.address.complement ?? '')}
                {field('Bairro', 'address.neighborhood', company?.address.neighborhood, {
                    required: true,
                })}
                {field('Cidade', 'address.city', company?.address.city, { required: true })}
                {field('UF', 'address.state', company?.address.state, {
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
