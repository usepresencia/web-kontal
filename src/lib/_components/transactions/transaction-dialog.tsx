'use client';

import { getTitleEntriesAction, getTitlePaymentAccountsAction } from '@/actions/titles';
import { EntryForm } from '@/lib/_components/transactions/entry-form';
import { Dialog, DialogContent, DialogHeader } from '@/lib/_components/ui/dialog';
import { toLocalIsoDate } from '@/lib/_utils/dates';
import { entryLabels } from '@/lib/_utils/title-labels';
import type { Title, TitleEntry } from '@/lib/api/schemas/title';
import { useEffect, useState } from 'react';
import { StepTitle } from './step-title';
import { TransactionDetailsBody } from './transaction-details-body';

const COPIED_FEEDBACK_MS = 1500;

type TransactionDialogProps = {
    title: Title | null;
    ago: string;
    onClose: () => void;
};

/** Modal de detalhes da transação: dados do título e as baixas, carregadas ao abrir. */
export function TransactionDialog({ title, ago, onClose }: TransactionDialogProps) {
    const [entries, setEntries] = useState<TitleEntry[] | null>(null);
    const [copied, setCopied] = useState(false);
    const [step, setStep] = useState<'details' | 'pay'>('details');
    const [accounts, setAccounts] = useState<{ value: string; label: string }[] | null>(null);
    const titleId = title?.id;

    useEffect(() => {
        if (!titleId) return;
        let active = true;
        setEntries(null);
        setCopied(false);
        setStep('details');
        setAccounts(null);
        getTitleEntriesAction(titleId)
            .then(items => active && setEntries(items))
            .catch(() => active && setEntries([]));
        return () => {
            active = false;
        };
    }, [titleId]);

    const startPayment = () => {
        if (!titleId) return;
        setStep('pay');
        getTitlePaymentAccountsAction(titleId)
            .then(setAccounts)
            .catch(() => setAccounts([]));
    };

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
                        <StepTitle>Detalhes da transação</StepTitle>
                    ) : (
                        <StepTitle onBack={() => setStep('details')}>
                            {title ? entryLabels(title.type).action : 'Baixar título'}
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
                        onPay={startPayment}
                    />
                )}
                {title && step === 'pay' && (
                    <div className="space-y-4">
                        {accounts === null ? (
                            <p className="text-muted-foreground text-sm">Carregando…</p>
                        ) : accounts.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                Nenhuma conta financeira disponível no plano deste título.
                            </p>
                        ) : (
                            <EntryForm
                                titleId={title.id}
                                accounts={accounts}
                                today={toLocalIsoDate(new Date())}
                                paying={title.type === 'EXPENSE'}
                                onSuccess={onClose}
                            />
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
