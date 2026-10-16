import 'server-only';

import { FLASH_COOKIE } from '@/lib/_utils/flash';
import { cookies } from 'next/headers';

const FLASH_MAX_AGE_SECONDS = 30;

/** Guarda uma mensagem de confirmação para o toast da página seguinte (use antes de `redirect`). */
export async function flash(message: string): Promise<void> {
    (await cookies()).set(FLASH_COOKIE, message, {
        path: '/',
        maxAge: FLASH_MAX_AGE_SECONDS,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });
}
