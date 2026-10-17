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
});
