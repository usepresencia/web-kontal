const MAX_TOKEN_LENGTH = 4096;
const BASE64URL_PART = /^[A-Za-z0-9_-]+$/;

/** Confere só o formato de um JWT (três partes base64url, até 4 KB); a validade é da api-kontal. */
export function isWellFormedToken(token: string): boolean {
    if (token.length === 0 || token.length > MAX_TOKEN_LENGTH) return false;
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => BASE64URL_PART.test(part));
}
