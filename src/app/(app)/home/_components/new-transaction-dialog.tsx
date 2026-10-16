'use client';

import { createTitleAction, getTitleFormOptionsAction } from '@/actions/titles';
import { Button } from '@/lib/_components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/lib/_components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/lib/_components/ui/select';
import { cn } from '@/lib/_utils/cn';
import { toLocalIsoDate } from '@/lib/_utils/dates';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import { ArrowDownCircle, ArrowUpCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';

type TitleType = 'INCOME' | 'EXPENSE';
type Category = { value: string; label: string };

const TYPES: { type: TitleType; label: string; icon: typeof ArrowUpCircle }[] = [
    { type: 'INCOME', label: 'Receita', icon: ArrowUpCircle },
    { type: 'EXPENSE', label: 'Despesa', icon: ArrowDownCircle },
];

const pillField =
    'bg-background border-border h-12 rounded-full border px-5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

type FormProps = { categories: Category[]; onDone: () => void };

function NewTransactionForm({ categories, onDone }: FormProps) {
    const [state, formAction, pending] = useActionState(createTitleAction, INITIAL_FORM_STATE);
    const [type, setType] = useState<TitleType>('INCOME');
    const [category, setCategory] = useState('');
    const errors = (field: string) => state.fieldErrors?.[field];

    useEffect(() => {
        if (state.ok) onDone();
    }, [state, onDone]);

    const amountTone = type === 'INCOME' ? 'text-positive' : 'text-negative';

    return (
        <form action={formAction} className="space-y-6">
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="presetId" value={category} />
            <input type="hidden" name="returnTo" value="/home" />

            <div
                role="radiogroup"
                aria-label="Tipo da transação"
                className="bg-muted/70 flex rounded-full p-1.5"
            >
                {TYPES.map(({ type: value, label, icon: Icon }) => (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={type === value}
                        onClick={() => setType(value)}
                        className={cn(
                            'flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-base font-semibold transition-colors',
                            type === value
                                ? cn(
                                      'bg-card shadow-sm',
                                      value === 'INCOME' ? 'text-positive' : 'text-negative',
                                  )
                                : 'text-muted-foreground',
                        )}
                    >
                        <Icon className="size-5" aria-hidden="true" />
                        {label}
                    </button>
                ))}
            </div>

            <div>
                <label
                    htmlFor="amount"
                    className="text-muted-foreground text-sm font-semibold tracking-wide uppercase"
                >
                    Valor
                </label>
                <div className="border-border mt-2 flex items-baseline gap-2 border-b pb-2">
                    <span className={cn('font-display text-3xl font-bold', amountTone)}>R$</span>
                    <input
                        id="amount"
                        name="amount"
                        inputMode="decimal"
                        placeholder="0,00"
                        autoComplete="off"
                        required
                        aria-invalid={errors('amount') ? true : undefined}
                        className="font-display placeholder:text-muted-foreground/40 w-full bg-transparent text-5xl font-bold outline-none"
                    />
                </div>
                {errors('amount') && (
                    <p role="alert" className="text-negative mt-1 text-sm">
                        {errors('amount')?.join(' ')}
                    </p>
                )}
            </div>

            <div>
                <input
                    name="description"
                    placeholder="Descrição (ex: Venda de bolos)"
                    aria-label="Descrição"
                    required
                    className={cn(pillField, 'w-full')}
                />
                {errors('description') && (
                    <p role="alert" className="text-negative mt-1 text-sm">
                        {errors('description')?.join(' ')}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger
                            aria-label="Categoria"
                            className={cn(pillField, 'border-border justify-between')}
                        >
                            <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(item => (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors('presetId') && (
                        <p role="alert" className="text-negative mt-1 text-sm">
                            {errors('presetId')?.join(' ')}
                        </p>
                    )}
                </div>
                <div>
                    <input
                        type="date"
                        name="expirationDate"
                        aria-label="Data de vencimento"
                        defaultValue={toLocalIsoDate(new Date())}
                        required
                        className={cn(pillField, 'w-full')}
                    />
                    {errors('expirationDate') && (
                        <p role="alert" className="text-negative mt-1 text-sm">
                            {errors('expirationDate')?.join(' ')}
                        </p>
                    )}
                </div>
            </div>

            {state.message && !state.ok && (
                <p role="alert" className="text-negative text-sm">
                    {state.message}
                </p>
            )}

            <div className="flex items-center justify-end gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    className="h-12 rounded-full px-6 text-base"
                    onClick={onDone}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 rounded-full px-8 text-base font-semibold"
                >
                    {pending ? 'Salvando…' : 'Salvar transação'}
                </Button>
            </div>
        </form>
    );
}

/** Botão "Nova" que abre o modal de cadastro rápido de uma receita ou despesa. */
export function NewTransactionDialog() {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<Category[] | null>(null);

    // As categorias (presets ativos) são pedidas na primeira vez que o modal abre.
    useEffect(() => {
        if (!open || categories !== null) return;
        let active = true;
        getTitleFormOptionsAction('INCOME')
            .then(options => active && setCategories(options.presets))
            .catch(() => active && setCategories([]));
        return () => {
            active = false;
        };
    }, [open, categories]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 rounded-full px-4 font-semibold">
                    <Plus aria-hidden="true" />
                    Nova
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto rounded-3xl p-8">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="font-display text-3xl font-bold tracking-tight">
                        Nova transação
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Registre uma entrada ou saída.
                    </DialogDescription>
                </DialogHeader>

                {categories === null ? (
                    <p className="text-muted-foreground text-sm">Carregando…</p>
                ) : categories.length === 0 ? (
                    <div className="space-y-3">
                        <p className="text-muted-foreground text-sm">
                            Cadastre uma categoria (preset ativo) antes de criar transações.
                        </p>
                        <Button asChild variant="outline" className="rounded-full">
                            <Link href="/configuracoes/presets/nova">Novo preset</Link>
                        </Button>
                    </div>
                ) : (
                    <NewTransactionForm categories={categories} onDone={() => setOpen(false)} />
                )}
            </DialogContent>
        </Dialog>
    );
}
