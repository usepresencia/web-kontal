import { BusyProvider } from '@/lib/_components/busy-provider';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/journal', () => ({
    getJournalAccountOptionsAction: vi.fn(),
    createManualEntryAction: vi.fn(),
}));

const { NewEntryDialog } = await import('./new-entry-dialog');
const { ManualEntryForm } = await import('./manual-entry-form');

describe('NewEntryDialog', () => {
    it('mostra o botão "Novo lançamento" com o + antes do texto', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <NewEntryDialog />
            </BusyProvider>,
        );
        expect(html.indexOf('lucide-plus')).toBeLessThan(html.indexOf('Novo lançamento'));
    });
});

describe('ManualEntryForm', () => {
    const html = renderToStaticMarkup(
        <BusyProvider>
            <ManualEntryForm accounts={[{ value: 'a1', label: '1.1 Caixa' }]} today="2026-10-16" />
        </BusyProvider>,
    );

    it('usa os campos em pílula e o divisor padrão entre as linhas', () => {
        expect(html).toContain('rounded-full');
        expect(html).toContain('role="separator"');
        expect(html).not.toContain('<fieldset');
    });

    it('começa com duas linhas, pede confirmação e não envia direto', () => {
        expect((html.match(/aria-label="Remover linha"/g) ?? []).length).toBe(2);
        expect(html).not.toContain('type="submit"');
    });
});
