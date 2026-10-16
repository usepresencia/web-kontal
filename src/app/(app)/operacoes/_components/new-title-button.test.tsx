import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NewTitleButton } from './new-title-button';

describe('NewTitleButton', () => {
    it('leva ao cadastro e mostra o + antes do texto informado', () => {
        const html = renderToStaticMarkup(
            <NewTitleButton href="/operacoes/pagar/novo" label="Novo pagamento" />,
        );
        expect(html).toContain('href="/operacoes/pagar/novo"');
        expect(html).toContain('lucide-plus');
        expect(html).toContain('Novo pagamento');
        expect(html).not.toContain('Novo título');
        expect(html.indexOf('lucide-plus')).toBeLessThan(html.indexOf('Novo pagamento'));
    });

    it('aceita o rótulo de recebimento', () => {
        const html = renderToStaticMarkup(
            <NewTitleButton href="/operacoes/receber/novo" label="Novo recebimento" />,
        );
        expect(html).toContain('Novo recebimento');
    });
});
