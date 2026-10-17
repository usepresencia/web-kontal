'use client';

import { createManualEntryAction } from '@/actions/journal';
import { FormField } from '@/lib/_components/form-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { Button } from '@/lib/_components/ui/button';
import { Input } from '@/lib/_components/ui/input';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { amountToCents, formatMoney, toApiAmount } from '@/lib/_utils/money';
import { Plus, Trash2 } from 'lucide-react';
import { useActionState, useMemo, useState } from 'react';

type Line = { key: number; accountId: string; debit: string; credit: string; memo: string };

type ManualEntryFormProps = { accounts: { value: string; label: string }[]; today: string };

const emptyLine = (key: number): Line => ({ key, accountId: '', debit: '', credit: '', memo: '' });

const cents = (text: string) => {
    const amount = toApiAmount(text);
    return amount === null ? BigInt(0) : amountToCents(amount);
};

/** Formulário de lançamento manual com linhas dinâmicas e conferência de débitos e créditos. */
export function ManualEntryForm({ accounts, today }: ManualEntryFormProps) {
    const [state, formAction, pending] = useActionState(
        createManualEntryAction,
        INITIAL_FORM_STATE,
    );
    const [lines, setLines] = useState<Line[]>([emptyLine(1), emptyLine(2)]);
    const [nextKey, setNextKey] = useState(3);

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

    return (
        <form action={formAction} className="space-y-6">
            <FormPendingOverlay message="Lançando…" />
            <input type="hidden" name="linesJson" value={linesJson} />

            <div className="grid max-w-2xl gap-4 md:grid-cols-2">
                <FormField
                    label="Data"
                    name="date"
                    type="date"
                    defaultValue={today}
                    errors={state.fieldErrors?.date}
                    required
                />
                <FormField
                    label="Descrição"
                    name="description"
                    errors={state.fieldErrors?.description}
                    required
                />
            </div>

            <fieldset className="space-y-3">
                <legend className="font-display text-lg font-semibold">Linhas</legend>
                {lines.map(line => (
                    <div
                        key={line.key}
                        className="grid items-end gap-2 md:grid-cols-[2fr_1fr_1fr_2fr_auto]"
                    >
                        <select
                            aria-label="Conta"
                            value={line.accountId}
                            onChange={event => update(line.key, 'accountId', event.target.value)}
                            className="border-input bg-background h-10 rounded-md border px-3 text-sm"
                        >
                            <option value="">Conta…</option>
                            {accounts.map(account => (
                                <option key={account.value} value={account.value}>
                                    {account.label}
                                </option>
                            ))}
                        </select>
                        <Input
                            aria-label="Débito"
                            placeholder="Débito"
                            inputMode="decimal"
                            value={line.debit}
                            onChange={event => update(line.key, 'debit', event.target.value)}
                        />
                        <Input
                            aria-label="Crédito"
                            placeholder="Crédito"
                            inputMode="decimal"
                            value={line.credit}
                            onChange={event => update(line.key, 'credit', event.target.value)}
                        />
                        <Input
                            aria-label="Histórico"
                            placeholder="Histórico"
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
                                setLines(current => current.filter(item => item.key !== line.key))
                            }
                        >
                            <Trash2 />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setLines(current => [...current, emptyLine(nextKey)]);
                        setNextKey(current => current + 1);
                    }}
                >
                    <Plus />
                    Adicionar linha
                </Button>
            </fieldset>

            <p
                className={balanced ? 'text-positive text-sm' : 'text-muted-foreground text-sm'}
                role="status"
            >
                Débitos {formatMoney(totals.debit.toString())} · Créditos{' '}
                {formatMoney(totals.credit.toString())}
                {balanced ? ' · Balanceado' : ' · Débitos e créditos precisam ser iguais'}
            </p>

            {state.fieldErrors &&
                Object.keys(state.fieldErrors).some(key => key.startsWith('lines')) && (
                    <ul role="alert" className="text-negative list-disc pl-5 text-sm">
                        {Object.entries(state.fieldErrors)
                            .filter(([key]) => key.startsWith('lines'))
                            .flatMap(([, messages]) => messages)
                            .map((message, index) => (
                                <li key={index}>{message}</li>
                            ))}
                    </ul>
                )}
            {state.message && (
                <p role="alert" className="text-negative text-sm">
                    {state.message}
                </p>
            )}

            <Button type="submit" disabled={pending || !balanced}>
                {pending ? 'Lançando…' : 'Lançar'}
            </Button>
        </form>
    );
}
