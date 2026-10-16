'use client';

import {
    deleteAccountAction,
    deletePlanAction,
    getPlanAccountsAction,
    updatePlanAction,
} from '@/actions/billing';
import { useBusyFlag, useBusyRun } from '@/lib/_components/busy-provider';
import { Divider } from '@/lib/_components/divider';
import { StepTitle } from '@/lib/_components/transactions/step-title';
import { Button } from '@/lib/_components/ui/button';
import { ConfirmationDialog } from '@/lib/_components/ui/confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, MODAL_CLASS } from '@/lib/_components/ui/dialog';
import { ACCOUNT_TYPE_LABELS, NATURE_LABELS } from '@/lib/_utils/billing-labels';
import { notifyResult } from '@/lib/_utils/notify';
import { SUCCESS } from '@/lib/_utils/toast-messages';
import type { BillingAccount, BillingPlan } from '@/lib/api/schemas/billing';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AccountForm } from './account-form';
import { PlanForm } from './plan-form';

type Step = { kind: 'details' } | { kind: 'plan' } | { kind: 'account'; account?: BillingAccount };
type Confirm = { kind: 'plan' } | { kind: 'account'; account: BillingAccount } | null;

type PlanDialogProps = { plan: BillingPlan | null; onClose: () => void };

/** Modal do plano: as contas (criar, editar, excluir) e as etapas para editar o plano e a conta. */
export function PlanDialog({ plan, onClose }: PlanDialogProps) {
    const run = useBusyRun();
    const [accounts, setAccounts] = useState<BillingAccount[] | null>(null);
    const [step, setStep] = useState<Step>({ kind: 'details' });
    const [confirm, setConfirm] = useState<Confirm>(null);
    const planId = plan?.id;
    useBusyFlag(plan !== null && accounts === null, 'Carregando contas…');

    const load = useCallback(() => {
        if (!planId) return () => undefined;
        let active = true;
        getPlanAccountsAction(planId)
            .then(items => active && setAccounts(items))
            .catch(() => active && setAccounts([]));
        return () => {
            active = false;
        };
    }, [planId]);

    useEffect(() => {
        setAccounts(null);
        setStep({ kind: 'details' });
        return load();
    }, [load]);

    const sorted = [...(accounts ?? [])].sort((a, b) =>
        a.code.localeCompare(b.code, 'pt-BR', { numeric: true }),
    );
    const back = () => setStep({ kind: 'details' });
    const accountSaved = () => {
        back();
        load();
    };

    const confirmed = async () => {
        if (!plan || !confirm) return;
        if (confirm.kind === 'plan') {
            const result = await run(() => deletePlanAction(plan.id), 'Excluindo plano…');
            notifyResult(result, SUCCESS.planDeleted, 'Não foi possível excluir.');
            setConfirm(null);
            if (result.ok) onClose();
            return;
        }
        const result = await run(
            () => deleteAccountAction(plan.id, confirm.account.id),
            'Excluindo conta…',
        );
        notifyResult(result, SUCCESS.accountDeleted, 'Não foi possível excluir.');
        setConfirm(null);
        if (result.ok) accountSaved();
    };

    const deleteButton = (target: Exclude<Confirm, null>, label: string) => (
        <Button
            type="button"
            variant="destructive"
            className="rounded-full px-6 font-semibold"
            onClick={() => setConfirm(target)}
        >
            {label}
        </Button>
    );

    return (
        <Dialog open={plan !== null} onOpenChange={open => !open && onClose()}>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader>
                    {step.kind === 'details' && <StepTitle>{plan?.name ?? 'Plano'}</StepTitle>}
                    {step.kind === 'plan' && <StepTitle onBack={back}>Editar plano</StepTitle>}
                    {step.kind === 'account' && (
                        <StepTitle onBack={back}>
                            {step.account ? 'Editar conta' : 'Nova conta'}
                        </StepTitle>
                    )}
                    {step.kind === 'details' && plan?.description && (
                        <p className="text-muted-foreground pl-1 text-sm">{plan.description}</p>
                    )}
                </DialogHeader>

                {plan && step.kind === 'details' && accounts && (
                    <div className="space-y-4">
                        {sorted.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                Plano sem contas. Crie a primeira conta.
                            </p>
                        ) : (
                            <ul className="space-y-1 py-1">
                                {sorted.map((account, index) => (
                                    <li key={account.id}>
                                        {index > 0 && <Divider className="mx-2 my-1" />}
                                        <button
                                            type="button"
                                            onClick={() => setStep({ kind: 'account', account })}
                                            aria-haspopup="dialog"
                                            className="hover:bg-muted/50 focus-visible:ring-ring -mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none"
                                        >
                                            <span
                                                className="min-w-0"
                                                style={{
                                                    paddingLeft: `${(account.level - 1) * 16}px`,
                                                }}
                                            >
                                                <span
                                                    className={
                                                        account.accountType === 'SYNTHETIC'
                                                            ? 'font-semibold'
                                                            : 'font-medium'
                                                    }
                                                >
                                                    <span className="font-mono text-xs">
                                                        {account.code}
                                                    </span>{' '}
                                                    {account.name}
                                                </span>
                                                <span className="text-muted-foreground block text-xs">
                                                    {ACCOUNT_TYPE_LABELS[account.accountType]} ·{' '}
                                                    {NATURE_LABELS[account.nature]}
                                                </span>
                                            </span>
                                            <span className="bg-muted rounded-full px-2 py-0.5 text-[11px]">
                                                {account.isActive ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            {deleteButton({ kind: 'plan' }, 'Excluir plano')}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full px-6"
                                    onClick={() => setStep({ kind: 'plan' })}
                                >
                                    Editar plano
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6 font-semibold"
                                    onClick={() => setStep({ kind: 'account' })}
                                >
                                    <Plus aria-hidden="true" />
                                    Nova conta
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {plan && step.kind === 'plan' && (
                    <PlanForm
                        action={updatePlanAction.bind(null, plan.id)}
                        plan={plan}
                        onSuccess={onClose}
                    />
                )}

                {plan && step.kind === 'account' && accounts && (
                    <AccountForm
                        key={step.account?.id ?? 'new'}
                        planId={plan.id}
                        accounts={accounts}
                        account={step.account}
                        footerStart={
                            step.account
                                ? deleteButton(
                                      { kind: 'account', account: step.account },
                                      'Excluir conta',
                                  )
                                : undefined
                        }
                        onSuccess={accountSaved}
                    />
                )}

                <ConfirmationDialog
                    open={confirm !== null}
                    onOpenChange={open => !open && setConfirm(null)}
                    title={confirm?.kind === 'account' ? 'Excluir conta' : 'Excluir plano'}
                    description={
                        confirm?.kind === 'account'
                            ? `Excluir ${confirm.account.code} ${confirm.account.name}? Contas com movimento ou com filhas não podem ser excluídas.`
                            : `Excluir o plano ${plan?.name ?? ''}? Planos com contas em uso não podem ser excluídos.`
                    }
                    confirmLabel="Excluir"
                    variant="destructive"
                    onConfirm={confirmed}
                />
            </DialogContent>
        </Dialog>
    );
}
