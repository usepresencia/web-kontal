import { amountToCents } from './money';

const ZERO = BigInt(0);
const HUNDRED = BigInt(100);
const TEN_THOUSAND = BigInt(10_000);

/** Variação percentual inteira entre dois valores da API; null quando o anterior é zero. */
export function percentChange(current: string, previous: string): number | null {
    const before = amountToCents(previous);
    if (before === ZERO) return null;
    const diff = amountToCents(current) - before;
    const absolute = before < ZERO ? -before : before;
    return Math.round(Number((diff * TEN_THOUSAND) / absolute) / 100);
}

/** Participação de cada valor no total, em percentuais inteiros que somam 100; null sem movimento. */
export function shareOfTotal(
    first: string,
    second: string,
): { first: number; second: number } | null {
    const a = amountToCents(first);
    const b = amountToCents(second);
    const total = a + b;
    if (total <= ZERO) return null;
    const firstShare = Math.round(Number((a * HUNDRED * HUNDRED) / total) / 100);
    return { first: firstShare, second: 100 - firstShare };
}

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Indica se o texto contém a busca, sem diferenciar maiúsculas nem acentos; busca vazia aceita tudo. */
export function matchesQuery(text: string, query: string): boolean {
    const needle = normalize(query).trim();
    return needle === '' || normalize(text).includes(needle);
}
