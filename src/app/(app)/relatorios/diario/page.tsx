import { EmptyState } from '@/lib/_components/empty-state';
import { ReportPage } from '@/lib/_components/reports/report-page';
import type { ReportSection } from '@/lib/_components/reports/report-types';
import { parsePeriodParams } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import { formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { dailyJournalSchema } from '@/lib/api/schemas/reports';
import { ReportFilters } from '../_components/report-filters';
import { periodLabel } from '../_components/report-rows';
import { SimplePagination } from '../_components/simple-pagination';

const PAGE_SIZE = 7;

export default async function DailyJournalPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const query = await searchParams;
    const { start, end } = parsePeriodParams(query, new Date());
    const rawPage = Array.isArray(query.page) ? query.page[0] : query.page;
    const page = rawPage && /^[1-9]\d*$/.test(rawPage) ? Number(rawPage) : 1;

    const journal = await apiFetch(
        `/reports/daily-journal?start=${start}&end=${end}&page=${page}&pageSize=${PAGE_SIZE}`,
        dailyJournalSchema,
    );

    const sections: ReportSection[] = journal.items.map(day => ({
        title: `${formatDate(day.date)} · Débitos ${formatAmount(day.totalDebits)} · Créditos ${formatAmount(day.totalCredits)}`,
        columns: [
            { label: 'Conta' },
            { label: 'Débito', align: 'right' },
            { label: 'Crédito', align: 'right' },
        ],
        rows: day.entries.flatMap(entry => [
            {
                cells: [`Nº ${entry.number} · ${entry.description}`, '', ''],
                kind: 'group' as const,
            },
            ...entry.lines.map(line => ({
                cells: [
                    `${line.accountCode} ${line.accountName}`,
                    formatAmount(line.debit),
                    formatAmount(line.credit),
                ],
                indent: 1,
            })),
        ]),
    }));

    return (
        <ReportPage
            subtitle="Todos os lançamentos do período, dia a dia, com débitos e créditos"
            report={{
                title: 'Livro diário',
                period: periodLabel(start, end, formatDate),
                filename: `livro-diario-${start}-a-${end}-pagina-${journal.page}`,
                sections,
            }}
            filters={<ReportFilters mode="period" start={start} end={end} />}
            empty={<EmptyState title="Nenhum lançamento no período" />}
            footer={
                <SimplePagination
                    page={journal.page}
                    pageSize={journal.pageSize}
                    total={journal.total}
                />
            }
        />
    );
}
