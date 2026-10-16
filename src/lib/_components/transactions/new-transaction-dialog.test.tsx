import { BusyProvider } from '@/lib/_components/busy-provider';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/titles', () => ({
    getOpenTitlesAction: vi.fn(),
    getTitlePaymentAccountsAction: vi.fn(),
    createEntryAction: vi.fn(),
}));

const { NewTransactionDialog } = await import('./new-transaction-dialog');

const render = (label?: string, appearance?: 'accent' | 'default') =>
    renderToStaticMarkup(
        <BusyProvider>
            <NewTransactionDialog label={label} appearance={appearance} />
        </BusyProvider>,
    );

describe('NewTransactionDialog', () => {
    it('mostra "Nova transação" por padrão, com o + antes do texto', () => {
        const html = render();
        expect(html).toContain('Nova transação');
        expect(html.indexOf('lucide-plus')).toBeLessThan(html.indexOf('Nova transação'));
    });

    it('aceita outro rótulo, como "Nova baixa" na lista de baixas', () => {
        const html = render('Nova baixa');
        expect(html).toContain('Nova baixa');
        expect(html).not.toContain('Nova transação');
    });

    it('usa a pílula verde na home e o botão escuro padrão nas listas', () => {
        expect(render()).toContain('bg-accent');
        expect(render('Nova baixa', 'default')).not.toContain('bg-accent');
    });
});
