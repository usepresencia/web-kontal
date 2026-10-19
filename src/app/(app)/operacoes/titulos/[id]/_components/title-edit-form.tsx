'use client';

import { updateTitleAction } from '@/actions/titles';
import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FormField } from '@/lib/_components/form-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { useActionToast } from '@/lib/_components/use-action-toast';
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
    useActionToast(state);
    const errors = (field: string) => state.fieldErrors?.[field];

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Salvando título…" />
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
            <ConfirmSubmitButton
                confirmTitle="Salvar alterações"
                confirmDescription="Atualizar os dados deste título?"
                confirmLabel="Salvar"
                variant="outline"
                disabled={pending}
            >
                {pending ? 'Salvando…' : 'Salvar alterações'}
            </ConfirmSubmitButton>
        </form>
    );
}
