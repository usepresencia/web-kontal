import { describe, expect, it } from 'vitest';
import { formatMoney } from './money';

describe('formatMoney', () => {
    it('formata centavos em reais', () => {
        expect(formatMoney('123456')).toBe('R$ 1.234,56');
    });

    it('formata zero e valores abaixo de um real', () => {
        expect(formatMoney('0')).toBe('R$ 0,00');
        expect(formatMoney('5')).toBe('R$ 0,05');
    });

    it('formata valores negativos', () => {
        expect(formatMoney('-50')).toBe('-R$ 0,50');
        expect(formatMoney('-123456')).toBe('-R$ 1.234,56');
    });

    it('não perde precisão acima do inteiro seguro', () => {
        expect(formatMoney('999999999999999999')).toBe('R$ 9.999.999.999.999.999,99');
    });

    it.each(['', 'abc', '12.5', '1e3', ' 10', '--5'])('rejeita "%s"', value => {
        expect(() => formatMoney(value)).toThrow();
    });
});
