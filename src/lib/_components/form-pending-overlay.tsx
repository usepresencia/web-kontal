'use client';

import { useBusyFlag } from '@/lib/_components/busy-provider';
import { useFormStatus } from 'react-dom';

/** Dentro de um `<form action>`: mostra o carregamento enquanto o envio está em andamento. */
export function FormPendingOverlay({ message = 'Salvando…' }: { message?: string }) {
    const { pending } = useFormStatus();
    useBusyFlag(pending, message);
    return null;
}
