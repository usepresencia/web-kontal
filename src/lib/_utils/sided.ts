import { formatAmount } from '@/lib/_utils/money';

/** Saldo com o lado ao final: "R$ 10,00 D" ou "R$ 10,00 C". */
export function formatSided(balance: { amount: string; side: string }): string {
    return `${formatAmount(balance.amount)} ${balance.side}`;
}
