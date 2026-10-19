'use client';

import { getOpenTitlesAction } from '@/actions/titles';
import { useBusyFlag } from '@/lib/_components/busy-provider';
import { Button } from '@/lib/_components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    MODAL_CLASS,
} from '@/lib/_components/ui/dialog';
import { entryLabels } from '@/lib/_utils/title-labels';
import type { Title } from '@/lib/api/schemas/title';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PaymentStep } from './payment-step';
import { StepTitle } from './step-title';
import { TitlePicker } from './title-picker';
import { TitleTypeToggle, type TitleType } from './title-type-toggle';

type NewTransactionDialogProps = {
    label?: string;
    /** `accent` é a pílula verde da home; `default` é o botão escuro das listas (ex.: "Novo pagamento"). */
    appearance?: 'accent' | 'default';
};

/** Botão de nova transação (na home e na lista de transações): escolhe o tipo e o título em aberto e segue para o pagamento ou recebimento. */
export function NewTransactionDialog({
    label = 'Nova transação',
    appearance = 'accent',
}: NewTransactionDialogProps) {
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

    useBusyFlag(open && titles[type] === null, 'Carregando títulos…');

    const close = () => {
        setOpen(false);
        setPicked(null);
        // Depois de pagar ou receber, a lista de abertos muda: pede de novo na próxima abertura.
        setTitles({ EXPENSE: null, INCOME: null });
    };

    return (
        <Dialog open={open} onOpenChange={next => (next ? setOpen(true) : close())}>
            <DialogTrigger asChild>
                <Button
                    className={
                        appearance === 'accent'
                            ? 'bg-accent text-accent-foreground hover:bg-accent/90 h-9 rounded-full px-4 font-semibold'
                            : undefined
                    }
                >
                    <Plus aria-hidden="true" />
                    {label}
                </Button>
            </DialogTrigger>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader className="space-y-0.5">
                    {picked ? (
                        <StepTitle onBack={() => setPicked(null)}>
                            {entryLabels(picked.type, picked.seriesIndex !== null).action}
                        </StepTitle>
                    ) : (
                        <>
                            <DialogTitle className="font-display text-xl font-bold tracking-tight">
                                {label}
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
                        <TitleTypeToggle value={type} onChange={setType} />
                        <TitlePicker titles={titles[type]} onPick={setPicked} />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
