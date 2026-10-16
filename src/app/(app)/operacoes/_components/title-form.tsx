'use client';

import { FormField } from '@/lib/_components/form-field';
import { SelectField } from '@/lib/_components/select-field';
import { Button } from '@/lib/_components/ui/button';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/_utils/form';
import { SERIES_FREQUENCY_LABELS, SERIES_KIND_LABELS } from '@/lib/_utils/title-labels';
import { useActionState, useState } from 'react';

type TitleFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    type: 'INCOME' | 'EXPENSE';
    presets: { value: string; label: string }[];
};

const toOptions = (labels: Record<string, string>) =>
    Object.entries(labels).map(([value, label]) => ({ value, label }));

/** Formulário de título, com opção de parcelamento ou recorrência. */
export function TitleForm({ action, type, presets }: TitleFormProps) {
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    const [repeat, setRepeat] = useState('NONE');
    const errors = (field: string) => state.fieldErrors?.[field];

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="type" value={type} />

            <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                    label="Preset"
                    name="presetId"
                    options={presets}
                    errors={errors('presetId')}
                />
                <FormField
                    label="Descrição"
                    name="description"
                    errors={errors('description')}
                    required
                />
                <FormField
                    label="Valor (R$)"
                    name="amount"
                    inputMode="decimal"
                    placeholder="1.234,50"
                    errors={errors('amount')}
                    required
                />
                <FormField
                    label="Vencimento"
                    name="expirationDate"
                    type="date"
                    errors={errors('expirationDate')}
                    required
                />
                <FormField
                    label="Emissão (opcional)"
                    name="issueDate"
                    type="date"
                    errors={errors('issueDate')}
                />
                <FormField
                    label="Juros mensais (0 a 1, ex.: 0,02 = 2%)"
                    name="feesPercentageMonthly"
                    inputMode="decimal"
                    errors={errors('feesPercentageMonthly')}
                />
            </div>

            <fieldset className="space-y-4">
                <legend className="font-display text-lg font-semibold">Repetição</legend>
                <SelectField
                    label="Tipo de repetição"
                    name="repeat"
                    options={[
                        { value: 'NONE', label: 'Sem repetição' },
                        ...toOptions(SERIES_KIND_LABELS),
                    ]}
                    defaultValue="NONE"
                    onValueChange={value => setRepeat(value || 'NONE')}
                />
                {repeat !== 'NONE' && (
                    <div className="grid gap-4 md:grid-cols-3">
                        <SelectField
                            label="Frequência"
                            name="frequency"
                            options={toOptions(SERIES_FREQUENCY_LABELS)}
                            allowEmpty={repeat === 'INSTALLMENT'}
                            placeholder={repeat === 'INSTALLMENT' ? 'Mensal (padrão)' : 'Selecione'}
                            errors={errors('frequency')}
                        />
                        <FormField
                            label="Quantidade"
                            name="count"
                            type="number"
                            min={1}
                            errors={errors('count')}
                        />
                        <FormField
                            label="ou data final"
                            name="until"
                            type="date"
                            errors={errors('until')}
                        />
                    </div>
                )}
            </fieldset>

            {state.message && (
                <p role="alert" className="text-negative text-sm">
                    {state.message}
                </p>
            )}

            <Button type="submit" disabled={pending}>
                {pending ? 'Salvando…' : 'Criar'}
            </Button>
        </form>
    );
}
