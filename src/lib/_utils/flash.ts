/** Cookie curto que leva uma mensagem de confirmação através de um redirecionamento. */
export const FLASH_COOKIE = 'kontal-flash';

/** Lê a mensagem do cookie `kontal-flash` em uma string de cookies, ou `null` se não houver. */
export function readFlash(cookieHeader: string): string | null {
    const entry = cookieHeader.split('; ').find(part => part.startsWith(`${FLASH_COOKIE}=`));
    if (!entry) return null;
    try {
        const message = decodeURIComponent(entry.slice(FLASH_COOKIE.length + 1));
        return message.length > 0 ? message : null;
    } catch {
        return null;
    }
}
