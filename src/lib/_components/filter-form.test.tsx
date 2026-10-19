import { BusyProvider } from '@/lib/_components/busy-provider';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn() }),
    usePathname: () => '/operacoes/pagar',
}));

const { FilterForm } = await import('./filter-form');

describe('FilterForm', () => {
    it('continua sendo um formulário GET, que funciona mesmo sem JavaScript', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <FilterForm className="x">
                    <input name="status" />
                </FilterForm>
            </BusyProvider>,
        );
        expect(html).toContain('method="get"');
        expect(html).toContain('name="status"');
    });
});
