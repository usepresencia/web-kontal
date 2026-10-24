'use client';

import type { PartyOption } from '@/actions/parties';
import { AmountInput } from '@/lib/_components/amount-input';
import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { FieldError, PillCombobox, PillInput, PillSelect } from '@/lib/_components/pill-fields';
import { useActionToast } from '@/lib/_components/use-action-toast';
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
type PresetOption = Option & { defaultAccountId: string | null };

type TitleFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    type: 'INCOME' | 'EXPENSE';
    /** Clientes ou fornecedores do tipo do título, com o preset padrão de cada um. */
    parties: PartyOption[];
    presets: PresetOption[];
    /** Contas de ativo ou despesa para a compra de ativo (só em título a pagar). */
    destinationAccounts?: Option[];
    /** Contas financeiras onde a baixa na hora é registrada. */
    financialAccounts?: Option[];
    /** Cadastra o saldo ou a despesa inicial (título de implantação) no lugar de um título comum. */
    opening?: boolean;
    /** Cadastra um parcelamento ou recorrência: a repetição é obrigatória e não há baixa na hora. */
    series?: boolean;
    /** Chamado depois que o título é criado. */
    onSuccess?: () => void;
};

const toOptions = (labels: Record<string, string>) =>
    Object.entries(labels).map(([value, label]) => ({ value, label }));

const PAYMENT_METHODS = toOptions(PAYMENT_METHOD_LABELS);

const SERIES_OPTIONS: Option[] = toOptions(SERIES_KIND_LABELS);

const REPEAT_OPTIONS: Option[] = [{ value: 'NONE', label: 'Sem repetição' }, ...SERIES_OPTIONS];

/** Cadastro de título nos campos em pílula: com parcelamento, recorrência e baixa na hora, ou como saldo/despesa inicial. */
export function TitleForm({
    action,
    type,
    parties,
    presets,
    destinationAccounts = [],
    financialAccounts = [],
    opening = false,
    series = false,
    onSuccess,
}: TitleFormProps) {
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    useActionToast(state);
    /** Despesa do histórico padrão, se o plano já tiver uma definida e ela estiver entre as contas de destino. */
    const defaultDestinationFor = (presetId: string) => {
        const accountId = presets.find(item => item.value === presetId)?.defaultAccountId;
        return accountId && destinationAccounts.some(item => item.value === accountId)
            ? accountId
            : '';
    };

    const [party, setParty] = useState('');
    const [preset, setPreset] = useState(presets[0]?.value ?? '');
    const [destination, setDestination] = useState(() => defaultDestinationFor(preset));
    const [payNow, setPayNow] = useState(false);
    const [account, setAccount] = useState('');
    const [method, setMethod] = useState('PIX');
    const [repeat, setRepeat] = useState(series ? 'INSTALLMENT' : 'NONE');
    const [frequency, setFrequency] = useState('');
    const labels = entryLabels(type);
    const initialLabel = labels.opening.toLowerCase();
    const canPayNow = !opening && repeat === 'NONE' && financialAccounts.length > 0;
    const errors = (field: string) => state.fieldErrors?.[field];
    const submitTitle = opening
        ? `Registrar ${initialLabel}`
        : series
          ? 'Criar parcelamento'
          : payNow
            ? labels.action
            : 'Criar título';

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay
                message={
                    opening
                        ? `Salvando ${initialLabel}…`
                        : series
                          ? 'Salvando parcelamento…'
                          : payNow
                            ? labels.pending
                            : 'Salvando título…'
                }
            />
            <input type="hidden" name="type" value={type} />
            {opening && <input type="hidden" name="isOpening" value="true" />}

            <AmountInput
                name="amount"
                label="Valor"
                tone={type === 'EXPENSE' ? 'negative' : 'positive'}
                errors={errors('amount')}
            />

            <div className="grid grid-cols-2 gap-3">
                <PillCombobox
                    className={FILTER_PILL_CLASS}
                    label={type === 'EXPENSE' ? 'Fornecedor' : 'Cliente'}
                    name="partyId"
                    value={party}
                    onChange={value => {
                        setParty(value);
                        const standard = parties.find(
                            item => item.value === value,
                        )?.defaultPresetId;
                        if (standard && presets.some(item => item.value === standard)) {
                            setPreset(standard);
                            setDestination(defaultDestinationFor(standard));
                        }
                    }}
                    options={parties}
                    placeholder="Selecione"
                    errors={errors('partyId')}
                />
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Título"
                    name="description"
                    required
                    errors={errors('description')}
                />
                <PillCombobox
                    className={FILTER_PILL_CLASS}
                    label="Histórico padrão"
                    name="presetId"
                    value={preset}
                    onChange={value => {
                        setPreset(value);
                        setDestination(defaultDestinationFor(value));
                    }}
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
                {opening ? (
                    <>
                        <PillInput
                            className={FILTER_PILL_CLASS}
                            label="Data de implantação"
                            name="openingDate"
                            type="date"
                            errors={errors('openingDate')}
                        />
                        <PillInput
                            className={FILTER_PILL_CLASS}
                            label="Já baixado (R$, opcional)"
                            name="settledAmount"
                            inputMode="decimal"
                            errors={errors('settledAmount')}
                        />
                    </>
                ) : (
                    <PillInput
                        className={FILTER_PILL_CLASS}
                        label="Emissão (opcional)"
                        name="issueDate"
                        type="date"
                        errors={errors('issueDate')}
                    />
                )}
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
                {!opening && type === 'EXPENSE' && destinationAccounts.length > 0 && (
                    <PillCombobox
                        className={FILTER_PILL_CLASS}
                        label="Conta de destino"
                        name="destinationAccountId"
                        value={destination}
                        onChange={setDestination}
                        options={destinationAccounts}
                        allowEmpty
                        emptyLabel="Selecione a conta"
                        placeholder="Selecione a conta"
                        errors={errors('destinationAccountId')}
                    />
                )}
                {!opening && (
                    <>
                        <PillSelect
                            className={FILTER_PILL_CLASS}
                            label={series ? 'Tipo' : 'Repetição'}
                            name="repeat"
                            value={repeat}
                            onChange={next => setRepeat(next || (series ? 'INSTALLMENT' : 'NONE'))}
                            options={series ? SERIES_OPTIONS : REPEAT_OPTIONS}
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
                                    placeholder={
                                        repeat === 'INSTALLMENT' ? 'Mensal (padrão)' : 'Selecione'
                                    }
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

            <div className="flex justify-end">
                <ConfirmSubmitButton
                    confirmTitle={submitTitle}
                    confirmDescription={
                        opening
                            ? `Registrar ${initialLabel} deste título?`
                            : series
                              ? 'Cadastrar este parcelamento e gerar as ocorrências?'
                              : payNow
                                ? `${labels.now} e cadastrar este título?`
                                : 'Cadastrar este título?'
                    }
                    confirmLabel={opening ? 'Registrar' : payNow ? labels.submit : 'Criar'}
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending ? (payNow ? labels.pending : 'Salvando…') : submitTitle}
                </ConfirmSubmitButton>
            </div>
        </form>
    );
}
