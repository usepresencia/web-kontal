const COLOR_FAMILIES =
    'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const UTILITIES = 'bg|text|border|ring|fill|stroke|from|via|to|outline|divide|shadow|accent|caret';

const RULES: RegExp[] = [
    /#[0-9a-fA-F]{3,8}\b/,
    /\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\(/,
    new RegExp(`\\b(?:${UTILITIES})-(?:${COLOR_FAMILIES})-\\d{2,3}\\b`),
    new RegExp(`\\b(?:${UTILITIES})-\\[(?:#|rgb|hsl|oklch)`),
    /\b(?:bg|text|border)-(?:white|black)\b/,
];

export type TokenViolation = { line: number; match: string };

/** Devolve as linhas do código-fonte que usam cor fora dos tokens do tema. */
export function findTokenViolations(source: string): TokenViolation[] {
    const found: TokenViolation[] = [];
    source.split('\n').forEach((text, index) => {
        for (const rule of RULES) {
            const match = text.match(rule);
            if (match) {
                found.push({ line: index + 1, match: match[0] });
                break;
            }
        }
    });
    return found;
}
