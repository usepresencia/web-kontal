import { BusyProvider } from '@/lib/_components/busy-provider';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/titles', () => ({ createEntryAction: vi.fn() }));

const { EntryForm } = await import('./entry-form');

const render = (paying = true) =>
    renderToStaticMarkup(
        <BusyProvider>
            <EntryForm
                titleId="t1"
                accounts={[{ value: 'a1', label: '1.1 Caixa' }]}
                today="2026-10-16"
                paying={paying}
            />
        </BusyProvider>,
    );

describe('EntryForm', () => {
    it('usa os campos em pílula do padrão do modal, com rótulos recuados', () => {
        const html = render();
        expect(html).toContain('rounded-full');
        expect(html).toContain('pl-4');
        expect(html).not.toMatch(/<input[^>]*type="date"/);
    });

    it('mostra todos os campos da baixa', () => {
        const html = render();
        for (const name of [
            'billingAccountId',
            'principalAmount',
            'paidAt',
            'paymentMethod',
            'interestAmount',
            'fineAmount',
            'discountAmount',
            'description',
        ]) {
            expect(html).toContain(`name="${name}"`);
        }
        expect(html).toContain('value="2026-10-16"');
        expect(html).toContain('value="PIX"');
    });

    it('alinha o botão Registrar à direita', () => {
        const html = render();
        const area = html.match(/<div class="[^"]*justify-end[^"]*">[\s\S]*?Registrar/)?.[0] ?? '';
        expect(area).toContain('justify-end');
        expect(html).toContain('Registrar');
    });

    it('usa o título de recebimento em título a receber', () => {
        expect(render(false)).toContain('Registrar recebimento');
        expect(render(true)).toContain('Registrar pagamento');
    });
});
