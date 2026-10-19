import { BusyProvider } from '@/lib/_components/busy-provider';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/session', () => ({ logoutAction: vi.fn() }));

const { BackToLogin } = await import('./back-to-login');

describe('BackToLogin', () => {
    it('renderiza um formulário com o botão Voltar que envia a saída da sessão', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <BackToLogin />
            </BusyProvider>,
        );
        expect(html).toContain('<form');
        expect(html).toContain('type="submit"');
        expect(html).toContain('Voltar');
        expect(html).toContain('lucide-log-out');
    });
});
