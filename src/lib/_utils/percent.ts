/** Converte um percentual inteiro digitado (0 a 100) na fração da api-kontal (0 a 1); null se inválido. */
export function percentToFraction(input: string): number | null {
    const text = input.trim();
    if (!/^\d{1,3}$/.test(text)) return null;
    const percent = Number(text);
    return percent <= 100 ? percent / 100 : null;
}

/** Converte a fração da api-kontal (0 a 1) no percentual inteiro exibido. */
export function fractionToPercent(fraction: number): number {
    return Math.round(fraction * 100);
}
