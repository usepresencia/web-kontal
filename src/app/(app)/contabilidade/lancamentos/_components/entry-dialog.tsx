'use client';

import { getJournalEntryAction } from '@/actions/journal';
import { useBusyFlag } from '@/lib/_components/busy-provider';
import { Divider } from '@/lib/_components/divider';
import { StepTitle } from '@/lib/_components/transactions/step-title';
import { Button } from '@/lib/_components/ui/button';
import { Dialog, DialogContent, DialogHeader, MODAL_CLASS } from '@/lib/_components/ui/dialog';
import { formatAmount } from '@/lib/_utils/money';
import { formatDate } from '@/lib/_utils/title-labels';
import type { JournalDetail } from '@/lib/api/schemas/journal';
import { useEffect, useState } from 'react';
import { REFERENCE_LABELS } from './reference-labels';
import { ReverseForm } from './reverse-form';

type EntryDialogProps = { entry: JournalDetail | null; onClose: () => void };

/** Modal de detalhes do lançamento contábil: as linhas de débito e crédito e, nos manuais, o estorno. */
export function EntryDialog({ entry, onClose }: EntryDialogProps) {
    const [detail, setDetail] = useState<JournalDetail | null>(null);
    const [step, setStep] = useState<'details' | 'reverse'>('details');
    const entryId = entry?.id;

    useEffect(() => {
        if (!entryId) return;
        let active = true;
        setDetail(null);
        setStep('details');
        getJournalEntryAction(entryId)
            .then(result => active && setDetail(result))
            .catch(() => active && setDetail(null));
        return () => {
            active = false;
        };
    }, [entryId]);

    useBusyFlag(entry !== null && detail === null, 'Carregando detalhes…');
    const canReverse = detail?.referenceType === 'MANUAL' && !detail.reversedBy;

    return (
        <Dialog open={entry !== null} onOpenChange={open => !open && onClose()}>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader>
                    {step === 'details' ? (
                        <StepTitle>Detalhes do lançamento</StepTitle>
                    ) : (
                        <StepTitle onBack={() => setStep('details')}>Estornar lançamento</StepTitle>
                    )}
                </DialogHeader>
                {detail && step === 'details' && (
                    <div className="space-y-5">
                        <div>
                            <p className="text-foreground text-base font-semibold">
                                Nº {detail.number} · {detail.description}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {formatDate(detail.date)} ·{' '}
                                {REFERENCE_LABELS[detail.referenceType ?? ''] ??
                                    detail.referenceType ??
                                    '—'}
                            </p>
                        </div>
                        <ul className="space-y-1 py-1">
                            {detail.lines.map((line, index) => (
                                <li key={index}>
                                    {index > 0 && <Divider className="mx-2 my-1" />}
                                    <div className="flex items-center justify-between gap-3 px-2 py-2 text-sm">
                                        <span className="min-w-0">
                                            <span className="text-foreground font-medium">
                                                <span className="font-mono text-xs">
                                                    {line.accountCode}
                                                </span>{' '}
                                                {line.accountName}
                                            </span>
                                            {line.memo && (
                                                <span className="text-muted-foreground block text-xs">
                                                    {line.memo}
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-right font-semibold">
                                            {Number(line.debit) > 0 ? (
                                                <span className="text-negative">
                                                    D {formatAmount(line.debit)}
                                                </span>
                                            ) : (
                                                <span className="text-positive">
                                                    C {formatAmount(line.credit)}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="text-muted-foreground flex justify-between px-2 text-xs font-semibold">
                            <span>Totais</span>
                            <span>
                                D {formatAmount(detail.totalDebits)} · C{' '}
                                {formatAmount(detail.totalCredits)}
                            </span>
                        </div>
                        {canReverse && (
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    onClick={() => setStep('reverse')}
                                    className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6 font-semibold"
                                >
                                    Estornar
                                </Button>
                            </div>
                        )}
                    </div>
                )}
                {detail && step === 'reverse' && (
                    <ReverseForm entryId={detail.id} onSuccess={onClose} />
                )}
            </DialogContent>
        </Dialog>
    );
}
