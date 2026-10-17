import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/lib/_components/ui/table';
import { formatMonth, parsePeriodParams } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import { apiFetch } from '@/lib/api/client';
import { managementDreSchema } from '@/lib/api/schemas/reports';
import { ReportFilters } from '../_components/report-filters';

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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">DRE gerencial</h1>
            <ReportFilters mode="period" start={start} end={end} />

            {dre.contributionMarginPercent !== null && (
                <p className="text-sm">
                    Margem de contribuição:{' '}
                    <span className="font-semibold">
                        {dre.contributionMarginPercent.replace('.', ',')}%
                    </span>
                </p>
            )}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Linha</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.entries(LINE_LABELS).map(([key, label]) =>
                        dre.lines[key] === undefined ? null : (
                            <TableRow
                                key={key}
                                className={TOTAL_LINES.has(key) ? 'bg-muted font-semibold' : ''}
                            >
                                <TableCell>{label}</TableCell>
                                <TableCell className="text-right">
                                    {formatAmount(dre.lines[key])}
                                </TableCell>
                            </TableRow>
                        ),
                    )}
                </TableBody>
            </Table>

            {dre.months && dre.months.length > 0 && (
                <section className="space-y-2">
                    <h2 className="font-display text-lg font-semibold">Por mês</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mês</TableHead>
                                <TableHead className="text-right">Receita líquida</TableHead>
                                <TableHead className="text-right">Margem de contribuição</TableHead>
                                <TableHead className="text-right">Resultado operacional</TableHead>
                                <TableHead className="text-right">Resultado líquido</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dre.months.map(month => (
                                <TableRow key={month.month}>
                                    <TableCell>{formatMonth(month.month)}</TableCell>
                                    <TableCell className="text-right">
                                        {formatAmount(month.netRevenue)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatAmount(month.contributionMargin)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatAmount(month.operatingResult)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatAmount(month.netResult)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            )}

            {dre.unclassified.length > 0 && (
                <section className="space-y-2">
                    <h2 className="font-display text-lg font-semibold">Contas sem classificação</h2>
                    <p className="text-muted-foreground text-sm">
                        Defina a categoria de DRE ou o comportamento do custo dessas contas no plano
                        de contas.
                    </p>
                    <Table>
                        <TableBody>
                            {dre.unclassified.map(item => (
                                <TableRow key={item.accountId}>
                                    <TableCell className="font-mono text-sm">{item.code}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">
                                        {formatAmount(item.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            )}
        </div>
    );
}
