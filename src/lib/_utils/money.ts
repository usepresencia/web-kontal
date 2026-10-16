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

const MAX_INTEGER_DIGITS = 10;

/**
 * Converte o valor digitado ("1.234,50", "R$ 10", "1234.5") no formato da api-kontal ("1234.50").
 * Devolve null quando o texto não é um valor positivo com até 2 casas decimais.
 */
export function toApiAmount(input: string): string | null {
    const cleaned = input.replace(/R\$/g, '').replace(/\s/g, '');
    if (cleaned === '') return null;

    let integer: string;
    let fraction = '';
    if (cleaned.includes(',')) {
        const parts = cleaned.split(',');
        if (parts.length !== 2) return null;
        integer = parts[0].replace(/\./g, '');
        fraction = parts[1];
    } else {
        const dots = cleaned.split('.');
        if (dots.length === 1) {
            integer = cleaned;
        } else if (dots.length === 2 && dots[1].length <= 2) {
            [integer, fraction] = dots;
        } else if (dots.slice(1).every(group => group.length === 3)) {
            integer = dots.join('');
        } else {
            return null;
        }
    }

    if (!/^\d+$/.test(integer) || !/^\d{0,2}$/.test(fraction)) return null;
    if (integer.replace(/^0+(?=\d)/, '').length > MAX_INTEGER_DIGITS) return null;
    return `${integer.replace(/^0+(?=\d)/, '')}.${fraction.padEnd(2, '0')}`;
}

/** Converte o valor da API ("1234.50") em centavos inteiros (BigInt). */
export function amountToCents(amount: string): bigint {
    const match = AMOUNT_PATTERN.exec(amount.includes('.') ? amount : `${amount}.00`);
    if (!match) throw new Error(`Valor monetário inválido: "${amount}"`);
    const [, sign, integer, fraction] = match;
    return BigInt(`${sign}${integer}${fraction}`);
}

/** Converte o valor da API ("890.00") no formato digitado ("890,00"), para preencher um campo. */
export function toInputAmount(amount: string): string {
    return amount.replace('.', ',');
}
