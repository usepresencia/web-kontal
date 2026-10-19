'use client';

import { useBusyFlag } from '@/lib/_components/busy-provider';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition, type FormEvent, type ReactNode } from 'react';

/** Formulário de filtros: leva os campos preenchidos para a query da própria página e mostra o carregamento até ela atualizar. */
export function FilterForm({ className, children }: { className?: string; children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [pending, startTransition] = useTransition();
    useBusyFlag(pending, 'Filtrando…');

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = new URLSearchParams();
        for (const [key, value] of new FormData(event.currentTarget).entries()) {
            if (typeof value === 'string' && value !== '') query.append(key, value);
        }
        const search = query.toString();
        startTransition(() => router.push(search ? `${pathname}?${search}` : pathname));
    };

    return (
        <form method="get" onSubmit={onSubmit} className={className}>
            {children}
        </form>
    );
}
