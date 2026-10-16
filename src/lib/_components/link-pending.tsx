'use client';

import { useBusyFlag } from '@/lib/_components/busy-provider';
import { useLinkStatus } from 'next/link';

/** Dentro de um `<Link>`: mostra o carregamento enquanto a navegação dele não termina. */
export function LinkPending({ message = 'Carregando…' }: { message?: string }) {
    const { pending } = useLinkStatus();
    useBusyFlag(pending, message);
    return null;
}
