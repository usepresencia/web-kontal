import type { ReportDocument } from '@/lib/_components/reports/report-types';
import { describe, expect, it } from 'vitest';
import { buildReportPdf } from './report-pdf';

const report: ReportDocument = {
    title: 'DRE',
    period: '01/10/2026 a 31/10/2026',
    filename: 'dre',
    sections: [
        {
            columns: [{ label: 'Linha' }, { label: 'Valor', align: 'right' }],
            rows: [
                { cells: ['Receita bruta', 'R$ 1.000,00'] },
                { cells: ['Resultado líquido', 'R$ 400,00'], kind: 'total' },
            ],
        },
        {
            title: 'Receitas por conta',
            note: 'Contas com movimento.',
            columns: [{ label: 'Conta' }, { label: 'Valor', align: 'right' }],
            rows: [
                { cells: ['3 Receitas', 'R$ 1.000,00'], kind: 'group' },
                { cells: ['3.1 Vendas', 'R$ 1.000,00'], indent: 1, tone: 'positive' },
            ],
        },
    ],
};

describe('buildReportPdf', () => {
    it('gera um PDF válido com título, período e os blocos', () => {
        const doc = buildReportPdf(report);
        const bytes = new Uint8Array(doc.output('arraybuffer'));
        expect(String.fromCharCode(...bytes.slice(0, 5))).toBe('%PDF-');
        expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    });

    it('não falha com um relatório sem blocos', () => {
        expect(() => buildReportPdf({ ...report, sections: [] })).not.toThrow();
    });

    it('quebra em mais páginas quando o relatório é longo', () => {
        const long: ReportDocument = {
            ...report,
            sections: [
                {
                    columns: [{ label: 'Linha' }, { label: 'Valor', align: 'right' }],
                    rows: Array.from({ length: 120 }, (_, index) => ({
                        cells: [`Linha ${index}`, 'R$ 1,00'],
                    })),
                },
            ],
        };
        expect(buildReportPdf(long).getNumberOfPages()).toBeGreaterThan(1);
    });
});
