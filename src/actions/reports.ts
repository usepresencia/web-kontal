'use server';

import type { ReportDocument } from '@/lib/_components/reports/report-types';
import { parseIsoDate } from '@/lib/_utils/dates';
import { journalSections, ledgerSections } from '@/lib/_utils/report-builders';
import { formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { accountLedgerSchema, dailyJournalSchema } from '@/lib/api/schemas/reports';
import { z } from 'zod';

/** Limite de páginas buscadas por PDF, para um período enorme não prender o servidor. */
const MAX_PAGES = 200;
const JOURNAL_PAGE_SIZE = 31;
const LEDGER_PAGE_SIZE = 100;

const period = (start: string, end: string) => `${formatDate(start)} a ${formatDate(end)}`;

/** Livro diário completo do período (todas as páginas), para o PDF. */
export async function getFullJournalReportAction(
    start: string,
    end: string,
): Promise<ReportDocument | null> {
    const from = parseIsoDate(start);
    const to = parseIsoDate(end);
    if (!from || !to) return null;

    const days: Awaited<ReturnType<typeof fetchJournalPage>>['items'] = [];
    for (let page = 1; page <= MAX_PAGES; page += 1) {
        const result = await fetchJournalPage(from, to, page);
        days.push(...result.items);
        if (days.length >= result.total || result.items.length === 0) break;
    }
    return {
        title: 'Livro diário',
        period: period(from, to),
        filename: `livro-diario-${from}-a-${to}`,
        sections: journalSections(days),
    };
}

const fetchJournalPage = (start: string, end: string, page: number) =>
    apiFetch(
        `/reports/daily-journal?start=${start}&end=${end}&page=${page}&pageSize=${JOURNAL_PAGE_SIZE}`,
        dailyJournalSchema,
    );

/** Razão completo de uma conta no período (todas as páginas), para o PDF. */
export async function getFullLedgerReportAction(
    accountId: string,
    start: string,
    end: string,
): Promise<ReportDocument | null> {
    const from = parseIsoDate(start);
    const to = parseIsoDate(end);
    if (!from || !to || !z.uuid().safeParse(accountId).success) return null;

    let first: Awaited<ReturnType<typeof fetchLedgerPage>> | null = null;
    const items: Awaited<ReturnType<typeof fetchLedgerPage>>['items'] = [];
    for (let page = 1; page <= MAX_PAGES; page += 1) {
        const result = await fetchLedgerPage(accountId, from, to, page);
        first ??= result;
        items.push(...result.items);
        if (items.length >= result.total || result.items.length === 0) break;
    }
    if (!first) return null;
    return {
        title: 'Razão da conta',
        period: period(from, to),
        filename: `razao-${from}-a-${to}`,
        sections: ledgerSections({ ...first, items }),
    };
}

const fetchLedgerPage = (accountId: string, start: string, end: string, page: number) =>
    apiFetch(
        `/reports/account-ledger?accountId=${accountId}&start=${start}&end=${end}&page=${page}&pageSize=${LEDGER_PAGE_SIZE}`,
        accountLedgerSchema,
    );
