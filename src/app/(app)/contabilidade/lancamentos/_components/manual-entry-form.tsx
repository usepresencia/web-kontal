'use client';

import { createManualEntryAction } from '@/actions/journal';
import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { Divider } from '@/lib/_components/divider';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { PillInput, PillSelect } from '@/lib/_components/pill-fields';
import { Button } from '@/lib/_components/ui/button';
import { useActionToast } from '@/lib/_components/use-action-toast';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { amountToCents, formatMoney, toApiAmount } from '@/lib/_utils/money';
import { Plus, Trash2 } from 'lucide-react';
import { useActionState, useEffect, useMemo, useState } from 'react';

type Line = { key: number; accountId: string; debit: string; credit: string; memo: string };

type ManualEntryFormProps = {
    accounts: { value: string; label: string }[];
    today: string;
    /** Chamado depois que o lançamento é registrado. */
    onSuccess?: () => void;
};

const emptyLine = (key: number): Line => ({ key, accountId: '', debit: '', credit: '', memo: '' });

const cents = (text: string) => {
    const amount = toApiAmount(text);
    return amount === null ? BigInt(0) : amountToCents(amount);
};

/** Lançamento manual nos campos em pílula, com linhas dinâmicas e conferência de débitos e créditos. */
export function ManualEntryForm({ accounts, today, onSuccess }: ManualEntryFormProps) {
    const [state, formAction, pending] = useActionState(
        createManualEntryAction,
        INITIAL_FORM_STATE,
    );
    useActionToast(state);
    const [lines, setLines] = useState<Line[]>([emptyLine(1), emptyLine(2)]);
    const [nextKey, setNextKey] = useState(3);

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    const totals = useMemo(
        () => ({
            debit: lines.reduce((sum, line) => sum + cents(line.debit), BigInt(0)),
            credit: lines.reduce((sum, line) => sum + cents(line.credit), BigInt(0)),
        }),
        [lines],
    );
    const balanced = totals.debit === totals.credit && totals.debit > BigInt(0);

    const update = (key: number, field: keyof Line, value: string) =>
        setLines(current =>
            current.map(line => (line.key === key ? { ...line, [field]: value } : line)),
        );

    const linesJson = JSON.stringify(
        lines.map(({ accountId, debit, credit, memo }) => ({ accountId, debit, credit, memo })),
    );
    const lineErrors = Object.entries(state.fieldErrors ?? {})
        .filter(([key]) => key.startsWith('lines'))
        .flatMap(([, messages]) => messages);

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Lançando…" />
            <input type="hidden" name="linesJson" value={linesJson} />

            <div className="grid grid-cols-2 gap-3">
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Data"
                    name="date"
                    type="date"
                    defaultValue={today}
                    errors={state.fieldErrors?.date}
                />
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Descrição"
                    name="description"
                    required
                    errors={state.fieldErrors?.description}
                />
            </div>

            <div className="space-y-1">
                {lines.map((line, index) => (
                    <div key={line.key}>
                        {index > 0 && <Divider className="my-3" />}
                        <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                            <PillSelect
                                className={FILTER_PILL_CLASS}
                                label="Conta"
                                name={`lineAccount${line.key}`}
                                value={line.accountId}
                                onChange={value => update(line.key, 'accountId', value)}
                                options={accounts}
                                placeholder="Conta…"
                            />
                            <PillInput
                                className={FILTER_PILL_CLASS}
                                label="Histórico"
                                id={`memo${line.key}`}
                                value={line.memo}
                                onChange={event => update(line.key, 'memo', event.target.value)}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Remover linha"
                                disabled={lines.length <= 2}
                                onClick={() =>
                                    setLines(current =>
                                        current.filter(item => item.key !== line.key),
                                    )
                                }
                            >
                                <Trash2 />
                            </Button>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <PillInput
                                className={FILTER_PILL_CLASS}
                                label="Débito (R$)"
                                id={`debit${line.key}`}
                                inputMode="decimal"
                                value={line.debit}
                                onChange={event => update(line.key, 'debit', event.target.value)}
                            />
                            <PillInput
                                className={FILTER_PILL_CLASS}
                                label="Crédito (R$)"
                                id={`credit${line.key}`}
                                inputMode="decimal"
                                value={line.credit}
                                onChange={event => update(line.key, 'credit', event.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                        setLines(current => [...current, emptyLine(nextKey)]);
                        setNextKey(current => current + 1);
                    }}
                >
                    <Plus />
                    Adicionar linha
                </Button>
                <p
                    className={
                        balanced
                            ? 'text-positive text-right text-sm'
                            : 'text-muted-foreground text-right text-sm'
                    }
                    role="status"
                >
                    Débitos {formatMoney(totals.debit.toString())} · Créditos{' '}
                    {formatMoney(totals.credit.toString())}
                    {balanced ? ' · Balanceado' : ' · Precisam ser iguais'}
                </p>
            </div>

            {lineErrors.length > 0 && (
                <ul role="alert" className="text-negative list-disc pl-5 text-sm">
                    {lineErrors.map((message, index) => (
                        <li key={index}>{message}</li>
                    ))}
                </ul>
            )}

            <div className="flex justify-end">
                <ConfirmSubmitButton
                    confirmTitle="Lançar"
                    confirmDescription="Registrar este lançamento manual na contabilidade?"
                    confirmLabel="Lançar"
                    disabled={pending || !balanced}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending ? 'Lançando…' : 'Lançar'}
                </ConfirmSubmitButton>
            </div>
        </form>
    );
}
