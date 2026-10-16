import type { ReportSection } from '@/lib/_components/reports/report-types';
import { formatAmount } from '@/lib/_utils/money';
import { formatSided } from '@/lib/_utils/sided';
import { formatDate } from '@/lib/_utils/title-labels';
import type { AccountLedger, DailyJournal } from '@/lib/api/schemas/reports';

/** Um bloco por dia do livro diário, com os lançamentos e as linhas de débito e crédito. */
export function journalSections(days: DailyJournal['items']): ReportSection[] {
    return days.map(day => ({
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
}

/** Bloco do razão de uma conta: saldos inicial e final e a movimentação. */
export function ledgerSections(
    ledger: Pick<AccountLedger, 'account' | 'openingBalance' | 'closingBalance' | 'items'>,
): ReportSection[] {
    return [
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
    ];
}
