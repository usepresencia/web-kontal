import { describe, expect, it } from 'vitest';
import {
    currentMonthRange,
    daysAgoLabel,
    dueLabel,
    formatMonth,
    isoToLocalDate,
    monthAbbreviation,
    nextMonth,
    parseIsoDate,
    parsePeriodParams,
    previousMonthRange,
    toLocalIsoDate,
    transactionDate,
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

describe('dueLabel', () => {
    const now = new Date(2026, 9, 15, 20, 0);

    it.each([
        ['2026-10-15', 'vence hoje'],
        ['2026-10-16', 'vence amanhã'],
        ['2026-10-25', 'vence em 10d'],
        ['2026-10-14', 'venceu ontem'],
        ['2026-10-05', 'venceu há 10d'],
    ])('%s é "%s"', (iso, expected) => {
        expect(dueLabel(iso, now)).toBe(expected);
    });
});

describe('daysAgoLabel', () => {
    const now = new Date(2026, 9, 15, 20, 0);

    it.each([
        ['2026-10-15T08:00:00.000Z', 'hoje'],
        ['2026-10-14T23:00:00.000Z', 'ontem'],
        ['2026-10-13T10:00:00.000Z', '2d atrás'],
        ['2026-06-17T10:00:00.000Z', '120d atrás'],
    ])('%s é "%s"', (iso, expected) => {
        expect(daysAgoLabel(iso, now)).toBe(expected);
    });

    it('trata data futura como hoje', () => {
        expect(daysAgoLabel('2026-11-01T00:00:00.000Z', now)).toBe('hoje');
    });
});

describe('previousMonthRange', () => {
    it('devolve o mês anterior', () => {
        expect(previousMonthRange(new Date(2026, 9, 16))).toEqual({
            start: '2026-09-01',
            end: '2026-09-30',
        });
    });

    it('vira o ano em janeiro', () => {
        expect(previousMonthRange(new Date(2027, 0, 5))).toEqual({
            start: '2026-12-01',
            end: '2026-12-31',
        });
    });
});

describe('monthAbbreviation', () => {
    it('abrevia o mês em minúsculas, a partir de 0', () => {
        expect(monthAbbreviation(0)).toBe('jan');
        expect(monthAbbreviation(8)).toBe('set');
        expect(monthAbbreviation(11)).toBe('dez');
    });
});

describe('toLocalIsoDate', () => {
    it('usa o dia local, não o UTC', () => {
        // 23:30 locais: em UTC já seria o dia seguinte em fusos a oeste de Greenwich.
        expect(toLocalIsoDate(new Date(2026, 9, 16, 23, 30))).toBe('2026-10-16');
        expect(toLocalIsoDate(new Date(2026, 0, 5, 0, 10))).toBe('2026-01-05');
    });
});

describe('isoToLocalDate', () => {
    it('cria a data no fuso local, sem recuar um dia', () => {
        const date = isoToLocalDate('2026-10-16');
        expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 9, 16]);
        expect(toLocalIsoDate(date)).toBe('2026-10-16');
    });
});

describe('transactionDate', () => {
    it('usa a data de emissão do título', () => {
        expect(transactionDate({ issueDate: '2026-10-16' })).toBe('2026-10-16');
    });

    it('usa a data de implantação quando o título é de saldo inicial', () => {
        expect(transactionDate({ issueDate: '2026-10-16', openingDate: '2026-01-01' })).toBe(
            '2026-01-01',
        );
    });

    it('ignora a data de implantação nula', () => {
        expect(transactionDate({ issueDate: '2026-10-16', openingDate: null })).toBe('2026-10-16');
    });
});
