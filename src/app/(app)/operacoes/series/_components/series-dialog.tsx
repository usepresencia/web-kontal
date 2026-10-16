'use client';

import { getSeriesAction } from '@/actions/titles';
import { useBusyFlag } from '@/lib/_components/busy-provider';
import { Divider } from '@/lib/_components/divider';
import { StepTitle } from '@/lib/_components/transactions/step-title';
import { TransactionDialog } from '@/lib/_components/transactions/transaction-dialog';
import { Button } from '@/lib/_components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/lib/_components/ui/dialog';
import { cn } from '@/lib/_utils/cn';
import { daysAgoLabel } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import {
    SERIES_FREQUENCY_LABELS,
    SERIES_KIND_LABELS,
    TITLE_STATUS_LABELS,
    formatDate,
} from '@/lib/_utils/title-labels';
import type { Series, SeriesDetail, Title } from '@/lib/api/schemas/title';
import { useCallback, useEffect, useState } from 'react';
import { CancelSeriesButton, ExtendSeriesForm } from './series-actions';

type SeriesDialogProps = { series: Series | null; onClose: () => void };

/** Modal de detalhes do parcelamento: as ocorrências, com a etapa para estendê-lo e o cancelamento. */
export function SeriesDialog({ series, onClose }: SeriesDialogProps) {
    const [detail, setDetail] = useState<SeriesDetail | null>(null);
    const [step, setStep] = useState<'details' | 'extend'>('details');
    const [picked, setPicked] = useState<Title | null>(null);
    const seriesId = series?.id;

    const load = useCallback(() => {
        if (!seriesId) return () => undefined;
        let active = true;
        getSeriesAction(seriesId)
            .then(result => active && setDetail(result))
            .catch(() => active && setDetail(null));
        return () => {
            active = false;
        };
    }, [seriesId]);

    useEffect(() => {
        setDetail(null);
        setStep('details');
        setPicked(null);
        return load();
    }, [load]);

    useBusyFlag(series !== null && detail === null, 'Carregando detalhes…');

    return (
        <Dialog open={series !== null} onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    {step === 'details' ? (
                        <StepTitle>Detalhes do parcelamento</StepTitle>
                    ) : (
                        <StepTitle onBack={() => setStep('details')}>
                            Estender parcelamento
                        </StepTitle>
                    )}
                </DialogHeader>
                {detail && step === 'details' && (
                    <div className="space-y-5">
                        <div>
                            <p className="text-foreground text-base font-semibold">
                                {detail.baseDescription}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {SERIES_KIND_LABELS[detail.kind]}
                                {detail.frequency &&
                                    ` · ${
                                        SERIES_FREQUENCY_LABELS[
                                            detail.frequency as keyof typeof SERIES_FREQUENCY_LABELS
                                        ] ?? detail.frequency
                                    }`}
                                {` · ${detail.titles.length} ocorrências`}
                            </p>
                        </div>
                        <ul className="space-y-1 py-1">
                            {detail.titles.map((title, index) => (
                                <li key={title.id}>
                                    {index > 0 && <Divider className="mx-2 my-1" />}
                                    <button
                                        type="button"
                                        onClick={() => setPicked(title)}
                                        aria-haspopup="dialog"
                                        className="group hover:bg-muted/50 focus-visible:ring-ring -mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm focus-visible:ring-2 focus-visible:outline-none"
                                    >
                                        <span className="min-w-0">
                                            <span className="text-foreground font-medium">
                                                {title.seriesIndex}.{' '}
                                                {formatDate(title.expirationDate)}
                                            </span>
                                            <span className="bg-muted text-muted-foreground ml-2 rounded-full px-2 py-0.5 text-[11px]">
                                                {TITLE_STATUS_LABELS[title.status]}
                                            </span>
                                        </span>
                                        <span
                                            className={cn(
                                                'font-semibold',
                                                title.type === 'INCOME'
                                                    ? 'text-positive'
                                                    : 'text-negative',
                                            )}
                                        >
                                            {formatAmount(title.amount)}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="flex flex-wrap justify-end gap-2">
                            <CancelSeriesButton seriesId={detail.id} onDone={onClose} />
                            <Button
                                type="button"
                                onClick={() => setStep('extend')}
                                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6 font-semibold"
                            >
                                Estender
                            </Button>
                        </div>
                    </div>
                )}
                {detail && step === 'extend' && (
                    <ExtendSeriesForm
                        seriesId={detail.id}
                        onSuccess={() => {
                            setStep('details');
                            load();
                        }}
                    />
                )}
            </DialogContent>
            <TransactionDialog
                title={picked}
                ago={picked ? daysAgoLabel(picked.createdAt, new Date()) : ''}
                onClose={() => {
                    setPicked(null);
                    load();
                }}
                onBack={() => setPicked(null)}
            />
        </Dialog>
    );
}
