import { TableCell, TableRow } from '@/lib/_components/ui/table';
import { formatAmount } from '@/lib/_utils/money';
import type { AccountTreeNode } from '@/lib/api/schemas/reports';

/** Linhas da árvore de contas, indentadas pelo nível; contas sintéticas em destaque. */
export function TreeRows({ nodes }: { nodes: AccountTreeNode[] }) {
    return nodes.map(node => <TreeRow key={node.id} node={node} />);
}

function TreeRow({ node }: { node: AccountTreeNode }) {
    return (
        <>
            <TableRow>
                <TableCell className="font-mono text-sm">{node.code}</TableCell>
                <TableCell className={node.accountType === 'SYNTHETIC' ? 'font-semibold' : ''}>
                    <span style={{ paddingLeft: `${(node.level - 1) * 16}px` }}>{node.name}</span>
                </TableCell>
                <TableCell className="text-right">{formatAmount(node.amount)}</TableCell>
            </TableRow>
            <TreeRows nodes={node.children} />
        </>
    );
}
