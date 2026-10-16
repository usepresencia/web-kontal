import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ReportSections } from './report-sections';
import type { ReportSection } from './report-types';

const sections: ReportSection[] = [
    {
        title: 'Receitas por conta',
        note: 'Contas com movimento.',
        columns: [{ label: 'Conta' }, { label: 'Valor', align: 'right' }],
        rows: [
            { cells: ['3 Receitas', 'R$ 10,00'], kind: 'group' },
            { cells: ['3.1 Vendas', 'R$ 10,00'], indent: 1, tone: 'positive' },
            { cells: ['Total', 'R$ 10,00'], kind: 'total' },
        ],
    },
];

const html = renderToStaticMarkup(<ReportSections sections={sections} />);

describe('ReportSections', () => {
    it('mostra cada bloco no cartão padrão, com título e nota', () => {
        expect(html).toContain('bg-card');
        expect(html).toContain('rounded-2xl');
        expect(html).toContain('Receitas por conta');
        expect(html).toContain('Contas com movimento.');
    });

    it('destaca o total, recua a conta e colore o valor', () => {
        expect(html).toContain('bg-muted/60 font-semibold');
        expect(html).toContain('padding-left:32px');
        expect(html).toContain('text-positive');
    });

    it('alinha os valores à direita', () => {
        expect(html).toContain('text-right');
    });
});
