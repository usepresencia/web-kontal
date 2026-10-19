import 'server-only';

import { FLASH_COOKIE } from '@/lib/_utils/flash';
import type { ToastText } from '@/lib/_utils/toast-messages';
import { cookies } from 'next/headers';

const FLASH_MAX_AGE_SECONDS = 30;

/** Guarda uma mensagem de confirmação para o toast da página seguinte (use antes de `redirect`). */
export async function flash({ title, message }: ToastText): Promise<void> {
    (await cookies()).set(FLASH_COOKIE, `${title}\n${message}`, {
        path: '/',
        maxAge: FLASH_MAX_AGE_SECONDS,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });
}
