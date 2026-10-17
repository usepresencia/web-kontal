import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LoadingOverlay } from './loading-overlay';

describe('LoadingOverlay', () => {
    it('não renderiza nada quando não está carregando', () => {
        expect(renderToStaticMarkup(<LoadingOverlay isLoading={false} />)).toBe('');
    });

    it('mostra o indicador e a mensagem, anunciados como status', () => {
        const html = renderToStaticMarkup(<LoadingOverlay isLoading message="Salvando…" />);
        expect(html).toContain('Salvando…');
        expect(html).toContain('role="status"');
        expect(html).toContain('squircle-spin');
    });

    it('usa "Carregando…" por padrão e escapa a mensagem', () => {
        expect(renderToStaticMarkup(<LoadingOverlay isLoading />)).toContain('Carregando…');
        const html = renderToStaticMarkup(<LoadingOverlay isLoading message="<b>x</b>" />);
        expect(html).not.toContain('<b>x');
    });
});
