import { describe, expect, it } from 'vitest';
import { currentMonthRange } from './dates';

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
