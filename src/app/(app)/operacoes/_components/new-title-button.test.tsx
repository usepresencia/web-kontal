import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NewTitleButton } from './new-title-button';

describe('NewTitleButton', () => {
    it('leva ao cadastro e mostra o + antes do texto', () => {
        const html = renderToStaticMarkup(<NewTitleButton href="/operacoes/pagar/novo" />);
        expect(html).toContain('href="/operacoes/pagar/novo"');
        expect(html).toContain('lucide-plus');
        expect(html).toContain('Novo título');
        expect(html.indexOf('lucide-plus')).toBeLessThan(html.indexOf('Novo título'));
    });
});
