const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/** Indica se o caminho é interno ao app, sem esquema, host nem barras duplas (open redirect). */
export function isSafeInternalPath(path: string): boolean {
    if (!path.startsWith('/') || path.startsWith('//')) return false;
    if (CONTROL_CHARS.test(path) || path.includes('\\')) return false;

    let decoded: string;
    try {
        decoded = decodeURIComponent(path);
    } catch {
        return false;
    }
    return !decoded.startsWith('//') && !decoded.includes('\\') && !CONTROL_CHARS.test(decoded);
}
