'use client';

import { useEffect, useState } from 'react';

const DAYS = [
    'Domingo',
    'Segunda-Feira',
    'Terça-Feira',
    'Quarta-Feira',
    'Quinta-Feira',
    'Sexta-Feira',
    'Sábado',
];

const MONTHS = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
];

const PHRASES = [
    'Rigor sem peso.',
    'Cada lançamento certo hoje é um fechamento tranquilo amanhã.',
    'Débito e crédito sempre fecham. Bora conferir.',
    'Caixa em dia, cabeça leve.',
    'Os números estão aqui. A decisão é sua.',
    'Organização é o que faz o resultado aparecer.',
    'Um mês fechado é um mês resolvido.',
    'O que não se mede não se melhora.',
];

/** Saudação conforme a hora do dia. */
export function getGreeting(hour: number): string {
    if (hour < 12) return 'Bom dia,';
    if (hour < 18) return 'Boa tarde,';
    return 'Boa noite,';
}

/** Cabeçalho da tela inicial: saudação, nome, frase e a data de hoje. */
export function PageGreeting({ name }: { name: string }) {
    const [now, setNow] = useState<Date | null>(null);
    const [phrase, setPhrase] = useState('');

    // Data e frase só no cliente, para o HTML do servidor não divergir do navegador.
    useEffect(() => {
        setNow(new Date());
        setPhrase(PHRASES[Math.floor(Math.random() * PHRASES.length)]);
    }, []);

    const firstName = name.split(' ')[0];

    return (
        <header className="print:hidden">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-muted-foreground text-sm">
                        {now ? getGreeting(now.getHours()) : ' '}
                    </p>
                    <h1 className="text-foreground text-2xl font-bold">{firstName}.</h1>
                    <p className="text-muted-foreground mt-1 text-sm">{phrase}</p>
                </div>
                <div className="text-right">
                    <p className="text-foreground text-sm font-semibold">
                        {now ? `${DAYS[now.getDay()]},` : ''}
                    </p>
                    <p className="text-foreground text-4xl leading-none font-bold">
                        {now ? now.getDate() : ''}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {now ? `${MONTHS[now.getMonth()]} de ${now.getFullYear()}.` : ''}
                    </p>
                </div>
            </div>
            <div className="from-primary/30 mt-4 h-px bg-gradient-to-r from-50% to-transparent" />
        </header>
    );
}
