'use client';

import { AmountInput } from '@/lib/_components/amount-input';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { FieldError, PillInput, PillSelect } from '@/lib/_components/pill-fields';
import { Button } from '@/lib/_components/ui/button';
import { toLocalIsoDate } from '@/lib/_utils/dates';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/_utils/form';
import {
    PAYMENT_METHOD_LABELS,
    SERIES_FREQUENCY_LABELS,
    SERIES_KIND_LABELS,
    entryLabels,
} from '@/lib/_utils/title-labels';
import { useActionState, useEffect, useState } from 'react';

type Option = { value: string; label: string };

type TitleFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    type: 'INCOME' | 'EXPENSE';
    presets: Option[];
    /** Contas de ativo ou despesa para a compra de ativo (só em título a pagar). */
    destinationAccounts?: Option[];
    /** Contas financeiras onde a baixa na hora é registrada. */
    financialAccounts?: Option[];
    /** Chamado depois que o título é criado. */
    onSuccess?: () => void;
};

const toOptions = (labels: Record<string, string>) =>
    Object.entries(labels).map(([value, label]) => ({ value, label }));

const PAYMENT_METHODS = toOptions(PAYMENT_METHOD_LABELS);

const REPEAT_OPTIONS: Option[] = [
    { value: 'NONE', label: 'Sem repetição' },
    ...toOptions(SERIES_KIND_LABELS),
];

/** Cadastro de título nos campos em pílula, com opção de parcelamento ou recorrência. */
export function TitleForm({
    action,
    type,
    presets,
    destinationAccounts = [],
    financialAccounts = [],
    onSuccess,
}: TitleFormProps) {
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    const [preset, setPreset] = useState(presets[0]?.value ?? '');
    const [destination, setDestination] = useState('');
    const [payNow, setPayNow] = useState(false);
    const [account, setAccount] = useState('');
    const [method, setMethod] = useState('PIX');
    const [repeat, setRepeat] = useState('NONE');
    const [frequency, setFrequency] = useState('');
    const labels = entryLabels(type);
    const canPayNow = repeat === 'NONE' && financialAccounts.length > 0;
    const errors = (field: string) => state.fieldErrors?.[field];

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Salvando título…" />
            <input type="hidden" name="type" value={type} />

            <AmountInput
                name="amount"
                label="Valor"
                tone={type === 'EXPENSE' ? 'negative' : 'positive'}
                errors={errors('amount')}
            />

            <div className="grid grid-cols-2 gap-3">
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Descrição"
                    name="description"
                    required
                    errors={errors('description')}
                />
                <PillSelect
                    className={FILTER_PILL_CLASS}
                    label="Preset"
                    name="presetId"
                    value={preset}
                    onChange={setPreset}
                    options={presets}
                    errors={errors('presetId')}
                />
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Vencimento"
                    name="expirationDate"
                    type="date"
                    errors={errors('expirationDate')}
                />
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Emissão (opcional)"
                    name="issueDate"
                    type="date"
                    errors={errors('issueDate')}
                />
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Juros mensais"
                    name="feesPercentageMonthly"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    placeholder="0"
                    suffix="%"
                    errors={errors('feesPercentageMonthly')}
                />
                {type === 'EXPENSE' && destinationAccounts.length > 0 && (
                    <PillSelect
                        className={FILTER_PILL_CLASS}
                        label="Conta de destino"
                        name="destinationAccountId"
                        value={destination}
                        onChange={setDestination}
                        options={destinationAccounts}
                        allowEmpty
                        emptyLabel="Despesa do preset (padrão)"
                        placeholder="Despesa do preset (padrão)"
                        errors={errors('destinationAccountId')}
                    />
                )}
                <PillSelect
                    className={FILTER_PILL_CLASS}
                    label="Repetição"
                    name="repeat"
                    value={repeat}
                    onChange={next => setRepeat(next || 'NONE')}
                    options={REPEAT_OPTIONS}
                    errors={errors('repeat')}
                />
                {repeat !== 'NONE' && (
                    <>
                        <PillSelect
                            className={FILTER_PILL_CLASS}
                            label="Frequência"
                            name="frequency"
                            value={frequency}
                            onChange={setFrequency}
                            options={toOptions(SERIES_FREQUENCY_LABELS)}
                            allowEmpty={repeat === 'INSTALLMENT'}
                            emptyLabel="Mensal (padrão)"
                            placeholder={repeat === 'INSTALLMENT' ? 'Mensal (padrão)' : 'Selecione'}
                            errors={errors('frequency')}
                        />
                        <PillInput
                            className={FILTER_PILL_CLASS}
                            label="Quantidade"
                            name="count"
                            type="number"
                            min={1}
                            errors={errors('count')}
                        />
                        <PillInput
                            className={FILTER_PILL_CLASS}
                            label="Ou data final"
                            name="until"
                            type="date"
                            errors={errors('until')}
                        />
                    </>
                )}
            </div>

            {canPayNow && (
                <div className="space-y-3">
                    <label className="flex cursor-pointer items-center gap-3 pl-4 text-sm font-medium">
                        <input
                            type="checkbox"
                            name="payNow"
                            value="true"
                            checked={payNow}
                            onChange={event => setPayNow(event.target.checked)}
                            className="accent-accent size-4"
                        />
                        {labels.now}
                    </label>
                    {payNow && (
                        <div className="grid grid-cols-2 gap-3">
                            <PillSelect
                                className={FILTER_PILL_CLASS}
                                label="Conta"
                                name="paymentAccountId"
                                value={account}
                                onChange={setAccount}
                                options={financialAccounts}
                                placeholder="Conta"
                                errors={errors('paymentAccountId')}
                            />
                            <PillInput
                                className={FILTER_PILL_CLASS}
                                label="Data"
                                name="paidAt"
                                type="date"
                                defaultValue={toLocalIsoDate(new Date())}
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
                        </div>
                    )}
                    <FieldError errors={errors('payNow')} />
                </div>
            )}

            {state.message && !state.ok && (
                <p role="alert" className="text-negative text-sm">
                    {state.message}
                </p>
            )}

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending ? 'Salvando…' : 'Criar título'}
                </Button>
            </div>
        </form>
    );
}
