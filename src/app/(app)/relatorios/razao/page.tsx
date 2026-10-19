import { getFullLedgerReportAction } from '@/actions/reports';
import { DropdownSelect } from '@/lib/_components/dropdown-select';
import { EmptyState } from '@/lib/_components/empty-state';
import { FILTER_PILL_CLASS, FilterField } from '@/lib/_components/filter-field';
import { ReportPage } from '@/lib/_components/reports/report-page';
import { parsePeriodParams } from '@/lib/_utils/dates';
import { parsePageParams } from '@/lib/_utils/pagination';
import { ledgerSections } from '@/lib/_utils/report-builders';
import { formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { accountPageSchema } from '@/lib/api/schemas/billing';
import { accountLedgerSchema } from '@/lib/api/schemas/reports';
import { z } from 'zod';
import { ReportFilters } from '../_components/report-filters';
import { periodLabel } from '../_components/report-rows';
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

    const sections = ledger ? ledgerSections(ledger) : [];

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
            loadFullReport={
                accountId.success
                    ? getFullLedgerReportAction.bind(null, accountId.data, start, end)
                    : undefined
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
