'use client';

import { useBusyFlag } from '@/lib/_components/busy-provider';
import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

type FormPendingOverlayProps = {
    message?: string;
    /** Mantém o carregamento depois da resposta do servidor, até a página ser trocada (ex.: redirecionamento externo). */
    untilNavigation?: boolean;
};

/** Dentro de um `<form action>`: mostra o carregamento enquanto o envio está em andamento. */
export function FormPendingOverlay({
    message = 'Salvando…',
    untilNavigation = false,
}: FormPendingOverlayProps) {
    const { pending } = useFormStatus();
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (untilNavigation && pending) setSubmitted(true);
    }, [untilNavigation, pending]);

    useBusyFlag(pending || submitted, message);
    return null;
}
