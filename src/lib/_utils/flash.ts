import type { ToastText } from '@/lib/_utils/toast-messages';

/** Cookie curto que leva uma mensagem de confirmação através de um redirecionamento. */
export const FLASH_COOKIE = 'kontal-flash';

/** Lê o toast (título e frase) do cookie `kontal-flash` em uma string de cookies, ou `null` se não houver. */
export function readFlash(cookieHeader: string): ToastText | null {
    const entry = cookieHeader.split('; ').find(part => part.startsWith(`${FLASH_COOKIE}=`));
    if (!entry) return null;
    try {
        const [title, message] = decodeURIComponent(entry.slice(FLASH_COOKIE.length + 1)).split(
            '\n',
        );
        return title && message ? { title, message } : null;
    } catch {
        return null;
    }
}
