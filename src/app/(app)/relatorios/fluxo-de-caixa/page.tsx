import { DropdownSelect } from '@/lib/_components/dropdown-select';
import { FILTER_PILL_CLASS, FilterField } from '@/lib/_components/filter-field';
import { ReportPage } from '@/lib/_components/reports/report-page';
import type { ReportSection } from '@/lib/_components/reports/report-types';
import { formatMonth, parsePeriodParams } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import { PAYMENT_METHOD_LABELS, formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { cashFlowSchema } from '@/lib/api/schemas/reports';
import { ReportFilters } from '../_components/report-filters';
import { periodLabel } from '../_components/report-rows';

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

    const flowColumns = [
        { label: 'Entradas', align: 'right' as const },
        { label: 'Saídas', align: 'right' as const },
        { label: 'Líquido', align: 'right' as const },
    ];

    const sections: ReportSection[] = [
        {
            note: `Entradas ${formatAmount(flow.totals.inflows)} · Saídas ${formatAmount(flow.totals.outflows)} · Líquido ${formatAmount(flow.totals.net)}`,
            title: 'Por conta financeira',
            columns: [{ label: 'Conta' }, ...flowColumns],
            rows: flow.accounts.map(account => ({
                cells: [
                    `${account.code} ${account.name}`,
                    formatAmount(account.inflows),
                    formatAmount(account.outflows),
                    formatAmount(account.net),
                ],
            })),
        },
        ...(flow.months
            ? [
                  {
                      title: 'Por mês',
                      columns: [{ label: 'Mês' }, ...flowColumns],
                      rows: flow.months.map(month => ({
                          cells: [
                              formatMonth(month.month),
                              formatAmount(month.inflows),
                              formatAmount(month.outflows),
                              formatAmount(month.net),
                          ],
                      })),
                  },
              ]
            : []),
        ...(flow.days ?? []).map(day => ({
            title: `${formatDate(day.date)} · Líquido ${formatAmount(day.net)}`,
            columns: [
                { label: 'Título' },
                { label: 'Forma' },
                { label: 'Conta' },
                { label: 'Valor', align: 'right' as const },
            ],
            rows: day.payments.map(payment => ({
                cells: [
                    payment.titleDescription ?? '—',
                    payment.paymentMethod
                        ? (PAYMENT_METHOD_LABELS[
                              payment.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS
                          ] ?? payment.paymentMethod)
                        : '—',
                    `${payment.accountCode} ${payment.accountName}`,
                    formatAmount(payment.amount),
                ],
                tone: payment.type === 'INCOME' ? ('positive' as const) : ('negative' as const),
            })),
        })),
    ];

    return (
        <ReportPage
            subtitle="Entradas e saídas de caixa do período, por conta financeira"
            report={{
                title: 'Fluxo de caixa',
                period: periodLabel(start, end, formatDate),
                filename: `fluxo-de-caixa-${start}-a-${end}`,
                sections,
            }}
            filters={
                <ReportFilters mode="period" start={start} end={end}>
                    <FilterField label="Agrupar">
                        <DropdownSelect
                            name="groupBy"
                            defaultValue={groupBy ?? ''}
                            className={`${FILTER_PILL_CLASS} w-40`}
                            options={[
                                { value: '', label: 'Sem agrupamento' },
                                ...Object.entries(GROUPS).map(([value, label]) => ({
                                    value,
                                    label,
                                })),
                            ]}
                        />
                    </FilterField>
                </ReportFilters>
            }
        />
    );
}
