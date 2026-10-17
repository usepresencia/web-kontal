import { describe, expect, it } from 'vitest';
import { formatAmount, formatMoney, toApiAmount } from './money';

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

describe('formatAmount', () => {
    it('formata o valor decimal que a api-kontal envia', () => {
        expect(formatAmount('1234.50')).toBe('R$ 1.234,50');
        expect(formatAmount('0.05')).toBe('R$ 0,05');
        expect(formatAmount('-1234.56')).toBe('-R$ 1.234,56');
    });

    it('não perde precisão em valores grandes', () => {
        expect(formatAmount('9999999999999999.99')).toBe('R$ 9.999.999.999.999.999,99');
    });

    it.each(['', '12', '12.5', '12.345', 'abc', '1,50', '--1.00'])('rejeita "%s"', value => {
        expect(() => formatAmount(value)).toThrow();
    });
});

describe('toApiAmount', () => {
    it.each([
        ['1234.50', '1234.50'],
        ['1234,5', '1234.50'],
        ['1.234,50', '1234.50'],
        ['R$ 1.234,50', '1234.50'],
        ['  10  ', '10.00'],
        ['0,05', '0.05'],
        ['0.5', '0.50'],
        ['1.000', '1000.00'],
        ['1.234.567,89', '1234567.89'],
        ['9999999999.99', '9999999999.99'],
    ])('converte "%s" em "%s"', (input, expected) => {
        expect(toApiAmount(input)).toBe(expected);
    });

    it.each(['', 'abc', '-5', '1,234', '1.2.3', '10,5,5', '12345678901', '1e3', 'R$', ',50'])(
        'recusa "%s"',
        input => {
            expect(toApiAmount(input)).toBeNull();
        },
    );
});
