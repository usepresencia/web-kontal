import { EmptyState } from '@/lib/_components/empty-state';
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
import { formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { dailyJournalSchema } from '@/lib/api/schemas/reports';
import { ReportFilters } from '../_components/report-filters';
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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Livro diário</h1>
            <ReportFilters mode="period" start={start} end={end} />

            {journal.items.length === 0 ? (
                <EmptyState title="Nenhum lançamento no período" />
            ) : (
                journal.items.map(day => (
                    <section key={day.date} className="space-y-3">
                        <h2 className="font-display text-lg font-semibold">
                            {formatDate(day.date)} · Débitos {formatAmount(day.totalDebits)} ·
                            Créditos {formatAmount(day.totalCredits)}
                        </h2>
                        {day.entries.map(entry => (
                            <div key={entry.id} className="border-border rounded-md border">
                                <p className="bg-muted px-3 py-2 text-sm font-medium">
                                    Nº {entry.number} · {entry.description}
                                </p>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Conta</TableHead>
                                            <TableHead className="text-right">Débito</TableHead>
                                            <TableHead className="text-right">Crédito</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {entry.lines.map((line, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <span className="font-mono text-sm">
                                                        {line.accountCode}
                                                    </span>{' '}
                                                    {line.accountName}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatAmount(line.debit)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatAmount(line.credit)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))}
                    </section>
                ))
            )}

            <SimplePagination
                page={journal.page}
                pageSize={journal.pageSize}
                total={journal.total}
            />
        </div>
    );
}
