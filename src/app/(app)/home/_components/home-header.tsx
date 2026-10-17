'use client';

import { monthAbbreviation } from '@/lib/_utils/dates';
import { getGreeting } from '@/lib/_utils/greeting';
import { Bell, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const WEEKDAYS = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
];

type HomeHeaderProps = { name: string; query: string };

/** Cabeçalho da home: saudação, busca de transações, notificações e a data de hoje. */
export function HomeHeader({ name, query }: HomeHeaderProps) {
    const [now, setNow] = useState<Date | null>(null);

    // A data só existe no cliente, para o HTML do servidor não divergir do navegador.
    useEffect(() => setNow(new Date()), []);

    return (
        <header className="flex flex-wrap items-start justify-between gap-4 print:hidden">
            <div>
                <p className="text-muted-foreground text-sm">
                    {now ? getGreeting(now.getHours()) : ' '}
                </p>
                <h1 className="font-display text-foreground text-3xl leading-tight font-bold tracking-tight">
                    {name.split(' ')[0]}
                    <span className="text-positive">.</span>
                </h1>
                <p className="text-muted-foreground mt-0.5 text-sm">Rigor sem peso.</p>
            </div>

            <div className="flex items-center gap-3">
                <form action="/home" method="get" role="search" className="relative">
                    <Search
                        className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        name="q"
                        defaultValue={query}
                        placeholder="Buscar transações…"
                        aria-label="Buscar transações"
                        className="bg-card placeholder:text-muted-foreground focus-visible:ring-ring h-10 w-64 rounded-full pr-4 pl-10 text-sm shadow-sm outline-none focus-visible:ring-2"
                    />
                </form>

                <button
                    type="button"
                    disabled
                    title="Notificações em breve"
                    aria-label="Notificações"
                    className="bg-card text-foreground flex size-10 items-center justify-center rounded-full shadow-sm disabled:cursor-not-allowed"
                >
                    <Bell className="size-4" aria-hidden="true" />
                </button>

                <div className="bg-card min-w-32 rounded-2xl px-4 py-2 text-center shadow-sm">
                    <p className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
                        {now ? WEEKDAYS[now.getDay()] : ' '}
                    </p>
                    <p className="text-foreground text-sm font-semibold">
                        {now
                            ? `${now.getDate()} ${monthAbbreviation(now.getMonth())} ${now.getFullYear()}`
                            : ' '}
                    </p>
                </div>
            </div>
        </header>
    );
}
