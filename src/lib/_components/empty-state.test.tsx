import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
    it('usa o mesmo cartão das listas, sem borda', () => {
        const html = renderToStaticMarkup(<EmptyState title="Nenhum fechamento" />);
        expect(html).toContain('bg-card');
        expect(html).toContain('rounded-2xl');
        expect(html).toContain('shadow-sm');
        expect(html).not.toMatch(/[\s"]border[\s"]/);
    });

    it('mostra a descrição e a ação quando informadas', () => {
        const html = renderToStaticMarkup(
            <EmptyState
                title="Vazio"
                description="Nada por aqui"
                action={<button>Criar</button>}
            />,
        );
        expect(html).toContain('Nada por aqui');
        expect(html).toContain('Criar');
    });
});
