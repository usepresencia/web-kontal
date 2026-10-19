import { ReportPage } from '@/lib/_components/reports/report-page';
import type { ReportSection } from '@/lib/_components/reports/report-types';
import { parsePeriodParams } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import { formatSided } from '@/lib/_utils/sided';
import { formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { trialBalanceSchema } from '@/lib/api/schemas/reports';
import { ReportFilters } from '../_components/report-filters';
import { periodLabel } from '../_components/report-rows';

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

    const sections: ReportSection[] = [
        {
            columns: [
                { label: 'Conta' },
                { label: 'Saldo inicial', align: 'right' },
                { label: 'Débitos', align: 'right' },
                { label: 'Créditos', align: 'right' },
                { label: 'Saldo final', align: 'right' },
            ],
            rows: [
                ...report.lines.map(line => ({
                    cells: [
                        `${line.code} ${line.name}`,
                        formatSided(line.openingBalance),
                        formatAmount(line.debits),
                        formatAmount(line.credits),
                        formatSided(line.closingBalance),
                    ],
                    kind: line.accountType === 'SYNTHETIC' ? ('group' as const) : undefined,
                    indent: line.level - 1,
                })),
                {
                    cells: [
                        'Totais',
                        '',
                        formatAmount(report.totals.debits),
                        formatAmount(report.totals.credits),
                        '',
                    ],
                    kind: 'total' as const,
                },
            ],
        },
    ];

    return (
        <ReportPage
            subtitle="Saldos, débitos e créditos de cada conta no período"
            report={{
                title: 'Balancete',
                period: periodLabel(start, end, formatDate),
                filename: `balancete-${start}-a-${end}`,
                sections,
            }}
            filters={<ReportFilters mode="period" start={start} end={end} />}
        />
    );
}
