import { DropdownSelect } from '@/lib/_components/dropdown-select';
import { EmptyState } from '@/lib/_components/empty-state';
import { FILTER_PILL_CLASS, FilterField } from '@/lib/_components/filter-field';
import { ReportPage } from '@/lib/_components/reports/report-page';
import type { ReportSection } from '@/lib/_components/reports/report-types';
import { parsePeriodParams } from '@/lib/_utils/dates';
import { formatAmount } from '@/lib/_utils/money';
import { parsePageParams } from '@/lib/_utils/pagination';
import { formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { accountPageSchema } from '@/lib/api/schemas/billing';
import { accountLedgerSchema } from '@/lib/api/schemas/reports';
import { z } from 'zod';
import { ReportFilters } from '../_components/report-filters';
import { periodLabel } from '../_components/report-rows';
import { formatSided } from '../_components/sided';
import { SimplePagination } from '../_components/simple-pagination';

export default async function AccountLedgerPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const query = await searchParams;
    const { start, end } = parsePeriodParams(query, new Date());
    const { page, pageSize } = parsePageParams(query);
    const accountId = z
        .uuid()
        .safeParse(Array.isArray(query.accountId) ? query.accountId[0] : query.accountId);

    const accounts = await apiFetch('/billing-accounts?page=1&pageSize=100', accountPageSchema);
    const options = accounts.items.filter(
        account => account.accountType === 'ANALYTIC' && account.isActive,
    );
    const ledger = accountId.success
        ? await apiFetch(
              `/reports/account-ledger?accountId=${accountId.data}&start=${start}&end=${end}&page=${page}&pageSize=${pageSize}`,
              accountLedgerSchema,
          )
        : null;

    const sections: ReportSection[] = ledger
        ? [
              {
                  title: `${ledger.account.code} ${ledger.account.name}`,
                  note: `Saldo inicial ${formatSided(ledger.openingBalance)} · Saldo final ${formatSided(ledger.closingBalance)}`,
                  columns: [
                      { label: 'Data' },
                      { label: 'Nº' },
                      { label: 'Histórico' },
                      { label: 'Débito', align: 'right' },
                      { label: 'Crédito', align: 'right' },
                      { label: 'Saldo', align: 'right' },
                  ],
                  rows: ledger.items.map(item => ({
                      cells: [
                          formatDate(item.date),
                          String(item.number),
                          item.description,
                          formatAmount(item.debit),
                          formatAmount(item.credit),
                          formatSided(item.balance),
                      ],
                  })),
              },
          ]
        : [];

    return (
        <ReportPage
            subtitle="Movimentação de uma conta no período, com o saldo a cada lançamento"
            report={{
                title: 'Razão da conta',
                period: periodLabel(start, end, formatDate),
                filename: `razao-${start}-a-${end}`,
                sections,
            }}
            filters={
                <ReportFilters mode="period" start={start} end={end}>
                    <FilterField label="Conta">
                        <DropdownSelect
                            name="accountId"
                            defaultValue={accountId.success ? accountId.data : ''}
                            placeholder="Selecione"
                            className={`${FILTER_PILL_CLASS} w-56`}
                            options={options.map(account => ({
                                value: account.id,
                                label: `${account.code} ${account.name}`,
                            }))}
                        />
                    </FilterField>
                </ReportFilters>
            }
            empty={
                <EmptyState
                    title="Escolha uma conta"
                    description="Selecione a conta e o período para ver o razão."
                />
            }
            footer={
                ledger && (
                    <SimplePagination
                        page={ledger.page}
                        pageSize={ledger.pageSize}
                        total={ledger.total}
                    />
                )
            }
        />
    );
}
