import type { BillingAccount } from '@/lib/api/schemas/billing';

/**
 * Código + nome da conta, com o código em largura fixa para o nome alinhar nas opções do
 * select, e recuado conforme o nível na árvore do plano de contas (mesmo passo da listagem).
 */
export function accountOptionLabel(account: Pick<BillingAccount, 'code' | 'name' | 'level'>) {
    const indentPx = Math.max(0, account.level - 1) * 20;
    return (
        <span className="flex min-w-0 items-center gap-2" style={{ paddingLeft: indentPx }}>
            <span className="w-16 shrink-0 font-mono text-xs tabular-nums">{account.code}</span>
            <span className="truncate">{account.name}</span>
        </span>
    );
}
