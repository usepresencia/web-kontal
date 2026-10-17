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
import { trialBalanceSchema } from '@/lib/api/schemas/reports';
import { ReportFilters } from '../_components/report-filters';
import { formatSided } from '../_components/sided';

export default async function TrialBalancePage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { start, end } = parsePeriodParams(await searchParams, new Date());
    const report = await apiFetch(
        `/reports/trial-balance?start=${start}&end=${end}`,
        trialBalanceSchema,
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Balancete</h1>
            <ReportFilters mode="period" start={start} end={end} />

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead className="text-right">Saldo inicial</TableHead>
                        <TableHead className="text-right">Débitos</TableHead>
                        <TableHead className="text-right">Créditos</TableHead>
                        <TableHead className="text-right">Saldo final</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {report.lines.map(line => (
                        <TableRow key={line.accountId}>
                            <TableCell className="font-mono text-sm">{line.code}</TableCell>
                            <TableCell
                                className={line.accountType === 'SYNTHETIC' ? 'font-semibold' : ''}
                            >
                                <span style={{ paddingLeft: `${(line.level - 1) * 16}px` }}>
                                    {line.name}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                {formatSided(line.openingBalance)}
                            </TableCell>
                            <TableCell className="text-right">
                                {formatAmount(line.debits)}
                            </TableCell>
                            <TableCell className="text-right">
                                {formatAmount(line.credits)}
                            </TableCell>
                            <TableCell className="text-right">
                                {formatSided(line.closingBalance)}
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow className="bg-muted font-semibold">
                        <TableCell colSpan={3}>Totais</TableCell>
                        <TableCell className="text-right">
                            {formatAmount(report.totals.debits)}
                        </TableCell>
                        <TableCell className="text-right">
                            {formatAmount(report.totals.credits)}
                        </TableCell>
                        <TableCell />
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}
