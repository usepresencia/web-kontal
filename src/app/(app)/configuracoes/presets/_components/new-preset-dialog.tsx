'use client';

import { getPlanAccountsAction } from '@/actions/billing';
import { createPresetAction } from '@/actions/presets';
import { useBusyFlag } from '@/lib/_components/busy-provider';
import { EmptyState } from '@/lib/_components/empty-state';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { PillSelect } from '@/lib/_components/pill-fields';
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
import type { BillingAccount, BillingPlan } from '@/lib/api/schemas/billing';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PresetForm } from './preset-form';

/** Botão "Novo preset": escolhe o plano de contas e abre o cadastro em modal. */
export function NewPresetDialog({ plans }: { plans: BillingPlan[] }) {
    const [open, setOpen] = useState(false);
    const [planId, setPlanId] = useState('');
    const [accounts, setAccounts] = useState<BillingAccount[] | null>(null);
    useBusyFlag(open && planId !== '' && accounts === null, 'Carregando contas…');

    useEffect(() => {
        if (!planId) return;
        let active = true;
        setAccounts(null);
        getPlanAccountsAction(planId)
            .then(items => active && setAccounts(items))
            .catch(() => active && setAccounts([]));
        return () => {
            active = false;
        };
    }, [planId]);

    const close = () => {
        setOpen(false);
        setPlanId('');
        setAccounts(null);
    };

    return (
        <Dialog open={open} onOpenChange={next => (next ? setOpen(true) : close())}>
            <DialogTrigger asChild>
                <Button>
                    <Plus aria-hidden="true" />
                    Novo preset
                </Button>
            </DialogTrigger>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader className="space-y-0.5">
                    <DialogTitle className="font-display text-xl font-bold tracking-tight">
                        Novo preset
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Escolha o plano de contas e defina a conta de cada papel do lançamento.
                    </DialogDescription>
                </DialogHeader>
                {plans.length === 0 ? (
                    <EmptyState
                        title="Nenhum plano cadastrado"
                        description="Crie um plano de contas antes."
                    />
                ) : (
                    <>
                        <PillSelect
                            className={FILTER_PILL_CLASS}
                            label="Plano de contas"
                            name="planPicker"
                            value={planId}
                            onChange={setPlanId}
                            options={plans.map(plan => ({ value: plan.id, label: plan.name }))}
                            placeholder="Selecione o plano"
                        />
                        {planId && accounts && (
                            <PresetForm
                                key={planId}
                                action={createPresetAction}
                                accounts={accounts}
                                billingPlanId={planId}
                                onSuccess={close}
                            />
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
