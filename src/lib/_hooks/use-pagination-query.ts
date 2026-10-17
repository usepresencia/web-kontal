'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/** Mantém a página e o tamanho da página na query da URL (`?page=&pageSize=`). */
export function usePaginationQuery() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const update = useCallback(
        (changes: Record<string, string>) => {
            const next = new URLSearchParams(searchParams.toString());
            Object.entries(changes).forEach(([key, value]) => next.set(key, value));
            router.push(`${pathname}?${next.toString()}`);
        },
        [pathname, router, searchParams],
    );

    return {
        onPageChange: (page: number) => update({ page: String(page) }),
        onPageSizeChange: (pageSize: number) => update({ pageSize: String(pageSize), page: '1' }),
    };
}
