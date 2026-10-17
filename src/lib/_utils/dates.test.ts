import { describe, expect, it } from 'vitest';
import {
    currentMonthRange,
    formatMonth,
    nextMonth,
    parseIsoDate,
    parsePeriodParams,
} from './dates';

describe('currentMonthRange', () => {
    it('devolve o primeiro e o último dia do mês', () => {
        expect(currentMonthRange(new Date(2026, 9, 15))).toEqual({
            start: '2026-10-01',
            end: '2026-10-31',
        });
    });

    it('trata fevereiro de ano bissexto', () => {
        expect(currentMonthRange(new Date(2028, 1, 10))).toEqual({
            start: '2028-02-01',
            end: '2028-02-29',
        });
    });

    it('trata dezembro', () => {
        expect(currentMonthRange(new Date(2026, 11, 31))).toEqual({
            start: '2026-12-01',
            end: '2026-12-31',
        });
    });
});

describe('parsePeriodParams', () => {
    const now = new Date(2026, 9, 15);

    it('usa o mês corrente quando a query não traz período', () => {
        expect(parsePeriodParams({}, now)).toEqual({ start: '2026-10-01', end: '2026-10-31' });
    });

    it('lê o período da query', () => {
        expect(parsePeriodParams({ start: '2026-01-01', end: '2026-03-31' }, now)).toEqual({
            start: '2026-01-01',
            end: '2026-03-31',
        });
    });

    it.each([
        [{ start: '2026-13-01' }],
        [{ start: '2026-02-30' }],
        [{ start: 'ontem' }],
        [{ end: '31/10/2026' }],
    ])('descarta data inválida %j', query => {
        expect(parsePeriodParams(query, now)).toEqual({ start: '2026-10-01', end: '2026-10-31' });
    });

    it('troca o início e o fim quando vêm invertidos', () => {
        expect(parsePeriodParams({ start: '2026-05-10', end: '2026-05-01' }, now)).toEqual({
            start: '2026-05-01',
            end: '2026-05-10',
        });
    });
});

describe('parseIsoDate', () => {
    it('aceita só datas reais no formato YYYY-MM-DD', () => {
        expect(parseIsoDate('2028-02-29')).toBe('2028-02-29');
        expect(parseIsoDate('2027-02-29')).toBeNull();
        expect(parseIsoDate(undefined)).toBeNull();
        expect(parseIsoDate(['2026-01-01'])).toBe('2026-01-01');
    });
});

describe('nextMonth', () => {
    it.each([
        ['2026-10', '2026-11'],
        ['2026-12', '2027-01'],
        ['2028-02', '2028-03'],
    ])('o mês depois de %s é %s', (month, expected) => {
        expect(nextMonth(month)).toBe(expected);
    });
});

describe('formatMonth', () => {
    it('converte YYYY-MM em MM/YYYY', () => {
        expect(formatMonth('2026-03')).toBe('03/2026');
    });
});
