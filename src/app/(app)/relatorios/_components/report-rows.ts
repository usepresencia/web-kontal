import type { ReportRow } from '@/lib/_components/reports/report-types';
import { formatAmount } from '@/lib/_utils/money';
import type { AccountTreeNode } from '@/lib/api/schemas/reports';

/** Árvore de contas em linhas "código nome" + valor, recuadas pelo nível; sintéticas em destaque. */
export function treeToRows(nodes: AccountTreeNode[]): ReportRow[] {
    return nodes.flatMap(node => [
        {
            cells: [`${node.code} ${node.name}`, formatAmount(node.amount)],
            kind: node.accountType === 'SYNTHETIC' ? ('group' as const) : undefined,
            indent: node.level - 1,
        },
        ...treeToRows(node.children),
    ]);
}

/** Período no formato "01/10/2026 a 31/10/2026". */
export const periodLabel = (start: string, end: string, format: (iso: string) => string) =>
    `${format(start)} a ${format(end)}`;
