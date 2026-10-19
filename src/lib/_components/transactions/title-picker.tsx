'use client';

import { Divider } from '@/lib/_components/divider';
import { cn } from '@/lib/_utils/cn';
import { matchesQuery } from '@/lib/_utils/kpi';
import { formatAmount } from '@/lib/_utils/money';
import { formatDate } from '@/lib/_utils/title-labels';
import type { Title } from '@/lib/api/schemas/title';
import { ChevronRight, CreditCard, Search } from 'lucide-react';
import { useState } from 'react';

type TitlePickerProps = {
    /** Títulos em aberto do tipo escolhido; null enquanto carregam. */
    titles: Title[] | null;
    onPick: (title: Title) => void;
};

/** Lista de títulos em aberto com busca pela descrição, para escolher qual pagar ou receber. */
export function TitlePicker({ titles, onPick }: TitlePickerProps) {
    const [query, setQuery] = useState('');

    if (titles === null) return <p className="text-muted-foreground text-sm">Carregando…</p>;
    if (titles.length === 0) {
        return <p className="text-muted-foreground text-sm">Nenhum título em aberto.</p>;
    }

    const visible = titles.filter(title => matchesQuery(title.description, query));

    return (
        <div className="space-y-3">
            <div className="relative">
                <Search
                    className="text-muted-foreground absolute top-1/2 left-4 size-4 -translate-y-1/2"
                    aria-hidden="true"
                />
                <input
                    type="search"
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    placeholder="Buscar título…"
                    aria-label="Buscar título"
                    className="bg-card focus-visible:ring-ring h-10 w-full rounded-full pr-4 pl-10 text-sm shadow-sm outline-none focus-visible:ring-2"
                />
            </div>

            {visible.length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhum título encontrado.</p>
            ) : (
                <ul className="max-h-72 overflow-y-auto">
                    {visible.map((title, index) => {
                        const income = title.type === 'INCOME';
                        return (
                            <li key={title.id}>
                                {index > 0 && <Divider className="my-1 mr-3 ml-12" />}
                                <button
                                    type="button"
                                    onClick={() => onPick(title)}
                                    className="group hover:bg-muted/50 focus-visible:ring-ring flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left focus-visible:ring-2 focus-visible:outline-none"
                                >
                                    <div
                                        className={cn(
                                            'flex size-9 shrink-0 items-center justify-center rounded-full',
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
                                        <p className="text-muted-foreground text-xs">
                                            {title.partyName && `${title.partyName} · `}Vence{' '}
                                            {formatDate(title.expirationDate)}
                                        </p>
                                    </div>
                                    <span
                                        className={cn(
                                            'text-sm font-semibold',
                                            income ? 'text-positive' : 'text-negative',
                                        )}
                                    >
                                        {formatAmount(title.remainingAmount)}
                                    </span>
                                    <ChevronRight
                                        className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                                        aria-hidden="true"
                                    />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
