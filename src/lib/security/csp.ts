type CspInput = { nonce: string; isDev: boolean };
type HeadersInput = CspInput & { pathname: string };

const SSO_CALLBACK_PATH = '/sso-callback';

/** Monta a Content-Security-Policy com o nonce da requisição. */
export function buildCsp({ nonce, isDev }: CspInput): string {
    const script = [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'",
        ...(isDev ? ["'unsafe-eval'"] : []),
    ];
    // Com nonce o navegador ignora 'unsafe-inline'; o modo dev injeta <style> sem nonce (indicador do Next).
    const style = isDev ? ["'self'", "'unsafe-inline'"] : ["'self'", `'nonce-${nonce}'`];

    return [
        "default-src 'self'",
        `script-src ${script.join(' ')}`,
        `style-src ${style.join(' ')}`,
        // Atributos style (usados pelo Radix para posicionar popovers) não executam script.
        "style-src-attr 'unsafe-inline'",
        "img-src 'self' data: blob: https://res.cloudinary.com",
        "font-src 'self'",
        `connect-src 'self' https://api.cloudinary.com https://brasilapi.com.br${isDev ? ' ws: wss:' : ''}`,
        "frame-ancestors 'none'",
        "form-action 'self'",
        "base-uri 'none'",
        "object-src 'none'",
    ].join('; ');
}

/**
 * Script que faz toda `<style>` criada em tempo de execução nascer com o nonce. Sonner e Radix
 * injetam CSS assim; sem o nonce a CSP de produção bloqueia (o toast some, o scroll-lock falha).
 */
export function styleNonceScript(nonce: string): string {
    return `(function(n){var c=Document.prototype.createElement;Document.prototype.createElement=function(t,o){var e=c.call(this,t,o);if(String(t).toLowerCase()==='style')e.setAttribute('nonce',n);return e};})(${JSON.stringify(nonce)});`;
}

/** Cabeçalhos de segurança aplicados a toda resposta de página. */
export function buildSecurityHeaders({
    pathname,
    nonce,
    isDev,
}: HeadersInput): Record<string, string> {
    return {
        'Content-Security-Policy': buildCsp({ nonce, isDev }),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        // O fragmento com o token nunca vai em Referer, mas a página de callback não envia nenhum.
        'Referrer-Policy':
            pathname === SSO_CALLBACK_PATH ? 'no-referrer' : 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
        'Cross-Origin-Opener-Policy': 'same-origin',
    };
}
