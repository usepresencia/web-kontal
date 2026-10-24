'use client';

import { getPlanAccountsAction } from '@/actions/billing';
import { deletePresetAction, updatePresetAction } from '@/actions/presets';
import { useBusyFlag, useBusyRun } from '@/lib/_components/busy-provider';
import { StepTitle } from '@/lib/_components/transactions/step-title';
import { Button } from '@/lib/_components/ui/button';
import { ConfirmationDialog } from '@/lib/_components/ui/confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, MODAL_CLASS } from '@/lib/_components/ui/dialog';
import { notifyResult } from '@/lib/_utils/notify';
import { SUCCESS } from '@/lib/_utils/toast-messages';
import type { BillingAccount } from '@/lib/api/schemas/billing';
import type { Preset } from '@/lib/api/schemas/preset';
import { useEffect, useState } from 'react';
import { PresetForm } from './preset-form';

type PresetDialogProps = { preset: Preset | null; onClose: () => void };

/** Modal de edição do preset, com a exclusão (e confirmação) ao lado do botão de salvar. */
export function PresetDialog({ preset, onClose }: PresetDialogProps) {
    const run = useBusyRun();
    const [accounts, setAccounts] = useState<BillingAccount[] | null>(null);
    const [confirming, setConfirming] = useState(false);
    const planId = preset?.billingPlanId;
    useBusyFlag(preset !== null && accounts === null, 'Carregando contas…');

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
    }, [planId, preset?.id]);

    return (
        <Dialog open={preset !== null} onOpenChange={open => !open && onClose()}>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader>
                    <StepTitle>{preset?.name ?? 'Histórico padrão'}</StepTitle>
                    {preset?.billingPlanName && (
                        <p className="text-muted-foreground pl-1 text-sm">
                            Plano: {preset.billingPlanName}
                        </p>
                    )}
                </DialogHeader>
                {preset && accounts && (
                    <>
                        <PresetForm
                            key={preset.id}
                            action={updatePresetAction.bind(null, preset.id)}
                            accounts={accounts}
                            billingPlanId={preset.billingPlanId}
                            preset={preset}
                            footerStart={
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="rounded-full px-6 font-semibold"
                                    onClick={() => setConfirming(true)}
                                >
                                    Excluir histórico padrão
                                </Button>
                            }
                            onSuccess={onClose}
                        />
                        <ConfirmationDialog
                            open={confirming}
                            onOpenChange={setConfirming}
                            title="Excluir histórico padrão"
                            description={`Excluir o histórico padrão ${preset.name}? Históricos padrão usados em títulos não podem ser excluídos.`}
                            confirmLabel="Excluir"
                            variant="destructive"
                            onConfirm={async () => {
                                const result = await run(
                                    () => deletePresetAction(preset.id),
                                    'Excluindo histórico padrão…',
                                );
                                notifyResult(
                                    result,
                                    SUCCESS.presetDeleted,
                                    'Não foi possível excluir.',
                                );
                                setConfirming(false);
                                if (result.ok) onClose();
                            }}
                        />
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
