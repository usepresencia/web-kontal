'use client';

import {
    createTitleAction,
    getTitleFormOptionsAction,
    type TitleFormOptions,
} from '@/actions/titles';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { FieldError, PILL_CLASS, PillInput, PillSelect } from '@/lib/_components/pill-fields';
import { Button } from '@/lib/_components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/lib/_components/ui/dialog';
import { cn } from '@/lib/_utils/cn';
import { toLocalIsoDate } from '@/lib/_utils/dates';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { ArrowDownCircle, ArrowUpCircle, ChevronDown, Plus } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { AdvancedFields } from './new-transaction-advanced';

type TitleType = 'INCOME' | 'EXPENSE';

const TYPES: { type: TitleType; label: string; icon: typeof ArrowUpCircle }[] = [
    { type: 'INCOME', label: 'Receita', icon: ArrowUpCircle },
    { type: 'EXPENSE', label: 'Despesa', icon: ArrowDownCircle },
];

const ADVANCED_FIELDS = [
    'issueDate',
    'feesPercentageMonthly',
    'destinationAccountId',
    'isOpening',
    'openingDate',
    'settledAmount',
    'repeat',
    'frequency',
    'count',
    'until',
];

type FormProps = { options: TitleFormOptions; onDone: () => void };

function NewTransactionForm({ options, onDone }: FormProps) {
    const [state, formAction, pending] = useActionState(createTitleAction, INITIAL_FORM_STATE);
    const [type, setType] = useState<TitleType>('INCOME');
    const [category, setCategory] = useState('');
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const errors = (field: string) => state.fieldErrors?.[field];

    useEffect(() => {
        if (state.ok) onDone();
    }, [state, onDone]);

    // Erro num campo escondido: abre as opções para o usuário ver onde corrigir.
    useEffect(() => {
        if (ADVANCED_FIELDS.some(field => state.fieldErrors?.[field])) setAdvancedOpen(true);
    }, [state]);

    const amountTone = type === 'INCOME' ? 'text-positive' : 'text-negative';

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Salvando transação…" />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="returnTo" value="/home" />

            <div
                role="radiogroup"
                aria-label="Tipo da transação"
                className="bg-muted/70 flex rounded-full p-1"
            >
                {TYPES.map(({ type: value, label, icon: Icon }) => (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={type === value}
                        onClick={() => setType(value)}
                        className={cn(
                            'flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors',
                            type === value
                                ? cn(
                                      'bg-card shadow-sm',
                                      value === 'INCOME' ? 'text-positive' : 'text-negative',
                                  )
                                : 'text-muted-foreground',
                        )}
                    >
                        <Icon className="size-4" aria-hidden="true" />
                        {label}
                    </button>
                ))}
            </div>

            <div>
                <label
                    htmlFor="amount"
                    className="text-muted-foreground text-xs font-semibold tracking-wide uppercase"
                >
                    Valor
                </label>
                <div className="border-border mt-1 flex items-baseline gap-2 border-b pb-1.5">
                    <span className={cn('font-display text-2xl font-bold', amountTone)}>R$</span>
                    <input
                        id="amount"
                        name="amount"
                        inputMode="decimal"
                        placeholder="0,00"
                        autoComplete="off"
                        required
                        aria-invalid={errors('amount') ? true : undefined}
                        className="font-display placeholder:text-muted-foreground/40 w-full bg-transparent text-4xl font-bold outline-none"
                    />
                </div>
                <FieldError errors={errors('amount')} />
            </div>

            <div>
                <input
                    name="description"
                    placeholder="Descrição (ex: Venda de bolos)"
                    aria-label="Descrição"
                    required
                    className={cn(PILL_CLASS, 'w-full')}
                />
                <FieldError errors={errors('description')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <PillSelect
                    label="Categoria"
                    name="presetId"
                    value={category}
                    onChange={setCategory}
                    options={options.presets}
                    placeholder="Categoria"
                    errors={errors('presetId')}
                />
                <PillInput
                    label="Vencimento"
                    name="expirationDate"
                    type="date"
                    defaultValue={toLocalIsoDate(new Date())}
                    required
                    errors={errors('expirationDate')}
                />
            </div>

            <button
                type="button"
                onClick={() => setAdvancedOpen(open => !open)}
                aria-expanded={advancedOpen}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-medium"
            >
                Mais opções
                <ChevronDown
                    className={cn('size-4 transition-transform', advancedOpen && 'rotate-180')}
                    aria-hidden="true"
                />
            </button>

            {/* Fica montado (só escondido) para não perder o que foi digitado ao recolher. */}
            <div hidden={!advancedOpen}>
                <AdvancedFields
                    isExpense={type === 'EXPENSE'}
                    destinationAccounts={options.destinationAccounts}
                    errors={errors}
                />
            </div>

            {state.message && !state.ok && (
                <p role="alert" className="text-negative text-sm">
                    {state.message}
                </p>
            )}

            <div className="flex items-center justify-end gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    className="h-10 rounded-full px-5"
                    onClick={onDone}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending ? 'Salvando…' : 'Salvar transação'}
                </Button>
            </div>
        </form>
    );
}

/** Botão "Nova" que abre o modal de cadastro de uma receita ou despesa, com todos os campos do título. */
export function NewTransactionDialog() {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<TitleFormOptions | null>(null);

    // Presets e contas de destino são pedidos na primeira vez que o modal abre.
    useEffect(() => {
        if (!open || options !== null) return;
        let active = true;
        getTitleFormOptionsAction('EXPENSE')
            .then(result => active && setOptions(result))
            .catch(() => active && setOptions({ presets: [], destinationAccounts: [] }));
        return () => {
            active = false;
        };
    }, [open, options]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 rounded-full px-4 font-semibold">
                    <Plus aria-hidden="true" />
                    Nova
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl p-6">
                <DialogHeader className="space-y-0.5">
                    <DialogTitle className="font-display text-xl font-bold tracking-tight">
                        Nova transação
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Registre uma entrada ou saída.
                    </DialogDescription>
                </DialogHeader>

                {options === null ? (
                    <p className="text-muted-foreground text-sm">Carregando…</p>
                ) : options.presets.length === 0 ? (
                    <div className="space-y-3">
                        <p className="text-muted-foreground text-sm">
                            Cadastre uma categoria (preset ativo) antes de criar transações.
                        </p>
                        <Button asChild variant="outline" className="rounded-full">
                            <Link href="/configuracoes/presets/nova">Novo preset</Link>
                        </Button>
                    </div>
                ) : (
                    <NewTransactionForm options={options} onDone={() => setOpen(false)} />
                )}
            </DialogContent>
        </Dialog>
    );
}
