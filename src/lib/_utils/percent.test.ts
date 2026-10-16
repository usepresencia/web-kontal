import { describe, expect, it } from 'vitest';
import { fractionToPercent, percentToFraction } from './percent';

describe('percentToFraction', () => {
    it.each([
        ['0', 0],
        ['2', 0.02],
        ['7', 0.07],
        ['33', 0.33],
        ['100', 1],
    ])('%s%% vira %d', (input, expected) => {
        expect(percentToFraction(input)).toBe(expected);
    });

    it.each(['', '  ', '-1', '101', '2,5', '2.5', 'abc', '1e2', '٣'])('recusa "%s"', input => {
        expect(percentToFraction(input)).toBeNull();
    });
});

describe('fractionToPercent', () => {
    it('devolve o percentual inteiro, sem erro de ponto flutuante', () => {
        expect(fractionToPercent(0.07)).toBe(7);
        expect(fractionToPercent(0.29)).toBe(29);
        expect(fractionToPercent(1)).toBe(100);
        expect(fractionToPercent(0)).toBe(0);
    });
});
