'use client';

import { createEntryAction } from '@/actions/titles';
import { AmountInput } from '@/lib/_components/amount-input';
import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { PillInput, PillSelect } from '@/lib/_components/pill-fields';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { PAYMENT_METHOD_LABELS, entryLabels } from '@/lib/_utils/title-labels';
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
    /** O título é uma parcela de parcelamento: os textos dizem "parcela" em vez de "título". */
    installment?: boolean;
    /** Valor inicial do campo (ex.: o saldo em aberto, como "1234,50"). */
    defaultAmount?: string;
    /** Chamado depois que a baixa é registrada. */
    onSuccess?: () => void;
};

/** Baixa do título nos campos em pílula: pagamento (a pagar) ou recebimento (a receber). */
export function EntryForm({
    titleId,
    accounts,
    today,
    paying,
    installment = false,
    defaultAmount,
    onSuccess,
}: EntryFormProps) {
    const [state, formAction, pending] = useActionState(
        createEntryAction.bind(null, titleId),
        INITIAL_FORM_STATE,
    );
    useActionToast(state);
    const [account, setAccount] = useState('');
    const [method, setMethod] = useState('PIX');
    const errors = (field: string) => state.fieldErrors?.[field];
    const labels = entryLabels(paying ? 'EXPENSE' : 'INCOME', installment);

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message={labels.overlay} />
            <AmountInput
                name="principalAmount"
                label="Valor"
                defaultValue={defaultAmount}
                tone={paying ? 'negative' : 'positive'}
                errors={errors('principalAmount')}
            />
            <div className="grid grid-cols-2 gap-3">
                <PillSelect
                    className={FILTER_PILL_CLASS}
                    label="Conta"
                    name="billingAccountId"
                    value={account}
                    onChange={setAccount}
                    options={accounts}
                    placeholder="Conta"
                    errors={errors('billingAccountId')}
                />
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Data"
                    name="paidAt"
                    type="date"
                    defaultValue={today}
                    errors={errors('paidAt')}
                />
                <PillSelect
                    className={FILTER_PILL_CLASS}
                    label="Forma de pagamento"
                    name="paymentMethod"
                    value={method}
                    onChange={setMethod}
                    options={PAYMENT_METHODS}
                    errors={errors('paymentMethod')}
                />
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Juros (R$)"
                    name="interestAmount"
                    inputMode="decimal"
                    errors={errors('interestAmount')}
                />
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Multa (R$)"
                    name="fineAmount"
                    inputMode="decimal"
                    errors={errors('fineAmount')}
                />
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Desconto (R$)"
                    name="discountAmount"
                    inputMode="decimal"
                    errors={errors('discountAmount')}
                />
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Observação"
                    name="description"
                    errors={errors('description')}
                />
            </div>
            <div className="flex justify-end">
                <ConfirmSubmitButton
                    confirmTitle={labels.action}
                    confirmDescription={`Registrar ${paying ? 'o pagamento' : 'o recebimento'} d${installment ? 'esta parcela' : 'este título'}?`}
                    confirmLabel={labels.submit}
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending ? labels.pending : labels.submit}
                </ConfirmSubmitButton>
            </div>
        </form>
    );
}
