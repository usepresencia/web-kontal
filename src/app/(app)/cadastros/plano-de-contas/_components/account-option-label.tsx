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
