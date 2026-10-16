'use client';

import { createEntryAction } from '@/actions/titles';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { PillInput, PillSelect } from '@/lib/_components/pill-fields';
import { Button } from '@/lib/_components/ui/button';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { PAYMENT_METHOD_LABELS } from '@/lib/_utils/title-labels';
import { useActionState, useEffect, useState } from 'react';

const PAYMENT_METHODS = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
    value,
    label,
}));

type EntryFormProps = {
    titleId: string;
    accounts: { value: string; label: string }[];
    today: string;
    paying: boolean;
    /** Chamado depois que a baixa é registrada. */
    onSuccess?: () => void;
};

/** Registro de baixa nos campos em pílula: pagamento (título a pagar) ou recebimento (a receber). */
export function EntryForm({ titleId, accounts, today, paying, onSuccess }: EntryFormProps) {
    const [state, formAction, pending] = useActionState(
        createEntryAction.bind(null, titleId),
        INITIAL_FORM_STATE,
    );
    const [account, setAccount] = useState('');
    const [method, setMethod] = useState('PIX');
    const errors = (field: string) => state.fieldErrors?.[field];

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Registrando baixa…" />
            <h2 className="font-display text-base font-semibold">
                {paying ? 'Registrar pagamento' : 'Registrar recebimento'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
                <PillSelect
                    label="Conta"
                    name="billingAccountId"
                    value={account}
                    onChange={setAccount}
                    options={accounts}
                    placeholder="Conta"
                    errors={errors('billingAccountId')}
                />
                <PillInput
                    label="Valor principal (R$)"
                    name="principalAmount"
                    inputMode="decimal"
                    placeholder="0,00"
                    errors={errors('principalAmount')}
                />
                <PillInput
                    label="Data"
                    name="paidAt"
                    type="date"
                    defaultValue={today}
                    errors={errors('paidAt')}
                />
                <PillSelect
                    label="Forma de pagamento"
                    name="paymentMethod"
                    value={method}
                    onChange={setMethod}
                    options={PAYMENT_METHODS}
                    errors={errors('paymentMethod')}
                />
                <PillInput
                    label="Juros (R$)"
                    name="interestAmount"
                    inputMode="decimal"
                    errors={errors('interestAmount')}
                />
                <PillInput
                    label="Multa (R$)"
                    name="fineAmount"
                    inputMode="decimal"
                    errors={errors('fineAmount')}
                />
                <PillInput
                    label="Desconto (R$)"
                    name="discountAmount"
                    inputMode="decimal"
                    errors={errors('discountAmount')}
                />
                <PillInput label="Observação" name="description" errors={errors('description')} />
            </div>
            {state.message && (
                <p
                    role={state.ok ? 'status' : 'alert'}
                    className={state.ok ? 'text-positive' : 'text-negative'}
                >
                    {state.message}
                </p>
            )}
            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending ? 'Registrando…' : 'Registrar'}
                </Button>
            </div>
        </form>
    );
}
