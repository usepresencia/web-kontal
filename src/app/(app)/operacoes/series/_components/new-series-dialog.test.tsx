import { BusyProvider } from '@/lib/_components/busy-provider';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/titles', () => ({
    createTitleAction: vi.fn(),
    getTitleFormOptionsAction: vi.fn(),
}));

const { NewSeriesDialog } = await import('./new-series-dialog');

describe('NewSeriesDialog', () => {
    it('mostra o botão "Novo parcelamento" com o + antes do texto', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <NewSeriesDialog />
            </BusyProvider>,
        );
        expect(html).toContain('Novo parcelamento');
        expect(html.indexOf('lucide-plus')).toBeLessThan(html.indexOf('Novo parcelamento'));
    });
});
