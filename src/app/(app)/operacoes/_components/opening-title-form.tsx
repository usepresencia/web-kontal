'use client';

import { AmountInput } from '@/lib/_components/amount-input';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { PillInput, PillSelect } from '@/lib/_components/pill-fields';
import { Button } from '@/lib/_components/ui/button';
import { INITIAL_FORM_STATE, type FormState } from '@/lib/_utils/form';
import { useActionState, useEffect, useState } from 'react';

type OpeningTitleFormProps = {
    action: (state: FormState, formData: FormData) => Promise<FormState>;
    type: 'INCOME' | 'EXPENSE';
    presets: { value: string; label: string }[];
    /** Chamado depois que o saldo inicial é registrado. */
    onSuccess?: () => void;
};

/** Cadastro de saldo inicial (título de implantação), com a data de implantação e o valor já baixado. */
export function OpeningTitleForm({ action, type, presets, onSuccess }: OpeningTitleFormProps) {
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    const [preset, setPreset] = useState(presets[0]?.value ?? '');
    const errors = (field: string) => state.fieldErrors?.[field];

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Salvando saldo inicial…" />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="isOpening" value="true" />

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
                    label="Data de implantação"
                    name="openingDate"
                    type="date"
                    errors={errors('openingDate')}
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
                    label="Já baixado (R$, opcional)"
                    name="settledAmount"
                    inputMode="decimal"
                    errors={errors('settledAmount')}
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
            </div>

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
                    {pending ? 'Salvando…' : 'Registrar saldo'}
                </Button>
            </div>
        </form>
    );
}
