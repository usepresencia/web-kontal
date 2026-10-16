'use client';

import { FLASH_COOKIE, readFlash } from '@/lib/_utils/flash';
import { notify } from '@/lib/_utils/notify';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Mostra como toast a mensagem deixada por uma ação antes de redirecionar, e a apaga. */
export function FlashToast() {
    const pathname = usePathname();

    useEffect(() => {
        const message = readFlash(document.cookie);
        if (!message) return;
        document.cookie = `${FLASH_COOKIE}=; path=/; max-age=0`;
        notify('success', message);
    }, [pathname]);

    return null;
}
