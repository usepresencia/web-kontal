import { describe, expect, it } from 'vitest';
import { matchesQuery, percentChange, shareOfTotal } from './kpi';

describe('percentChange', () => {
    it.each([
        ['112.00', '100.00', 12],
        ['92.00', '100.00', -8],
        ['100.00', '100.00', 0],
        ['50.00', '-100.00', 150],
        ['-50.00', '-100.00', 50],
        ['3830.50', '3420.00', 12],
    ])('de %s para %s: %i%%', (current, previous, expected) => {
        expect(percentChange(current, previous)).toBe(expected);
    });

    it('não calcula quando o mês anterior é zero', () => {
        expect(percentChange('10.00', '0.00')).toBeNull();
    });
});

describe('shareOfTotal', () => {
    it('divide o total entre receitas e despesas em percentuais inteiros que somam 100', () => {
        expect(shareOfTotal('3830.50', '4702.90')).toEqual({ first: 45, second: 55 });
        expect(shareOfTotal('100.00', '100.00')).toEqual({ first: 50, second: 50 });
        expect(shareOfTotal('1.00', '2.00')).toEqual({ first: 33, second: 67 });
    });

    it('devolve null quando não há movimento', () => {
        expect(shareOfTotal('0.00', '0.00')).toBeNull();
    });

    it('trata o lado sem movimento como 0% e 100%', () => {
        expect(shareOfTotal('0.00', '10.00')).toEqual({ first: 0, second: 100 });
    });
});

describe('matchesQuery', () => {
    it.each([
        ['Conta de energia', 'ENERGIA', true],
        ['Venda de bolos', 'bolos', true],
        ['Encomenda buffet', 'comenda', true],
        ['Balcão', 'balcao', true],
        ['Aluguel', 'energia', false],
        ['Aluguel', '', true],
        ['Aluguel', '   ', true],
    ])('"%s" com "%s": %s', (text, query, expected) => {
        expect(matchesQuery(text, query)).toBe(expected);
    });
});
