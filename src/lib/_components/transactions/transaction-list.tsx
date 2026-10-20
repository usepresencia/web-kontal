'use client';

import { Divider } from '@/lib/_components/divider';
import { cn } from '@/lib/_utils/cn';
import { formatAmount } from '@/lib/_utils/money';
import { TITLE_STATUS_LABELS, TITLE_TYPE_LABELS } from '@/lib/_utils/title-labels';
import type { Title } from '@/lib/api/schemas/title';
import { ChevronRight, Clock, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { TransactionDialog } from './transaction-dialog';

/** Linha da lista: o título, há quanto tempo foi a transação e o texto de apoio à direita (padrão: o mesmo tempo). */
export type TransactionRow = { title: Title; ago: string; caption?: string };

/** Subtítulo da linha: a contraparte e, só no título em aberto, se é a pagar ou a receber. */
function rowCaption(title: Title): string {
    const kind = title.status === 'OPEN' ? TITLE_TYPE_LABELS[title.type] : null;
    return [title.partyName, kind].filter(Boolean).join(' · ');
}

/** Lista das transações; cada linha abre o modal de detalhes e mostra o chevron ao passar o mouse. */
export function TransactionList({ rows }: { rows: TransactionRow[] }) {
    const [selected, setSelected] = useState<TransactionRow | null>(null);

    return (
        <>
            <ul className="space-y-1">
                {rows.map((row, index) => {
                    const { title } = row;
                    const income = title.type === 'INCOME';
                    return (
                        <li key={title.id}>
                            {index > 0 && <Divider className="my-1 mr-3 ml-12" />}
                            <button
                                type="button"
                                onClick={() => setSelected(row)}
                                aria-haspopup="dialog"
                                className="group hover:bg-muted/50 focus-visible:ring-ring -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-xl px-3 py-2 text-left focus-visible:ring-2 focus-visible:outline-none"
                            >
                                <div
                                    className={cn(
                                        'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                                        income
                                            ? 'bg-positive/10 text-positive'
                                            : 'bg-negative/10 text-negative',
                                    )}
                                >
                                    <CreditCard className="size-4" aria-hidden="true" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-foreground truncate text-sm font-medium">
                                        {title.description}
                                    </p>
                                    <p className="text-muted-foreground flex items-center gap-2 text-xs">
                                        {rowCaption(title)}
                                        <span className="bg-muted rounded-full px-2 py-0.5 text-[11px]">
                                            {TITLE_STATUS_LABELS[title.status]}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-0.5">
                                    <span
                                        className={cn(
                                            'text-sm font-semibold',
                                            income ? 'text-positive' : 'text-negative',
                                        )}
                                    >
                                        {income ? '+' : '-'}
                                        {formatAmount(title.amount)}
                                    </span>
                                    <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                        <Clock className="size-3" aria-hidden="true" />
                                        {row.caption ?? row.ago}
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

            <TransactionDialog
                title={selected?.title ?? null}
                ago={selected?.ago ?? ''}
                onClose={() => setSelected(null)}
            />
        </>
    );
}
