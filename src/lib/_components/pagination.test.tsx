import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Pagination } from './pagination';

const render = (page: number, total: number, pageSize = 10) =>
    renderToStaticMarkup(
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={() => undefined} />,
    );

describe('Pagination', () => {
    it('mostra só os botões de página, alinhados à direita', () => {
        const html = render(1, 9);
        expect(html).toContain('justify-end');
        expect(html).toContain('aria-label="Página anterior"');
        expect(html).toContain('aria-label="Próxima página"');
        expect(html).toContain('aria-current="page"');
    });

    it('não mostra o resumo "Mostrando" nem o seletor de itens por página', () => {
        const html = render(1, 100);
        expect(html).not.toContain('Mostrando');
        expect(html).not.toContain('Itens por página');
        expect(html).not.toContain('/ página');
    });

    it('desabilita o anterior na primeira página e o próximo na última', () => {
        expect(render(1, 25)).toMatch(
            /aria-label="Página anterior"[^>]*disabled|disabled[^>]*aria-label="Página anterior"/,
        );
        expect(render(3, 25)).toMatch(
            /aria-label="Próxima página"[^>]*disabled|disabled[^>]*aria-label="Próxima página"/,
        );
    });

    it('deixa a página atual maior que as demais e que os botões de anterior e próxima', () => {
        const html = render(2, 50);
        const button = (label: string) =>
            html.match(new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`))?.[0] ?? '';
        expect(button('Página 2')).toContain('size-10');
        expect(button('Página 1')).toContain('size-8');
        expect(button('Página 3')).toContain('size-8');
        expect(button('Página anterior')).toContain('size-8');
        expect(button('Próxima página')).toContain('size-8');
    });
});
