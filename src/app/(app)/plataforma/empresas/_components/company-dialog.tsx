'use client';

import { deactivateCompanyAction } from '@/actions/companies';
import { selectCompanyAction } from '@/actions/session';
import { useBusyFlag, useBusyRun } from '@/lib/_components/busy-provider';
import { StepTitle } from '@/lib/_components/transactions/step-title';
import { Button } from '@/lib/_components/ui/button';
import { ConfirmationDialog } from '@/lib/_components/ui/confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, MODAL_CLASS } from '@/lib/_components/ui/dialog';
import { notifyResult } from '@/lib/_utils/notify';
import { formatDate } from '@/lib/_utils/title-labels';
import { SUCCESS } from '@/lib/_utils/toast-messages';
import type { Company } from '@/lib/api/schemas/company';
import { useState, useTransition, type ReactNode } from 'react';

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-foreground text-sm">{children}</dd>
        </div>
    );
}

type CompanyDialogProps = { company: Company | null; onClose: () => void };

/** Modal de detalhes da empresa, com abrir (trocar a empresa ativa) e desativar. */
export function CompanyDialog({ company, onClose }: CompanyDialogProps) {
    const run = useBusyRun();
    const [opening, startTransition] = useTransition();
    useBusyFlag(opening, 'Abrindo empresa…');
    const [confirming, setConfirming] = useState(false);
    const address = company?.address;

    return (
        <Dialog open={company !== null} onOpenChange={open => !open && onClose()}>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader>
                    <StepTitle>Detalhes da empresa</StepTitle>
                </DialogHeader>
                {company && address && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="bg-muted flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
                                {company.logoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={company.logoUrl}
                                        alt="Logo da empresa"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <span className="text-muted-foreground text-[11px]">
                                        Sem logo
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-foreground text-base font-semibold">
                                    {company.name}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    {company.socialReason}
                                </p>
                            </div>
                        </div>
                        <dl className="grid grid-cols-2 gap-3">
                            <Field label="CNPJ">{company.cnpj}</Field>
                            <Field label="Abertura">{formatDate(company.openingDate)}</Field>
                            <Field label="CNAE">{company.cnae}</Field>
                            <Field label="Regime tributário">{company.taxRegime}</Field>
                            <Field label="E-mail">{company.email}</Field>
                            <Field label="Telefone">{company.phone}</Field>
                            <div className="col-span-2">
                                <Field label="Endereço">
                                    {address.street}, {address.number}
                                    {address.complement ? ` – ${address.complement}` : ''} ·{' '}
                                    {address.neighborhood} · {address.city}/{address.state} · CEP{' '}
                                    {address.zipCode}
                                </Field>
                            </div>
                        </dl>
                        <div className="flex items-center justify-between gap-2">
                            <Button
                                type="button"
                                variant="destructive"
                                className="rounded-full px-6 font-semibold"
                                onClick={() => setConfirming(true)}
                            >
                                Desativar
                            </Button>
                            <Button
                                type="button"
                                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6 font-semibold"
                                onClick={() =>
                                    startTransition(async () => {
                                        await selectCompanyAction(company.id);
                                    })
                                }
                            >
                                Abrir empresa
                            </Button>
                        </div>
                        <ConfirmationDialog
                            open={confirming}
                            onOpenChange={setConfirming}
                            title="Desativar empresa"
                            description={`Desativar ${company.name}? Ela deixa de aparecer para os usuários.`}
                            confirmLabel="Desativar"
                            variant="destructive"
                            onConfirm={async () => {
                                const result = await run(
                                    () => deactivateCompanyAction(company.id),
                                    'Desativando empresa…',
                                );
                                notifyResult(
                                    result,
                                    SUCCESS.companyDeactivated,
                                    'Não foi possível desativar.',
                                );
                                setConfirming(false);
                                if (result.ok) onClose();
                            }}
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
