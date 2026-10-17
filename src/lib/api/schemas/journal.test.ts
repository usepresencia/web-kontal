import { describe, expect, it } from 'vitest';
import { manualEntrySchema } from './journal';

const A = '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a01';
const B = '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a02';

const entry = (lines: unknown) => ({
    date: '2026-10-15',
    description: 'Ajuste',
    linesJson: JSON.stringify(lines),
});

describe('manualEntrySchema', () => {
    it('aceita lançamento balanceado e normaliza os valores', () => {
        const parsed = manualEntrySchema.parse(
            entry([
                { accountId: A, debit: '1.000,50' },
                { accountId: B, credit: '1000,5', memo: ' nota ' },
            ]),
        );
        expect(parsed.lines).toEqual([
            { accountId: A, debit: '1000.50', credit: undefined, memo: undefined },
            { accountId: B, debit: undefined, credit: '1000.50', memo: 'nota' },
        ]);
    });

    it('recusa débitos diferentes dos créditos', () => {
        const result = manualEntrySchema.safeParse(
            entry([
                { accountId: A, debit: '10' },
                { accountId: B, credit: '9,99' },
            ]),
        );
        expect(result.success).toBe(false);
        if (!result.success)
            expect(result.error.issues[0].message).toBe('Débitos e créditos devem ser iguais');
    });

    it('recusa linha com débito e crédito juntos ou nenhum', () => {
        expect(
            manualEntrySchema.safeParse(
                entry([
                    { accountId: A, debit: '1', credit: '1' },
                    { accountId: B, credit: '1' },
                ]),
            ).success,
        ).toBe(false);
        expect(
            manualEntrySchema.safeParse(entry([{ accountId: A }, { accountId: B, credit: '1' }]))
                .success,
        ).toBe(false);
    });

    it('recusa valor zero e menos de duas linhas', () => {
        expect(
            manualEntrySchema.safeParse(
                entry([
                    { accountId: A, debit: '0' },
                    { accountId: B, credit: '0' },
                ]),
            ).success,
        ).toBe(false);
        expect(manualEntrySchema.safeParse(entry([{ accountId: A, debit: '1' }])).success).toBe(
            false,
        );
    });

    it('recusa JSON inválido e conta que não é UUID', () => {
        expect(
            manualEntrySchema.safeParse({ date: '2026-10-15', description: 'x', linesJson: '{' })
                .success,
        ).toBe(false);
        expect(
            manualEntrySchema.safeParse(
                entry([
                    { accountId: 'x', debit: '1' },
                    { accountId: B, credit: '1' },
                ]),
            ).success,
        ).toBe(false);
    });
});
