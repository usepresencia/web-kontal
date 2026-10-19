import { ReportPage } from '@/lib/_components/reports/report-page';
import type { ReportSection } from '@/lib/_components/reports/report-types';
import { parsePeriodParams } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import { formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { dreSchema } from '@/lib/api/schemas/reports';
import { ReportFilters } from '../_components/report-filters';
import { periodLabel, treeToRows } from '../_components/report-rows';

const LINE_LABELS: Record<string, string> = {
    grossRevenue: 'Receita bruta',
    revenueDeductions: '(-) Deduções da receita',
    netRevenue: 'Receita líquida',
    costOfSales: '(-) Custo das vendas',
    grossProfit: 'Lucro bruto',
    operatingExpenses: '(-) Despesas operacionais',
    otherOperatingResult: 'Outros resultados operacionais',
    operatingResult: 'Resultado operacional',
    financialRevenue: 'Receitas financeiras',
    financialExpenses: '(-) Despesas financeiras',
    financialResult: 'Resultado financeiro',
    resultBeforeTaxes: 'Resultado antes dos impostos',
    incomeTaxes: '(-) Impostos sobre o lucro',
    netResult: 'Resultado líquido',
};

const TOTAL_LINES = new Set([
    'netRevenue',
    'grossProfit',
    'operatingResult',
    'resultBeforeTaxes',
    'netResult',
]);

export default async function DrePage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { start, end } = parsePeriodParams(await searchParams, new Date());
    const dre = await apiFetch(`/reports/dre?start=${start}&end=${end}`, dreSchema);

    const sections: ReportSection[] = [
        {
            columns: [{ label: 'Linha' }, { label: 'Valor', align: 'right' }],
            rows: Object.entries(LINE_LABELS).flatMap(([key, label]) =>
                dre.lines[key] === undefined
                    ? []
                    : [
                          {
                              cells: [label, formatAmount(dre.lines[key])],
                              kind: TOTAL_LINES.has(key) ? ('total' as const) : undefined,
                          },
                      ],
            ),
        },
        {
            title: 'Receitas por conta',
            columns: [{ label: 'Conta' }, { label: 'Valor', align: 'right' }],
            rows: treeToRows(dre.revenueTree),
        },
        {
            title: 'Despesas por conta',
            columns: [{ label: 'Conta' }, { label: 'Valor', align: 'right' }],
            rows: treeToRows(dre.expenseTree),
        },
        ...(dre.unclassified.length > 0
            ? [
                  {
                      title: 'Contas sem categoria de DRE',
                      note: 'Estas contas têm movimento, mas não entram nas linhas acima até receberem categoria.',
                      columns: [{ label: 'Conta' }, { label: 'Valor', align: 'right' as const }],
                      rows: dre.unclassified.map(item => ({
                          cells: [`${item.code} ${item.name}`, formatAmount(item.amount)],
                      })),
                  },
              ]
            : []),
    ];

    return (
        <ReportPage
            subtitle="Receitas, custos e despesas do período, até o resultado líquido"
            report={{
                title: 'DRE',
                period: periodLabel(start, end, formatDate),
                filename: `dre-${start}-a-${end}`,
                sections,
            }}
            filters={<ReportFilters mode="period" start={start} end={end} />}
        />
    );
}
