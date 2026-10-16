import { BusyProvider } from '@/lib/_components/busy-provider';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/actions/titles', () => ({ createEntryAction: vi.fn() }));

const { EntryForm } = await import('./entry-form');

const render = (paying = true, defaultAmount?: string) =>
    renderToStaticMarkup(
        <BusyProvider>
            <EntryForm
                titleId="t1"
                accounts={[{ value: 'a1', label: '1.1 Caixa' }]}
                today="2026-10-16"
                paying={paying}
                defaultAmount={defaultAmount}
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

    it('usa a pílula clara com sombra dos filtros em todos os campos', () => {
        const html = render();
        const triggers =
            html.match(/<(input|button)[^>]*class="[^"]*rounded-full[^"]*"[^>]*>/g) ?? [];
        const fields = triggers.filter(
            tag => !tag.includes('type="hidden"') && !tag.includes('bg-accent'),
        );
        expect(fields.length).toBeGreaterThanOrEqual(7);
        for (const tag of fields) {
            expect(tag).toContain('shadow-sm');
            expect(tag).toContain('bg-card');
            expect(tag).toContain('border-0');
        }
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

    it('alinha o botão de envio à direita e o chama de Pagar ou Receber', () => {
        const pay = render(true);
        const area = pay.match(/<div class="[^"]*justify-end[^"]*">[\s\S]*?Pagar/)?.[0] ?? '';
        expect(area).toContain('justify-end');
        expect(pay).toContain('>Pagar<');
        expect(render(false)).toContain('>Receber<');
        expect(pay).not.toContain('>Registrar<');
    });

    it('não mostra o título "Registrar pagamento" nem "Registrar recebimento"', () => {
        expect(render(true)).not.toContain('Registrar pagamento');
        expect(render(false)).not.toContain('Registrar recebimento');
    });

    it('destaca o valor no estilo do modal de nova transação, com a cor do tipo', () => {
        const pay = render(true);
        expect(pay).toContain('R$');
        expect(pay).toMatch(/text-negative[^"]*"[^>]*>R\$/);
        expect(render(false)).toMatch(/text-positive[^"]*"[^>]*>R\$/);
    });

    it('preenche o valor com o saldo em aberto quando informado', () => {
        expect(render(true, '612,90')).toContain('value="612,90"');
        expect(render(true)).not.toContain('value="612,90"');
    });

    it('alinha o rótulo do valor e usa o divisor padrão em vez de uma linha cheia', () => {
        const html = render();
        expect(html).toContain('role="separator"');
        expect(html).not.toMatch(/[\s"]border-b[\s"]/);
    });
});

describe('EntryForm confirmação', () => {
    it('pede confirmação antes de enviar: o botão não envia o formulário direto', () => {
        const html = render();
        expect(html).not.toContain('type="submit"');
        expect(html).toMatch(/<button[^>]*type="button"[^>]*>Pagar<\/button>/);
    });
});
