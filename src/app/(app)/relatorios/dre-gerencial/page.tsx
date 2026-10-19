import { ReportPage } from '@/lib/_components/reports/report-page';
import type { ReportSection } from '@/lib/_components/reports/report-types';
import { formatMonth, parsePeriodParams } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import { formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { managementDreSchema } from '@/lib/api/schemas/reports';
import { ReportFilters } from '../_components/report-filters';
import { periodLabel } from '../_components/report-rows';

const LINE_LABELS: Record<string, string> = {
    grossRevenue: 'Receita bruta',
    revenueDeductions: '(-) Deduções da receita',
    netRevenue: 'Receita líquida',
    variableCosts: '(-) Custos variáveis',
    contributionMargin: 'Margem de contribuição',
    fixedCosts: '(-) Custos fixos',
    otherRevenue: 'Outras receitas',
    resultBeforeDepreciation: 'Resultado antes da depreciação',
    depreciation: '(-) Depreciação',
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
    'contributionMargin',
    'operatingResult',
    'resultBeforeTaxes',
    'netResult',
]);

export default async function ManagementDrePage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { start, end } = parsePeriodParams(await searchParams, new Date());
    const dre = await apiFetch(
        `/reports/management-dre?start=${start}&end=${end}&groupBy=month`,
        managementDreSchema,
    );
    const money = { label: 'Valor', align: 'right' as const };

    const sections: ReportSection[] = [
        {
            note:
                dre.contributionMarginPercent !== null
                    ? `Margem de contribuição: ${dre.contributionMarginPercent.replace('.', ',')}%`
                    : undefined,
            columns: [{ label: 'Linha' }, money],
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
        ...(dre.months && dre.months.length > 0
            ? [
                  {
                      title: 'Por mês',
                      columns: [
                          { label: 'Mês' },
                          { label: 'Receita líquida', align: 'right' as const },
                          { label: 'Margem de contribuição', align: 'right' as const },
                          { label: 'Resultado operacional', align: 'right' as const },
                          { label: 'Resultado líquido', align: 'right' as const },
                      ],
                      rows: dre.months.map(month => ({
                          cells: [
                              formatMonth(month.month),
                              formatAmount(month.netRevenue),
                              formatAmount(month.contributionMargin),
                              formatAmount(month.operatingResult),
                              formatAmount(month.netResult),
                          ],
                      })),
                  },
              ]
            : []),
        ...(dre.unclassified.length > 0
            ? [
                  {
                      title: 'Contas sem classificação',
                      note: 'Defina a categoria de DRE ou o comportamento do custo dessas contas no plano de contas.',
                      columns: [{ label: 'Conta' }, money],
                      rows: dre.unclassified.map(item => ({
                          cells: [`${item.code} ${item.name}`, formatAmount(item.amount)],
                      })),
                  },
              ]
            : []),
    ];

    return (
        <ReportPage
            subtitle="Resultado do período separando custos variáveis, fixos e a margem de contribuição"
            report={{
                title: 'DRE gerencial',
                period: periodLabel(start, end, formatDate),
                filename: `dre-gerencial-${start}-a-${end}`,
                sections,
            }}
            filters={<ReportFilters mode="period" start={start} end={end} />}
        />
    );
}
