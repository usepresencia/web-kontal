import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Divider } from './divider';

describe('Divider', () => {
    it('é uma linha fraca em degradê que some para a direita', () => {
        const html = renderToStaticMarkup(<Divider />);
        expect(html).toContain('role="separator"');
        expect(html).toContain('from-primary/10');
        expect(html).toContain('to-transparent');
        expect(html).toContain('bg-linear-to-r');
    });

    it('aceita classes extras para o recuo', () => {
        expect(renderToStaticMarkup(<Divider className="ml-12" />)).toContain('ml-12');
    });
});
