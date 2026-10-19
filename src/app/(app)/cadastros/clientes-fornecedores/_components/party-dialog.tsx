'use client';

import { deletePartyAction, updatePartyAction } from '@/actions/parties';
import { useBusyRun } from '@/lib/_components/busy-provider';
import { StepTitle } from '@/lib/_components/transactions/step-title';
import { Button } from '@/lib/_components/ui/button';
import { ConfirmationDialog } from '@/lib/_components/ui/confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, MODAL_CLASS } from '@/lib/_components/ui/dialog';
import { formatDocument } from '@/lib/_utils/document';
import { notifyResult } from '@/lib/_utils/notify';
import { SUCCESS } from '@/lib/_utils/toast-messages';
import { PARTY_KIND_LABELS, type Party } from '@/lib/api/schemas/party';
import { useState } from 'react';
import { PartyForm } from './party-form';

type PartyDialogProps = {
    party: Party | null;
    presets: { value: string; label: string }[];
    onClose: () => void;
};

/** Modal de edição do cliente ou fornecedor, com a exclusão (e confirmação) ao lado do botão de salvar. */
export function PartyDialog({ party, presets, onClose }: PartyDialogProps) {
    const run = useBusyRun();
    const [confirming, setConfirming] = useState(false);

    return (
        <Dialog open={party !== null} onOpenChange={open => !open && onClose()}>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader>
                    <StepTitle>{party?.name ?? 'Cadastro'}</StepTitle>
                    {party && (
                        <p className="text-muted-foreground pl-1 text-sm">
                            {PARTY_KIND_LABELS[party.kind]} · {formatDocument(party.document)}
                        </p>
                    )}
                </DialogHeader>
                {party && (
                    <>
                        <PartyForm
                            key={party.id}
                            action={updatePartyAction.bind(null, party.id)}
                            presets={presets}
                            party={party}
                            footerStart={
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="rounded-full px-6 font-semibold"
                                    onClick={() => setConfirming(true)}
                                >
                                    Excluir cadastro
                                </Button>
                            }
                            onSuccess={onClose}
                        />
                        <ConfirmationDialog
                            open={confirming}
                            onOpenChange={setConfirming}
                            title="Excluir cadastro"
                            description={`Excluir ${party.name}? Cadastros com títulos não podem ser excluídos.`}
                            confirmLabel="Excluir"
                            variant="destructive"
                            onConfirm={async () => {
                                const result = await run(
                                    () => deletePartyAction(party.id),
                                    'Excluindo cadastro…',
                                );
                                notifyResult(
                                    result,
                                    SUCCESS.partyDeleted,
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
