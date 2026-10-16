import { DropdownSelect } from '@/lib/_components/dropdown-select';
import { FILTER_PILL_CLASS, FilterField } from '@/lib/_components/filter-field';
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
import { PAYMENT_METHOD_LABELS, formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { cashFlowSchema } from '@/lib/api/schemas/reports';
import { ReportFilters } from '../_components/report-filters';

const GROUPS = { month: 'Por mês', day: 'Por dia' } as const;

export default async function CashFlowPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const query = await searchParams;
    const { start, end } = parsePeriodParams(query, new Date());
    const rawGroup = Array.isArray(query.groupBy) ? query.groupBy[0] : query.groupBy;
    const groupBy = rawGroup === 'month' || rawGroup === 'day' ? rawGroup : undefined;

    const params = new URLSearchParams({ start, end });
    if (groupBy) params.set('groupBy', groupBy);
    const flow = await apiFetch(`/reports/cash-flow?${params}`, cashFlowSchema);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Fluxo de caixa</h1>
            <ReportFilters mode="period" start={start} end={end}>
                <FilterField label="Agrupar">
                    <DropdownSelect
                        name="groupBy"
                        defaultValue={groupBy ?? ''}
                        className={`${FILTER_PILL_CLASS} w-40`}
                        options={[
                            { value: '', label: 'Sem agrupamento' },
                            ...Object.entries(GROUPS).map(([value, label]) => ({ value, label })),
                        ]}
                    />
                </FilterField>
            </ReportFilters>

            <p className="text-sm">
                Entradas{' '}
                <span className="text-positive font-semibold">
                    {formatAmount(flow.totals.inflows)}
                </span>{' '}
                · Saídas{' '}
                <span className="text-negative font-semibold">
                    {formatAmount(flow.totals.outflows)}
                </span>{' '}
                · Líquido <span className="font-semibold">{formatAmount(flow.totals.net)}</span>
            </p>

            <section className="space-y-2">
                <h2 className="font-display text-lg font-semibold">Por conta financeira</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Conta</TableHead>
                            <TableHead className="text-right">Entradas</TableHead>
                            <TableHead className="text-right">Saídas</TableHead>
                            <TableHead className="text-right">Líquido</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {flow.accounts.map(account => (
                            <TableRow key={account.accountId}>
                                <TableCell>
                                    <span className="font-mono text-sm">{account.code}</span>{' '}
                                    {account.name}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatAmount(account.inflows)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatAmount(account.outflows)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatAmount(account.net)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>

            {flow.months && (
                <section className="space-y-2">
                    <h2 className="font-display text-lg font-semibold">Por mês</h2>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mês</TableHead>
                                <TableHead className="text-right">Entradas</TableHead>
                                <TableHead className="text-right">Saídas</TableHead>
                                <TableHead className="text-right">Líquido</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {flow.months.map(month => (
                                <TableRow key={month.month}>
                                    <TableCell>{formatMonth(month.month)}</TableCell>
                                    <TableCell className="text-right">
                                        {formatAmount(month.inflows)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatAmount(month.outflows)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatAmount(month.net)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            )}

            {flow.days?.map(day => (
                <section key={day.date} className="space-y-2">
                    <h2 className="font-display text-lg font-semibold">
                        {formatDate(day.date)} · Líquido {formatAmount(day.net)}
                    </h2>
                    <Table>
                        <TableBody>
                            {day.payments.map(payment => (
                                <TableRow key={payment.entryId}>
                                    <TableCell>{payment.titleDescription}</TableCell>
                                    <TableCell>
                                        {payment.paymentMethod
                                            ? (PAYMENT_METHOD_LABELS[
                                                  payment.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS
                                              ] ?? payment.paymentMethod)
                                            : '—'}
                                    </TableCell>
                                    <TableCell>
                                        {payment.accountCode} {payment.accountName}
                                    </TableCell>
                                    <TableCell
                                        className={
                                            payment.type === 'INCOME'
                                                ? 'text-positive text-right'
                                                : 'text-negative text-right'
                                        }
                                    >
                                        {formatAmount(payment.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            ))}
        </div>
    );
}
