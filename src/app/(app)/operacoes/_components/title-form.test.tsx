import { BusyProvider } from '@/lib/_components/busy-provider';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { TitleForm } from './title-form';

const render = (type: 'INCOME' | 'EXPENSE') =>
    renderToStaticMarkup(
        <BusyProvider>
            <TitleForm
                action={vi.fn()}
                type={type}
                presets={[{ value: 'p1', label: 'Padrão' }]}
                destinationAccounts={[{ value: 'a1', label: '1.2 Estoque' }]}
            />
        </BusyProvider>,
    );

describe('TitleForm', () => {
    it('usa o campo de valor em destaque e os campos em pílula, sem fieldset', () => {
        const html = render('EXPENSE');
        expect(html).toContain('role="separator"');
        expect(html).toContain('rounded-full');
        expect(html).not.toContain('<fieldset');
    });

    it('colore o R$ de vermelho no título a pagar e de verde no a receber', () => {
        expect(render('EXPENSE')).toContain('text-negative');
        expect(render('INCOME')).toContain('text-positive');
    });

    it('oferece a conta de destino só no título a pagar', () => {
        expect(render('EXPENSE')).toContain('destinationAccountId');
        expect(render('INCOME')).not.toContain('destinationAccountId');
    });

    it('esconde os campos de repetição enquanto não há repetição', () => {
        const html = render('EXPENSE');
        expect(html).not.toContain('name="count"');
        expect(html).not.toContain('name="until"');
    });
});
