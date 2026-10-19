import 'server-only';

/** URL da api-kontal chamada pelo servidor do Next. */
export function kontalApiUrl(): string {
    const url = process.env.KONTAL_API_URL;
    if (!url) throw new Error('KONTAL_API_URL não configurada.');
    return url.replace(/\/$/, '');
}

/** URL do web-presencia, de onde vem o SSO. */
export function presenciaUrl(): string | null {
    return process.env.NEXT_PUBLIC_PRESENCIA_URL?.replace(/\/$/, '') ?? null;
}

/** URL do SSO do Presencia, para onde o usuário volta quando a sessão acaba. */
export function presenciaKontalRedirectUrl(): string | null {
    const base = presenciaUrl();
    return base ? `${base}/api/kontal-redirect` : null;
}
