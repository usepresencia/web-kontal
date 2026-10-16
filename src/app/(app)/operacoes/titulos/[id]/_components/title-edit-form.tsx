'use client';

import { updateTitleAction } from '@/actions/titles';
import { FormField } from '@/lib/_components/form-field';
import { Button } from '@/lib/_components/ui/button';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { fractionToPercent } from '@/lib/_utils/percent';
import type { Title } from '@/lib/api/schemas/title';
import { useActionState } from 'react';

/** Edição de descrição, vencimento e juros do título. */
export function TitleEditForm({ title }: { title: Title }) {
    const [state, formAction, pending] = useActionState(
        updateTitleAction.bind(null, title.id),
        INITIAL_FORM_STATE,
    );
    const errors = (field: string) => state.fieldErrors?.[field];

    return (
        <form action={formAction} className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Dados do título</h2>
            <div className="grid gap-4 md:grid-cols-3">
                <FormField
                    label="Descrição"
                    name="description"
                    defaultValue={title.description}
                    errors={errors('description')}
                    required
                />
                <FormField
                    label="Vencimento"
                    name="expirationDate"
                    type="date"
                    defaultValue={title.expirationDate}
                    errors={errors('expirationDate')}
                    required
                />
                <FormField
                    label="Juros mensais"
                    name="feesPercentageMonthly"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    suffix="%"
                    defaultValue={fractionToPercent(title.feesPercentageMonthly)}
                    errors={errors('feesPercentageMonthly')}
                />
            </div>
            {state.message && (
                <p
                    role={state.ok ? 'status' : 'alert'}
                    className={state.ok ? 'text-positive' : 'text-negative'}
                >
                    {state.message}
                </p>
            )}
            <Button type="submit" variant="outline" disabled={pending}>
                {pending ? 'Salvando…' : 'Salvar alterações'}
            </Button>
        </form>
    );
}
