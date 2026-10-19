import { cookieNames } from '@/lib/auth/cookie-options';
import { presenciaKontalRedirectUrl } from '@/lib/config/env';
import { NextResponse } from 'next/server';

/** Encerra a sessão local e devolve o usuário ao Presencia, que entrega um token novo. */
export async function GET() {
    const target = presenciaKontalRedirectUrl();
    if (!target) {
        return new Response('Serviço temporariamente indisponível.', { status: 503 });
    }

    const response = NextResponse.redirect(target, { status: 302 });
    const names = cookieNames(process.env.NODE_ENV === 'production');
    response.cookies.delete(names.token);
    response.cookies.delete(names.tenant);
    return response;
}
