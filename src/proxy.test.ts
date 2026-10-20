import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from './proxy';

const request = (path: string) => new NextRequest(`https://kontal.presencia.com.br${path}`);

describe('proxy: rotas públicas sem sessão', () => {
    it.each(['/robots.txt', '/api/health', '/acesso-negado', '/sso-callback'])(
        '%s não redireciona para o login',
        path => {
            expect(proxy(request(path)).status).toBe(200);
        },
    );

    it.each(['/', '/home', '/operacoes/pagar'])('%s redireciona para a sessão expirada', path => {
        const response = proxy(request(path));
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe(
            'https://kontal.presencia.com.br/api/session/expired',
        );
    });
});
