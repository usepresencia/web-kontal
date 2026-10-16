'use client';

import { useBusyFlag } from '@/lib/_components/busy-provider';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

/** Mantém a página e o tamanho da página na query da URL (`?page=&pageSize=`). */
export function usePaginationQuery() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [pending, startTransition] = useTransition();
    useBusyFlag(pending, 'Carregando…');

    const update = useCallback(
        (changes: Record<string, string>) => {
            const next = new URLSearchParams(searchParams.toString());
            Object.entries(changes).forEach(([key, value]) => next.set(key, value));
            startTransition(() => router.push(`${pathname}?${next.toString()}`));
        },
        [pathname, router, searchParams],
    );

    return {
        onPageChange: (page: number) => update({ page: String(page) }),
        onPageSizeChange: (pageSize: number) => update({ pageSize: String(pageSize), page: '1' }),
    };
}
