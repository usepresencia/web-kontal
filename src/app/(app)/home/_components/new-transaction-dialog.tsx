'use client';

import { getOpenTitlesAction } from '@/actions/titles';
import { PaymentStep } from '@/lib/_components/transactions/payment-step';
import { StepTitle } from '@/lib/_components/transactions/step-title';
import { TitlePicker } from '@/lib/_components/transactions/title-picker';
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
import { entryLabels } from '@/lib/_utils/title-labels';
import type { Title } from '@/lib/api/schemas/title';
import { ArrowDownCircle, ArrowUpCircle, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

type TitleType = 'INCOME' | 'EXPENSE';

const TYPES: { type: TitleType; label: string; icon: typeof ArrowUpCircle }[] = [
    { type: 'EXPENSE', label: 'Contas a pagar', icon: ArrowDownCircle },
    { type: 'INCOME', label: 'Contas a receber', icon: ArrowUpCircle },
];

/** Botão "Nova transação": escolhe o tipo e o título em aberto e segue para o pagamento ou recebimento. */
export function NewTransactionDialog() {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<TitleType>('EXPENSE');
    const [titles, setTitles] = useState<Record<TitleType, Title[] | null>>({
        EXPENSE: null,
        INCOME: null,
    });
    const [picked, setPicked] = useState<Title | null>(null);

    // Os títulos em aberto de cada tipo são pedidos ao abrir o modal ou ao trocar de tipo.
    useEffect(() => {
        if (!open || titles[type] !== null) return;
        let active = true;
        getOpenTitlesAction(type)
            .then(items => active && setTitles(current => ({ ...current, [type]: items })))
            .catch(() => active && setTitles(current => ({ ...current, [type]: [] })));
        return () => {
            active = false;
        };
    }, [open, type, titles]);

    const close = () => {
        setOpen(false);
        setPicked(null);
        // Depois de pagar ou receber, a lista de abertos muda: pede de novo na próxima abertura.
        setTitles({ EXPENSE: null, INCOME: null });
    };

    return (
        <Dialog open={open} onOpenChange={next => (next ? setOpen(true) : close())}>
            <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 rounded-full px-4 font-semibold">
                    <Plus aria-hidden="true" />
                    Nova transação
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl p-6">
                <DialogHeader className="space-y-0.5">
                    {picked ? (
                        <StepTitle onBack={() => setPicked(null)}>
                            {entryLabels(picked.type).action}
                        </StepTitle>
                    ) : (
                        <>
                            <DialogTitle className="font-display text-xl font-bold tracking-tight">
                                Nova transação
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                Escolha o título que será pago ou recebido.
                            </DialogDescription>
                        </>
                    )}
                </DialogHeader>

                {picked ? (
                    <div className="space-y-2">
                        <p className="text-muted-foreground pl-4 text-xs">{picked.description}</p>
                        <PaymentStep title={picked} onSuccess={close} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div
                            role="radiogroup"
                            aria-label="Tipo do título"
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
                                                  value === 'INCOME'
                                                      ? 'text-positive'
                                                      : 'text-negative',
                                              )
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    <Icon className="size-4" aria-hidden="true" />
                                    {label}
                                </button>
                            ))}
                        </div>
                        <TitlePicker titles={titles[type]} onPick={setPicked} />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
