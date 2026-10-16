'use client';

import { getTitlePaymentAccountsAction } from '@/actions/titles';
import { EntryForm } from '@/lib/_components/transactions/entry-form';
import { toLocalIsoDate } from '@/lib/_utils/dates';
import { toInputAmount } from '@/lib/_utils/money';
import type { Title } from '@/lib/api/schemas/title';
import { useEffect, useState } from 'react';

type PaymentStepProps = { title: Title; onSuccess: () => void };

/** Etapa de pagamento ou recebimento: carrega as contas do plano e mostra o formulário da baixa. */
export function PaymentStep({ title, onSuccess }: PaymentStepProps) {
    const [accounts, setAccounts] = useState<{ value: string; label: string }[] | null>(null);

    useEffect(() => {
        let active = true;
        setAccounts(null);
        getTitlePaymentAccountsAction(title.id)
            .then(items => active && setAccounts(items))
            .catch(() => active && setAccounts([]));
        return () => {
            active = false;
        };
    }, [title.id]);

    if (accounts === null) return <p className="text-muted-foreground text-sm">Carregando…</p>;
    if (accounts.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                Nenhuma conta financeira disponível no plano deste título.
            </p>
        );
    }

    return (
        <EntryForm
            titleId={title.id}
            accounts={accounts}
            today={toLocalIsoDate(new Date())}
            paying={title.type === 'EXPENSE'}
            defaultAmount={toInputAmount(title.remainingAmount)}
            onSuccess={onSuccess}
        />
    );
}
