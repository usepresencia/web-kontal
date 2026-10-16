'use client';

import { getTitleAction } from '@/actions/titles';
import { useBusyRun } from '@/lib/_components/busy-provider';
import { Divider } from '@/lib/_components/divider';
import { Pagination } from '@/lib/_components/pagination';
import { TransactionDialog } from '@/lib/_components/transactions/transaction-dialog';
import { usePaginationQuery } from '@/lib/_hooks/use-pagination-query';
import { cn } from '@/lib/_utils/cn';
import { daysAgoLabel } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import { notify } from '@/lib/_utils/notify';
import type { Page } from '@/lib/_utils/pagination';
import { PAYMENT_METHOD_LABELS, TITLE_TYPE_LABELS, formatDate } from '@/lib/_utils/title-labels';
import type { Title, TitleEntry } from '@/lib/api/schemas/title';
import { ChevronRight, Clock, CreditCard } from 'lucide-react';
import { useState } from 'react';

/** Forma de pagamento ou "Perda", como aparece abaixo da descrição. */
function entryMethodLabel(entry: TitleEntry): string {
    if (entry.kind === 'WRITE_OFF') return 'Perda';
    if (!entry.paymentMethod) return 'Transação';
    return (
        PAYMENT_METHOD_LABELS[entry.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] ??
        entry.paymentMethod
    );
}

/** Lista paginada de baixas no mesmo estilo das contas a pagar e a receber; cada linha abre o modal de detalhes do título. */
export function BaixasTable({ page }: { page: Page<TitleEntry> }) {
    const pagination = usePaginationQuery();
    const run = useBusyRun();
    const [selected, setSelected] = useState<Title | null>(null);

    const open = async (titleId: string) => {
        const title = await run(() => getTitleAction(titleId), 'Carregando detalhes…');
        if (title) setSelected(title);
        else notify('error', 'Não foi possível abrir o título.');
    };

    return (
        <section className="bg-card space-y-4 rounded-2xl p-5 shadow-sm">
            <ul className="space-y-1">
                {page.items.map((entry, index) => {
                    const income = entry.titleType === 'INCOME';
                    const tone = income ? 'text-positive' : 'text-negative';
                    return (
                        <li key={entry.id}>
                            {index > 0 && <Divider className="my-1 mr-3 ml-12" />}
                            <button
                                type="button"
                                onClick={() => void open(entry.titleId)}
                                aria-haspopup="dialog"
                                className="group hover:bg-muted/50 focus-visible:ring-ring -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-xl px-3 py-2 text-left focus-visible:ring-2 focus-visible:outline-none"
                            >
                                <div
                                    className={cn(
                                        'flex size-9 shrink-0 items-center justify-center rounded-full',
                                        income ? 'bg-positive/10' : 'bg-negative/10',
                                        tone,
                                    )}
                                >
                                    <CreditCard className="size-4" aria-hidden="true" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-foreground truncate text-sm font-medium">
                                        {entry.titleDescription}
                                    </p>
                                    <p className="text-muted-foreground flex items-center gap-2 text-xs">
                                        {entry.titleType && TITLE_TYPE_LABELS[entry.titleType]}
                                        <span className="bg-muted rounded-full px-2 py-0.5 text-[11px]">
                                            {entryMethodLabel(entry)}
                                        </span>
                                        {entry.billingAccountName && (
                                            <span className="truncate">
                                                {entry.billingAccountName}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className={cn('text-sm font-semibold', tone)}>
                                        {income ? '+' : '-'}
                                        {formatAmount(entry.totalAmount)}
                                    </span>
                                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                        <Clock className="size-3" aria-hidden="true" />
                                        {formatDate(entry.paidAt)}
                                    </span>
                                </div>
                                <ChevronRight
                                    className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                                    aria-hidden="true"
                                />
                            </button>
                        </li>
                    );
                })}
            </ul>
            <Pagination
                page={page.page}
                pageSize={page.pageSize}
                total={page.total}
                onPageChange={pagination.onPageChange}
                onPageSizeChange={pagination.onPageSizeChange}
                pageSizeLabel="Transações por página:"
            />
            <TransactionDialog
                title={selected}
                ago={selected ? daysAgoLabel(selected.createdAt, new Date()) : ''}
                onClose={() => setSelected(null)}
            />
        </section>
    );
}
