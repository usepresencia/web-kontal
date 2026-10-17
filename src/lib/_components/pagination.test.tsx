import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PAGE_SIZE_OPTIONS, Pagination } from './pagination';

const render = (page: number, total: number, pageSize = 10) =>
    renderToStaticMarkup(
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={() => undefined} />,
    );

describe('Pagination', () => {
    it('mostra só os botões de página, alinhados à direita', () => {
        const html = render(1, 9);
        expect(html).toContain('aria-label="Página anterior"');
        expect(html).toContain('aria-label="Próxima página"');
        expect(html).toContain('aria-current="page"');
    });

    it('não mostra o resumo "Mostrando"', () => {
        expect(render(1, 100)).not.toContain('Mostrando');
    });

    it('não mostra o seletor de itens por página quando não há como trocá-lo', () => {
        expect(render(1, 100)).not.toContain('/ página');
        expect(render(1, 100)).toContain('justify-end');
    });

    it('mostra o seletor de itens por página à esquerda, antes dos botões', () => {
        const html = renderToStaticMarkup(
            <Pagination
                page={1}
                pageSize={25}
                total={100}
                onPageChange={() => undefined}
                onPageSizeChange={() => undefined}
            />,
        );
        expect(html).toContain('justify-between');
        expect(html).toContain('25 / página');
        expect(html.indexOf('25 / página')).toBeLessThan(html.indexOf('Página anterior'));
    });

    it('oferece 10, 25, 50 e 100 itens por página', () => {
        expect(PAGE_SIZE_OPTIONS).toEqual([10, 25, 50, 100]);
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
