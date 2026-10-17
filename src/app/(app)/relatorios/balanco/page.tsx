import { Table, TableBody, TableCell, TableRow } from '@/lib/_components/ui/table';
import { parseIsoDate } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import { apiFetch } from '@/lib/api/client';
import { balanceSheetSchema, type AccountTreeNode } from '@/lib/api/schemas/reports';
import { ReportFilters } from '../_components/report-filters';
import { TreeRows } from '../_components/tree-rows';

function Group({ title, tree, total }: { title: string; tree: AccountTreeNode[]; total: string }) {
    return (
        <section className="space-y-2">
            <h3 className="font-display font-semibold">{title}</h3>
            <Table>
                <TableBody>
                    <TreeRows nodes={tree} />
                    <TableRow className="bg-muted font-semibold">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right">{formatAmount(total)}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </section>
    );
}

export default async function BalanceSheetPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const query = await searchParams;
    const date = parseIsoDate(query.date) ?? new Date().toISOString().slice(0, 10);
    const sheet = await apiFetch(`/reports/balance-sheet?date=${date}`, balanceSheetSchema);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Balanço patrimonial</h1>
            <ReportFilters mode="date" end={date} />

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                    <h2 className="font-display text-xl font-semibold">
                        Ativo · {formatAmount(sheet.assets.total)}
                    </h2>
                    <Group
                        title="Circulante"
                        tree={sheet.assets.current.tree}
                        total={sheet.assets.current.total}
                    />
                    <Group
                        title="Não circulante"
                        tree={sheet.assets.nonCurrent.tree}
                        total={sheet.assets.nonCurrent.total}
                    />
                </div>
                <div className="space-y-6">
                    <h2 className="font-display text-xl font-semibold">
                        Passivo e patrimônio líquido · {formatAmount(sheet.liabilitiesAndEquity)}
                    </h2>
                    <Group
                        title="Passivo circulante"
                        tree={sheet.liabilities.current.tree}
                        total={sheet.liabilities.current.total}
                    />
                    <Group
                        title="Passivo não circulante"
                        tree={sheet.liabilities.nonCurrent.tree}
                        total={sheet.liabilities.nonCurrent.total}
                    />
                    <Group
                        title="Patrimônio líquido"
                        tree={sheet.equity.accounts.tree}
                        total={sheet.equity.total}
                    />
                    <p className="text-muted-foreground text-sm">
                        Resultado acumulado: {formatAmount(sheet.equity.accumulatedResult)}
                    </p>
                </div>
            </div>
        </div>
    );
}
