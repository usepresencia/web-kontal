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
                parties={[{ value: 'pt1', label: 'Copel', defaultPresetId: 'p1' }]}
                presets={[{ value: 'p1', label: 'Padrão', defaultAccountId: null }]}
                destinationAccounts={[{ value: 'a1', label: '1.2 Estoque' }]}
                financialAccounts={[{ value: 'c1', label: '1.1 Caixa' }]}
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

    it('oferece "Pagar agora" no título a pagar e "Receber agora" no a receber', () => {
        expect(render('EXPENSE')).toContain('Pagar agora');
        expect(render('INCOME')).toContain('Receber agora');
    });

    it('mantém a conta e a forma de pagamento escondidas até marcar a opção', () => {
        const html = render('EXPENSE');
        expect(html).toContain('type="checkbox"');
        expect(html).not.toContain('paymentAccountId');
    });

    it('não traz mais os campos de saldo inicial, que ganharam lugar próprio', () => {
        const html = render('EXPENSE');
        expect(html).not.toContain('openingDate');
        expect(html).not.toContain('Implantação');
    });

    it('pré-seleciona a despesa do histórico padrão na conta de destino', () => {
        const html = renderToStaticMarkup(
            <BusyProvider>
                <TitleForm
                    action={vi.fn()}
                    type="EXPENSE"
                    parties={[{ value: 'pt1', label: 'Copel', defaultPresetId: 'p1' }]}
                    presets={[{ value: 'p1', label: 'Padrão', defaultAccountId: 'a1' }]}
                    destinationAccounts={[{ value: 'a1', label: '1.2 Estoque' }]}
                    financialAccounts={[{ value: 'c1', label: '1.1 Caixa' }]}
                />
            </BusyProvider>,
        );
        expect(html).toMatch(/<input[^>]*name="destinationAccountId"[^>]*value="a1"/);
    });

    it('deixa a conta de destino vazia quando o histórico padrão não tem despesa definida', () => {
        const html = render('EXPENSE');
        expect(html).toMatch(/<input[^>]*name="destinationAccountId"[^>]*value=""/);
    });
});

const renderOpening = (type: 'INCOME' | 'EXPENSE') =>
    renderToStaticMarkup(
        <BusyProvider>
            <TitleForm
                action={vi.fn()}
                type={type}
                parties={[{ value: 'pt1', label: 'Copel', defaultPresetId: 'p1' }]}
                presets={[{ value: 'p1', label: 'Padrão', defaultAccountId: null }]}
                financialAccounts={[{ value: 'c1', label: '1.1 Caixa' }]}
                opening
            />
        </BusyProvider>,
    );

describe('TitleForm como saldo ou despesa inicial', () => {
    it('envia o título como implantação e pede a data e o valor já baixado', () => {
        const html = renderOpening('INCOME');
        expect(html).toMatch(/<input[^>]*name="isOpening"[^>]*value="true"/);
        expect(html).toContain('name="openingDate"');
        expect(html).toContain('name="settledAmount"');
        expect(html).not.toContain('name="issueDate"');
    });

    it('não oferece repetição, conta de destino nem pagamento na hora', () => {
        const html = renderOpening('EXPENSE');
        expect(html).not.toContain('name="repeat"');
        expect(html).not.toContain('destinationAccountId');
        expect(html).not.toContain('payNow');
    });

    it('chama de saldo inicial a receber e de despesa inicial a pagar', () => {
        expect(renderOpening('INCOME')).toContain('Registrar saldo inicial');
        expect(renderOpening('EXPENSE')).toContain('Registrar despesa inicial');
    });

    it('não mostra os campos de implantação no cadastro comum', () => {
        expect(render('EXPENSE')).not.toContain('isOpening');
    });
});

const renderSeries = (type: 'INCOME' | 'EXPENSE') =>
    renderToStaticMarkup(
        <BusyProvider>
            <TitleForm
                action={vi.fn()}
                type={type}
                parties={[{ value: 'pt1', label: 'Copel', defaultPresetId: 'p1' }]}
                presets={[{ value: 'p1', label: 'Padrão', defaultAccountId: null }]}
                financialAccounts={[{ value: 'c1', label: '1.1 Caixa' }]}
                series
            />
        </BusyProvider>,
    );

describe('TitleForm como parcelamento', () => {
    it('exige a repetição: já vem parcelado, com quantidade e data final, sem "Sem repetição"', () => {
        const html = renderSeries('EXPENSE');
        expect(html).toMatch(/name="repeat" value="INSTALLMENT"/);
        expect(html).toContain('name="count"');
        expect(html).toContain('name="until"');
        expect(html).not.toContain('Sem repetição');
    });

    it('não oferece pagar ou receber na hora', () => {
        expect(renderSeries('INCOME')).not.toContain('payNow');
    });

    it('chama o botão de "Criar parcelamento"', () => {
        expect(renderSeries('EXPENSE')).toContain('Criar parcelamento');
    });

    it('pede o fornecedor no título a pagar e o cliente no a receber, com o histórico padrão depois', () => {
        const expense = render('EXPENSE');
        expect(expense).toContain('name="partyId"');
        expect(expense).toContain('Fornecedor');
        expect(render('INCOME')).toContain('Cliente');
        expect(expense).toContain('Histórico padrão');
        expect(expense.indexOf('name="partyId"')).toBeLessThan(expense.indexOf('name="presetId"'));
    });

    it('mantém a contraparte no saldo inicial e no parcelamento', () => {
        expect(renderOpening('EXPENSE')).toContain('name="partyId"');
        expect(renderSeries('EXPENSE')).toContain('name="partyId"');
    });
});
