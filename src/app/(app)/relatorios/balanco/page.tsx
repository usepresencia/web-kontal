import { ReportPage } from '@/lib/_components/reports/report-page';
import type { ReportSection } from '@/lib/_components/reports/report-types';
import { parseIsoDate } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import { formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { balanceSheetSchema, type AccountTreeNode } from '@/lib/api/schemas/reports';
import { ReportFilters } from '../_components/report-filters';
import { treeToRows } from '../_components/report-rows';

const group = (title: string, tree: AccountTreeNode[], total: string): ReportSection => ({
    title,
    columns: [{ label: 'Conta' }, { label: 'Saldo', align: 'right' }],
    rows: [...treeToRows(tree), { cells: ['Total', formatAmount(total)], kind: 'total' }],
});

export default async function BalanceSheetPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const query = await searchParams;
    const date = parseIsoDate(query.date) ?? new Date().toISOString().slice(0, 10);
    const sheet = await apiFetch(`/reports/balance-sheet?date=${date}`, balanceSheetSchema);

    const sections: ReportSection[] = [
        group(
            `Ativo circulante · Ativo ${formatAmount(sheet.assets.total)}`,
            sheet.assets.current.tree,
            sheet.assets.current.total,
        ),
        group('Ativo não circulante', sheet.assets.nonCurrent.tree, sheet.assets.nonCurrent.total),
        group(
            `Passivo circulante · Passivo e patrimônio líquido ${formatAmount(sheet.liabilitiesAndEquity)}`,
            sheet.liabilities.current.tree,
            sheet.liabilities.current.total,
        ),
        group(
            'Passivo não circulante',
            sheet.liabilities.nonCurrent.tree,
            sheet.liabilities.nonCurrent.total,
        ),
        {
            ...group('Patrimônio líquido', sheet.equity.accounts.tree, sheet.equity.total),
            note: `Resultado acumulado: ${formatAmount(sheet.equity.accumulatedResult)}`,
        },
    ];

    return (
        <ReportPage
            subtitle="Posição patrimonial da empresa em uma data: ativo, passivo e patrimônio líquido"
            report={{
                title: 'Balanço patrimonial',
                period: `Posição em ${formatDate(date)}`,
                filename: `balanco-${date}`,
                sections,
            }}
            filters={<ReportFilters mode="date" end={date} />}
        />
    );
}
