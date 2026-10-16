import { BusyProvider } from '@/lib/_components/busy-provider';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/companies', () => ({
    getCurrentCompanyAction: vi.fn(),
    updateCompanyAction: vi.fn(),
    signLogoUploadAction: vi.fn(),
    saveLogoAction: vi.fn(),
    removeLogoAction: vi.fn(),
}));

const { CurrentCompanyDialog } = await import('./current-company-dialog');

describe('CurrentCompanyDialog', () => {
    it('é um botão que abre o modal de edição da empresa atual', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <CurrentCompanyDialog />
            </BusyProvider>,
        );
        expect(html).toContain('Editar empresa atual');
        expect(html).toContain('aria-haspopup="dialog"');
    });
});
