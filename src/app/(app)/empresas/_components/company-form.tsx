'use client';

import { FormField } from '@/lib/_components/form-field';
import { Button } from '@/lib/_components/ui/button';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/_utils/form';
import type { Company } from '@/lib/api/schemas/company';
import { useActionState } from 'react';

type CompanyFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    company?: Company;
    submitLabel: string;
};

/** Formulário de empresa usado no cadastro e na edição. */
export function CompanyForm({ action, company, submitLabel }: CompanyFormProps) {
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    const errors = (field: string) => state.fieldErrors?.[field];

    return (
        <form action={formAction} className="space-y-6">
            <fieldset className="grid gap-4 md:grid-cols-2">
                <legend className="font-display mb-2 text-lg font-semibold">
                    Dados da empresa
                </legend>
                <FormField
                    label="Nome fantasia"
                    name="name"
                    defaultValue={company?.name}
                    errors={errors('name')}
                    required
                />
                <FormField
                    label="Razão social"
                    name="socialReason"
                    defaultValue={company?.socialReason}
                    errors={errors('socialReason')}
                    required
                />
                <FormField
                    label="CNPJ"
                    name="cnpj"
                    defaultValue={company?.cnpj}
                    errors={errors('cnpj')}
                    inputMode="numeric"
                    required
                />
                <FormField
                    label="Data de abertura"
                    name="openingDate"
                    type="date"
                    defaultValue={company?.openingDate}
                    errors={errors('openingDate')}
                    required
                />
                <FormField
                    label="CNAE"
                    name="cnae"
                    defaultValue={company?.cnae}
                    errors={errors('cnae')}
                    required
                />
                <FormField
                    label="Regime tributário"
                    name="taxRegime"
                    defaultValue={company?.taxRegime}
                    errors={errors('taxRegime')}
                    required
                />
                <FormField
                    label="E-mail"
                    name="email"
                    type="email"
                    defaultValue={company?.email}
                    errors={errors('email')}
                    required
                />
                <FormField
                    label="Telefone"
                    name="phone"
                    type="tel"
                    defaultValue={company?.phone}
                    errors={errors('phone')}
                    required
                />
            </fieldset>

            <fieldset className="grid gap-4 md:grid-cols-2">
                <legend className="font-display mb-2 text-lg font-semibold">Endereço</legend>
                <FormField
                    label="CEP"
                    name="address.zipCode"
                    defaultValue={company?.address.zipCode}
                    errors={errors('address.zipCode')}
                    inputMode="numeric"
                    required
                />
                <FormField
                    label="Rua"
                    name="address.street"
                    defaultValue={company?.address.street}
                    errors={errors('address.street')}
                    required
                />
                <FormField
                    label="Número"
                    name="address.number"
                    defaultValue={company?.address.number}
                    errors={errors('address.number')}
                    required
                />
                <FormField
                    label="Complemento"
                    name="address.complement"
                    defaultValue={company?.address.complement ?? ''}
                    errors={errors('address.complement')}
                />
                <FormField
                    label="Bairro"
                    name="address.neighborhood"
                    defaultValue={company?.address.neighborhood}
                    errors={errors('address.neighborhood')}
                    required
                />
                <FormField
                    label="Cidade"
                    name="address.city"
                    defaultValue={company?.address.city}
                    errors={errors('address.city')}
                    required
                />
                <FormField
                    label="UF"
                    name="address.state"
                    defaultValue={company?.address.state}
                    errors={errors('address.state')}
                    maxLength={2}
                    required
                />
            </fieldset>

            {state.message && (
                <p
                    role={state.ok ? 'status' : 'alert'}
                    className={state.ok ? 'text-positive' : 'text-negative'}
                >
                    {state.message}
                </p>
            )}
            {state.fieldErrors?.address && (
                <p role="alert" className="text-negative text-sm">
                    Endereço: {state.fieldErrors.address.join(' ')}
                </p>
            )}

            <Button type="submit" disabled={pending}>
                {pending ? 'Salvando…' : submitLabel}
            </Button>
        </form>
    );
}
