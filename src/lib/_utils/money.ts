const ZERO = BigInt(0);
const HUNDRED = BigInt(100);
const CENTS_PATTERN = /^-?\d+$/;

/** Formata centavos (inteiro em string) como moeda brasileira, sem passar por Number. */
export function formatMoney(cents: string): string {
    if (!CENTS_PATTERN.test(cents)) {
        throw new Error(`Valor monetário inválido: "${cents}"`);
    }
    const value = BigInt(cents);
    const negative = value < ZERO;
    const absolute = negative ? -value : value;
    const integer = (absolute / HUNDRED).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const fraction = (absolute % HUNDRED).toString().padStart(2, '0');
    return `${negative ? '-' : ''}R$ ${integer},${fraction}`;
}

const AMOUNT_PATTERN = /^(-?)(\d+)\.(\d{2})$/;

/** Formata o valor decimal em texto ("1234.50") enviado pela api-kontal, sem passar por Number. */
export function formatAmount(amount: string): string {
    const match = AMOUNT_PATTERN.exec(amount);
    if (!match) throw new Error(`Valor monetário inválido: "${amount}"`);
    const [, sign, integer, fraction] = match;
    return formatMoney(`${sign}${integer}${fraction}`);
}
