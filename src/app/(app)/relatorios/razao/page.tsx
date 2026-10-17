import { DropdownSelect } from '@/lib/_components/dropdown-select';
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
import { parsePageParams } from '@/lib/_utils/pagination';
import { formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { accountPageSchema } from '@/lib/api/schemas/billing';
import { accountLedgerSchema } from '@/lib/api/schemas/reports';
import { z } from 'zod';
import { ReportFilters } from '../_components/report-filters';
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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Razão da conta</h1>
            <ReportFilters mode="period" start={start} end={end}>
                <div className="space-y-1 text-sm">
                    <span className="text-muted-foreground">Conta</span>
                    <DropdownSelect
                        name="accountId"
                        defaultValue={accountId.success ? accountId.data : ''}
                        placeholder="Selecione"
                        className="w-72"
                        options={options.map(account => ({
                            value: account.id,
                            label: `${account.code} ${account.name}`,
                        }))}
                    />
                </div>
            </ReportFilters>

            {!ledger ? (
                <EmptyState
                    title="Escolha uma conta"
                    description="Selecione a conta e o período para ver o razão."
                />
            ) : (
                <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                        {ledger.account.code} {ledger.account.name} · Saldo inicial{' '}
                        {formatSided(ledger.openingBalance)} · Saldo final{' '}
                        {formatSided(ledger.closingBalance)}
                    </p>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Nº</TableHead>
                                <TableHead>Histórico</TableHead>
                                <TableHead className="text-right">Débito</TableHead>
                                <TableHead className="text-right">Crédito</TableHead>
                                <TableHead className="text-right">Saldo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ledger.items.map((item, index) => (
                                <TableRow key={`${item.number}-${index}`}>
                                    <TableCell>{formatDate(item.date)}</TableCell>
                                    <TableCell>{item.number}</TableCell>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">
                                        {formatAmount(item.debit)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatAmount(item.credit)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatSided(item.balance)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <SimplePagination
                        page={ledger.page}
                        pageSize={ledger.pageSize}
                        total={ledger.total}
                    />
                </div>
            )}
        </div>
    );
}
