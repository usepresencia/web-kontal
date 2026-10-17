'use client';

import {
    createTitleAction,
    getTitleFormOptionsAction,
    type TitleFormOptions,
} from '@/actions/titles';
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
import { ArrowDownCircle, ArrowLeft, ArrowUpCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { TitleForm } from '../../operacoes/_components/title-form';

type TitleType = 'INCOME' | 'EXPENSE';
type Step = { kind: 'type' } | { kind: 'form'; type: TitleType; options: TitleFormOptions | null };

const TYPE_CARDS: {
    type: TitleType;
    title: string;
    description: string;
    icon: typeof ArrowDownCircle;
    tone: string;
}[] = [
    {
        type: 'EXPENSE',
        title: 'Conta a pagar',
        description: 'Aluguel, fornecedores, impostos e outras despesas.',
        icon: ArrowUpCircle,
        tone: 'bg-negative/10 text-negative',
    },
    {
        type: 'INCOME',
        title: 'Conta a receber',
        description: 'Vendas, serviços e outras receitas a receber.',
        icon: ArrowDownCircle,
        tone: 'bg-positive/10 text-positive',
    },
];

function Stepper({ current }: { current: 1 | 2 }) {
    const item = (number: 1 | 2, label: string) => (
        <li
            className={cn(
                'flex items-center gap-2 text-sm',
                current === number ? 'text-foreground font-semibold' : 'text-muted-foreground',
            )}
            aria-current={current === number ? 'step' : undefined}
        >
            <span
                className={cn(
                    'flex size-6 items-center justify-center rounded-full text-xs',
                    current >= number ? 'bg-primary text-primary-foreground' : 'bg-muted',
                )}
            >
                {number}
            </span>
            {label}
        </li>
    );

    return (
        <ol className="flex items-center gap-3" aria-label="Etapas">
            {item(1, 'Tipo')}
            <span className="bg-border h-px w-8" aria-hidden="true" />
            {item(2, 'Cadastro')}
        </ol>
    );
}

function Card({ children }: { children: ReactNode }) {
    return <div className="border-border bg-card rounded-2xl border p-5">{children}</div>;
}

/** Botão "Nova" que abre o cadastro em duas etapas: o tipo da transação e o formulário. */
export function NewTransactionDialog() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<Step>({ kind: 'type' });

    const reset = () => setStep({ kind: 'type' });

    const choose = (type: TitleType) => {
        setStep({ kind: 'form', type, options: null });
        getTitleFormOptionsAction(type)
            .then(options =>
                setStep(current => (current.kind === 'form' ? { ...current, options } : current)),
            )
            .catch(() =>
                setStep(current =>
                    current.kind === 'form'
                        ? { ...current, options: { presets: [], destinationAccounts: [] } }
                        : current,
                ),
            );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={next => {
                setOpen(next);
                if (!next) reset();
            }}
        >
            <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 rounded-full px-4 font-semibold">
                    <Plus aria-hidden="true" />
                    Nova
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nova transação</DialogTitle>
                    <DialogDescription className="sr-only">
                        Escolha o tipo e preencha o cadastro da transação.
                    </DialogDescription>
                </DialogHeader>

                <Stepper current={step.kind === 'type' ? 1 : 2} />

                {step.kind === 'type' ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {TYPE_CARDS.map(card => (
                            <button
                                key={card.type}
                                type="button"
                                onClick={() => choose(card.type)}
                                className="border-border bg-card hover:border-foreground/40 focus-visible:ring-ring rounded-2xl border p-5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                            >
                                <div
                                    className={cn(
                                        'mb-3 flex size-10 items-center justify-center rounded-full',
                                        card.tone,
                                    )}
                                >
                                    <card.icon className="size-5" aria-hidden="true" />
                                </div>
                                <p className="text-foreground text-base font-semibold">
                                    {card.title}
                                </p>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {card.description}
                                </p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <div className="mb-4 flex items-center justify-between">
                            <Button type="button" variant="ghost" size="sm" onClick={reset}>
                                <ArrowLeft aria-hidden="true" />
                                Voltar
                            </Button>
                            <p className="text-foreground text-sm font-semibold">
                                {step.type === 'EXPENSE' ? 'Conta a pagar' : 'Conta a receber'}
                            </p>
                        </div>

                        {step.options === null ? (
                            <p className="text-muted-foreground text-sm">Carregando…</p>
                        ) : step.options.presets.length === 0 ? (
                            <div className="space-y-3">
                                <p className="text-muted-foreground text-sm">
                                    Cadastre um preset ativo antes de criar transações.
                                </p>
                                <Button asChild variant="outline">
                                    <Link href="/configuracoes/presets/nova">Novo preset</Link>
                                </Button>
                            </div>
                        ) : (
                            <TitleForm
                                action={createTitleAction}
                                type={step.type}
                                presets={step.options.presets}
                                destinationAccounts={step.options.destinationAccounts}
                                returnTo="/home"
                                onSuccess={() => {
                                    setOpen(false);
                                    reset();
                                }}
                            />
                        )}
                    </Card>
                )}
            </DialogContent>
        </Dialog>
    );
}
