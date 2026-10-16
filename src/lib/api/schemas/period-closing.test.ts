import { describe, expect, it } from 'vitest';
import { closePeriodSchema } from './period-closing';

describe('closePeriodSchema', () => {
    it('aceita o mês e ignora a conta vazia', () => {
        expect(
            closePeriodSchema.parse({ month: '2026-10', retainedEarningsAccountId: '' }),
        ).toEqual({
            month: '2026-10',
            retainedEarningsAccountId: undefined,
        });
    });

    it.each(['2026-13', '2026-00', '10/2026', '2026-1', ''])('recusa o mês %j', month => {
        expect(closePeriodSchema.safeParse({ month }).success).toBe(false);
    });

    it('recusa conta que não é UUID', () => {
        expect(
            closePeriodSchema.safeParse({ month: '2026-10', retainedEarningsAccountId: 'x' })
                .success,
        ).toBe(false);
    });
});
