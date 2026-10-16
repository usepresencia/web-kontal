'use client';

import { createEntryAction } from '@/actions/titles';
import { FormField } from '@/lib/_components/form-field';
import { SelectField } from '@/lib/_components/select-field';
import { Button } from '@/lib/_components/ui/button';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { PAYMENT_METHOD_LABELS } from '@/lib/_utils/title-labels';
import { useActionState } from 'react';

type EntryFormProps = {
    titleId: string;
    accounts: { value: string; label: string }[];
    today: string;
    paying: boolean;
};

/** Registro de baixa: pagamento (título a pagar) ou recebimento (título a receber). */
export function EntryForm({ titleId, accounts, today, paying }: EntryFormProps) {
    const [state, formAction, pending] = useActionState(
        createEntryAction.bind(null, titleId),
        INITIAL_FORM_STATE,
    );
    const errors = (field: string) => state.fieldErrors?.[field];

    return (
        <form action={formAction} className="space-y-4">
            <h2 className="font-display text-lg font-semibold">
                {paying ? 'Registrar pagamento' : 'Registrar recebimento'}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
                <SelectField
                    label="Conta"
                    name="billingAccountId"
                    options={accounts}
                    errors={errors('billingAccountId')}
                />
                <FormField
                    label="Valor principal (R$)"
                    name="principalAmount"
                    inputMode="decimal"
                    errors={errors('principalAmount')}
                    required
                />
                <FormField
                    label="Data"
                    name="paidAt"
                    type="date"
                    defaultValue={today}
                    errors={errors('paidAt')}
                    required
                />
                <SelectField
                    label="Forma de pagamento"
                    name="paymentMethod"
                    options={Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
                        value,
                        label,
                    }))}
                    defaultValue="PIX"
                    errors={errors('paymentMethod')}
                />
                <FormField
                    label="Juros (R$)"
                    name="interestAmount"
                    inputMode="decimal"
                    errors={errors('interestAmount')}
                />
                <FormField
                    label="Multa (R$)"
                    name="fineAmount"
                    inputMode="decimal"
                    errors={errors('fineAmount')}
                />
                <FormField
                    label="Desconto (R$)"
                    name="discountAmount"
                    inputMode="decimal"
                    errors={errors('discountAmount')}
                />
                <FormField label="Observação" name="description" errors={errors('description')} />
            </div>
            {state.message && (
                <p
                    role={state.ok ? 'status' : 'alert'}
                    className={state.ok ? 'text-positive' : 'text-negative'}
                >
                    {state.message}
                </p>
            )}
            <Button type="submit" disabled={pending}>
                {pending ? 'Registrando…' : 'Registrar'}
            </Button>
        </form>
    );
}
