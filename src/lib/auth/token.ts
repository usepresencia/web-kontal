const MAX_TOKEN_LENGTH = 4096;
const BASE64URL_PART = /^[A-Za-z0-9_-]+$/;

/**
 * Confere só o formato de um JWT (três partes base64url, até 4 KB); a validade é da api-kontal.
 * O emulador do Firebase emite tokens sem assinatura (terceira parte vazia): só aceitos fora de produção.
 */
export function isWellFormedToken(
    token: string,
    allowUnsigned = process.env.NODE_ENV !== 'production',
): boolean {
    if (token.length === 0 || token.length > MAX_TOKEN_LENGTH) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [header, payload, signature] = parts;
    const signatureOk = signature === '' ? allowUnsigned : BASE64URL_PART.test(signature);
    return BASE64URL_PART.test(header) && BASE64URL_PART.test(payload) && signatureOk;
}
