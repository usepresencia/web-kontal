'use client';

import { createSessionAction } from '@/actions/session';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const PRESENCIA_LOGIN_URL = `${process.env.NEXT_PUBLIC_PRESENCIA_URL ?? ''}/login`;

const MESSAGES = {
    INVALID: 'Sua sessão expirou ou é inválida.',
    FORBIDDEN: 'Seu usuário não tem acesso ao Kontal.',
    UNAVAILABLE: 'O Kontal está indisponível no momento. Tente novamente em instantes.',
} as const;

export default function SsoCallbackPage() {
    const router = useRouter();
    const started = useRef(false);
    const [error, setError] = useState<keyof typeof MESSAGES | null>(null);

    useEffect(() => {
        // O Strict Mode roda o efeito duas vezes; o token só pode ser consumido uma vez.
        if (started.current) return;
        started.current = true;

        const token = new URLSearchParams(window.location.hash.slice(1)).get('token');
        // O token sai da URL antes de qualquer outra coisa, para não ficar no histórico.
        window.history.replaceState(null, '', window.location.pathname);

        if (!token) {
            setError('INVALID');
            return;
        }

        createSessionAction(token)
            .then(result => {
                if (result.ok) router.replace('/empresa');
                else setError(result.reason);
            })
            .catch(() => setError('UNAVAILABLE'));
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center p-8">
            <meta name="referrer" content="no-referrer" />
            {error ? (
                <div className="max-w-md space-y-3 text-center">
                    <h1 className="text-2xl font-bold">Não foi possível entrar no Kontal</h1>
                    <p className="text-muted-foreground">{MESSAGES[error]}</p>
                    <a className="text-foreground underline" href={PRESENCIA_LOGIN_URL}>
                        Voltar ao Presencia
                    </a>
                </div>
            ) : (
                <p className="text-muted-foreground">Entrando no Kontal…</p>
            )}
        </main>
    );
}
