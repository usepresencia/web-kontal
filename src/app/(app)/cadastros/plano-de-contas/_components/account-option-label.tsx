import type { BillingAccount } from '@/lib/api/schemas/billing';

/** Código + nome da conta, com o código em largura fixa para o nome alinhar nas opções do select. */
export function accountOptionLabel(account: Pick<BillingAccount, 'code' | 'name'>) {
    return (
        <span className="flex min-w-0 items-center gap-2">
            <span className="w-16 shrink-0 font-mono text-xs tabular-nums">{account.code}</span>
            <span className="truncate">{account.name}</span>
        </span>
    );
}

/** Recuo (em px) pelo nível da conta na árvore do plano de contas, para usar só na lista aberta. */
export function accountOptionIndent(account: Pick<BillingAccount, 'level'>): number {
    return Math.max(0, account.level - 1) * 20;
}
