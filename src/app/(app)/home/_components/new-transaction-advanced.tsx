'use client';

import { PillInput, PillSelect } from '@/lib/_components/pill-fields';
import { SERIES_FREQUENCY_LABELS, SERIES_KIND_LABELS } from '@/lib/_utils/title-labels';
import { useState } from 'react';

type Option = { value: string; label: string };

type AdvancedFieldsProps = {
    isExpense: boolean;
    destinationAccounts: Option[];
    errors: (field: string) => string[] | undefined;
};

const toOptions = (labels: Record<string, string>): Option[] =>
    Object.entries(labels).map(([value, label]) => ({ value, label }));

const REPEAT_OPTIONS: Option[] = [
    { value: 'NONE', label: 'Sem repetição' },
    ...toOptions(SERIES_KIND_LABELS),
];

const OPENING_OPTIONS: Option[] = [
    { value: 'false', label: 'Não' },
    { value: 'true', label: 'Sim' },
];

/** Campos do título além do básico: emissão, juros, destino, implantação e repetição. */
export function AdvancedFields({ isExpense, destinationAccounts, errors }: AdvancedFieldsProps) {
    const [destination, setDestination] = useState('');
    const [isOpening, setIsOpening] = useState('false');
    const [repeat, setRepeat] = useState('NONE');
    const [frequency, setFrequency] = useState('');

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <PillInput
                    label="Emissão (opcional)"
                    name="issueDate"
                    type="date"
                    errors={errors('issueDate')}
                />
                <PillInput
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
            </div>

            {isExpense && destinationAccounts.length > 0 && (
                <PillSelect
                    label="Conta de destino (compra de ativo)"
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

            <div className="grid grid-cols-2 gap-3">
                <PillSelect
                    label="Título de implantação"
                    name="isOpening"
                    value={isOpening}
                    onChange={setIsOpening}
                    options={OPENING_OPTIONS}
                />
                <PillSelect
                    label="Repetição"
                    name="repeat"
                    value={repeat}
                    onChange={next => setRepeat(next || 'NONE')}
                    options={REPEAT_OPTIONS}
                    errors={errors('repeat')}
                />
            </div>

            {isOpening === 'true' && (
                <div className="grid grid-cols-2 gap-3">
                    <PillInput
                        label="Data de implantação"
                        name="openingDate"
                        type="date"
                        errors={errors('openingDate')}
                    />
                    <PillInput
                        label="Já baixado (R$, opcional)"
                        name="settledAmount"
                        inputMode="decimal"
                        errors={errors('settledAmount')}
                    />
                </div>
            )}

            {repeat !== 'NONE' && (
                <div className="grid grid-cols-3 gap-3">
                    <PillSelect
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
                        label="Quantidade"
                        name="count"
                        type="number"
                        min={1}
                        errors={errors('count')}
                    />
                    <PillInput
                        label="ou data final"
                        name="until"
                        type="date"
                        errors={errors('until')}
                    />
                </div>
            )}
        </div>
    );
}
