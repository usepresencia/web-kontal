import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { StepTitle } from './step-title';

vi.mock('@/lib/_components/ui/dialog', () => ({
    DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}));

describe('StepTitle', () => {
    it('mostra o chevron de voltar antes do título quando há como voltar', () => {
        const html = renderToStaticMarkup(
            <StepTitle onBack={() => undefined}>Baixar título</StepTitle>,
        );
        expect(html).toContain('aria-label="Voltar"');
        expect(html).toContain('lucide-chevron-left');
        expect(html.indexOf('lucide-chevron-left')).toBeLessThan(html.indexOf('Baixar título'));
    });

    it('mostra só o título quando não há como voltar', () => {
        const html = renderToStaticMarkup(<StepTitle>Detalhes da transação</StepTitle>);
        expect(html).toContain('Detalhes da transação');
        expect(html).not.toContain('Voltar');
        expect(html).not.toContain('lucide-chevron-left');
    });
});
