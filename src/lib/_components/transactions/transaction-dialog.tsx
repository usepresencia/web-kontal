'use client';

import { getTitleEntriesAction } from '@/actions/titles';
import { useBusyFlag } from '@/lib/_components/busy-provider';
import { Dialog, DialogContent, DialogHeader } from '@/lib/_components/ui/dialog';
import { entryLabels } from '@/lib/_utils/title-labels';
import type { Title, TitleEntry } from '@/lib/api/schemas/title';
import { useEffect, useState } from 'react';
import { PaymentStep } from './payment-step';
import { StepTitle } from './step-title';
import { TransactionDetailsBody } from './transaction-details-body';

const COPIED_FEEDBACK_MS = 1500;

type TransactionDialogProps = {
    title: Title | null;
    ago: string;
    onClose: () => void;
    /** Quando informado, mostra o chevron de voltar antes do título dos detalhes (ex.: de volta ao parcelamento). */
    onBack?: () => void;
};

/** Modal de detalhes da transação: dados do título e as baixas, carregadas ao abrir. */
export function TransactionDialog({ title, ago, onClose, onBack }: TransactionDialogProps) {
    const [entries, setEntries] = useState<TitleEntry[] | null>(null);
    const [copied, setCopied] = useState(false);
    const [step, setStep] = useState<'details' | 'pay'>('details');
    const titleId = title?.id;

    useEffect(() => {
        if (!titleId) return;
        let active = true;
        setEntries(null);
        setCopied(false);
        setStep('details');
        getTitleEntriesAction(titleId)
            .then(items => active && setEntries(items))
            .catch(() => active && setEntries([]));
        return () => {
            active = false;
        };
    }, [titleId]);

    useBusyFlag(title !== null && entries === null, 'Carregando detalhes…');

    const copy = () => {
        if (!titleId) return;
        navigator.clipboard
            .writeText(titleId)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
            })
            .catch(() => setCopied(false));
    };

    return (
        <Dialog open={title !== null} onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    {step === 'details' ? (
                        <StepTitle onBack={onBack}>Detalhes da transação</StepTitle>
                    ) : (
                        <StepTitle onBack={() => setStep('details')}>
                            {title
                                ? entryLabels(title.type, title.seriesIndex !== null).action
                                : 'Baixar título'}
                        </StepTitle>
                    )}
                </DialogHeader>
                {title && step === 'details' && (
                    <TransactionDetailsBody
                        title={title}
                        ago={ago}
                        entries={entries}
                        copied={copied}
                        onCopy={copy}
                        onPay={() => setStep('pay')}
                    />
                )}
                {title && step === 'pay' && <PaymentStep title={title} onSuccess={onClose} />}
            </DialogContent>
        </Dialog>
    );
}
