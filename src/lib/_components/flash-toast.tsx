'use client';

import { FLASH_COOKIE, readFlash } from '@/lib/_utils/flash';
import { notify } from '@/lib/_utils/notify';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Mostra como toast a mensagem deixada por uma ação antes de redirecionar, e a apaga. */
export function FlashToast() {
    const pathname = usePathname();

    useEffect(() => {
        const toast = readFlash(document.cookie);
        if (!toast) return;
        document.cookie = `${FLASH_COOKIE}=; path=/; max-age=0`;
        notify('success', toast.message, toast.title);
    }, [pathname]);

    return null;
}
