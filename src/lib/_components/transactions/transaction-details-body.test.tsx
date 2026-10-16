import type { Title, TitleEntry } from '@/lib/api/schemas/title';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TransactionDetailsBody } from './transaction-details-body';

const title: Title = {
    id: '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a5b',
    presetId: 'p',
    presetName: 'Padrão',
    seriesId: null,
    seriesIndex: null,
    type: 'EXPENSE',
    status: 'OPEN',
    description: 'Aluguel da loja',
    amount: '3200.00',
    settledAmount: '0.00',
    remainingAmount: '3200.00',
    issueDate: '2026-09-17',
    expirationDate: '2026-11-10',
    feesPercentageMonthly: 0.02,
    createdAt: '2026-09-16T10:00:00.000Z',
};

const entry: TitleEntry = {
    id: 'e1',
    titleId: title.id,
    kind: 'PAYMENT',
    billingAccountId: 'a',
    principalAmount: '100.00',
    interestAmount: '0.00',
    fineAmount: '0.00',
    discountAmount: '0.00',
    totalAmount: '100.00',
    paidAt: '2026-10-01',
    paymentMethod: 'PIX',
    description: null,
    createdAt: '2026-10-01T10:00:00.000Z',
};

const render = (entries: TitleEntry[] | null, overrides: Partial<Title> = {}) =>
    renderToStaticMarkup(
        <TransactionDetailsBody
            title={{ ...title, ...overrides }}
            ago="há 30d"
            entries={entries}
            copied={false}
            onCopy={() => undefined}
            onPay={() => undefined}
        />,
    );

describe('TransactionDetailsBody', () => {
    it('separa as baixas com o divisor do padrão e afasta as linhas das bordas', () => {
        const html = render([entry, { ...entry, id: 'e2' }]);
        expect(html).toContain('role="separator"');
        expect(html).toContain('from-primary/10');
        expect(html).not.toContain('divide-y');
        expect(html).toContain('space-y-1 py-1');
    });

    it('mostra os dados do título', () => {
        const html = render([]);
        expect(html).toContain('Aluguel da loja');
        expect(html).toContain('-R$ 3.200,00');
        expect(html).toContain('A pagar');
        expect(html).toContain('Em aberto');
        expect(html).toContain('10/11/2026');
        expect(html).toContain('2%');
        expect(html).not.toContain('Abrir título completo');
    });

    it('oferece "Pagar título" no título a pagar em aberto', () => {
        const html = render([]);
        expect(html).toContain('Pagar título');
        expect(html).not.toContain('Baixar título');
    });

    it('oferece "Receber título" no título a receber em aberto', () => {
        const html = render([], { type: 'INCOME' });
        expect(html).toContain('Receber título');
        expect(html).not.toContain('Baixar título');
    });

    it.each(['SETTLED', 'WRITTEN_OFF'] as const)(
        'não oferece baixa quando o título está %s',
        status => {
            const html = render([], { status });
            expect(html).not.toContain('Pagar título');
            expect(html).not.toContain('Receber título');
        },
    );

    it('mostra "Carregando" enquanto as baixas não chegam', () => {
        expect(render(null)).toContain('Carregando');
    });

    it('avisa quando não há baixas', () => {
        expect(render([])).toContain('Nenhuma baixa registrada');
    });

    it('lista as baixas com data, forma e valor', () => {
        const html = render([entry]);
        expect(html).toContain('01/10/2026');
        expect(html).toContain('Pix');
        expect(html).toContain('R$ 100,00');
    });

    it('usa o sinal e a cor de receita no título a receber', () => {
        const html = render([], { type: 'INCOME' });
        expect(html).toContain('+R$ 3.200,00');
        expect(html).toContain('A receber');
    });

    it('chama o botão de "Pagar parcela" quando o título é de um parcelamento', () => {
        expect(render([], { seriesId: 's', seriesIndex: 2 })).toContain('Pagar parcela');
        expect(render([])).toContain('Pagar título');
    });

    it('mostra a parcela quando o título é de uma série', () => {
        expect(render([], { seriesId: 's', seriesIndex: 3 })).toContain('Parcela 3');
    });

    it('escapa o HTML da descrição (anti-XSS)', () => {
        const html = render([], { description: '<img src=x onerror=alert(1)>' });
        expect(html).not.toContain('<img src=x');
        expect(html).toContain('&lt;img');
    });
});
