import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/lib/_components/ui/table';
import { parsePeriodParams } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import { apiFetch } from '@/lib/api/client';
import { dreSchema } from '@/lib/api/schemas/reports';
import { ReportFilters } from '../_components/report-filters';
import { TreeRows } from '../_components/tree-rows';

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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">DRE</h1>
            <ReportFilters mode="period" start={start} end={end} />

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

            <section className="space-y-2">
                <h2 className="font-display text-lg font-semibold">Receitas por conta</h2>
                <Table>
                    <TableBody>
                        <TreeRows nodes={dre.revenueTree} />
                    </TableBody>
                </Table>
            </section>

            <section className="space-y-2">
                <h2 className="font-display text-lg font-semibold">Despesas por conta</h2>
                <Table>
                    <TableBody>
                        <TreeRows nodes={dre.expenseTree} />
                    </TableBody>
                </Table>
            </section>

            {dre.unclassified.length > 0 && (
                <section className="space-y-2">
                    <h2 className="font-display text-lg font-semibold">
                        Contas sem categoria de DRE
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Estas contas têm movimento, mas não entram nas linhas acima até receberem
                        categoria.
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
