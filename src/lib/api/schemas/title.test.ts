import { describe, expect, it } from 'vitest';
import {
    entryCreateSchema,
    seriesExtendSchema,
    titleCreateSchema,
    titleUpdateSchema,
} from './title';

const PRESET = '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a5b';

const base = {
    presetId: PRESET,
    type: 'EXPENSE',
    description: ' Aluguel ',
    amount: '1.234,50',
    expirationDate: '2026-11-10',
};

describe('titleCreateSchema', () => {
    it('normaliza o valor e apara a descrição', () => {
        const parsed = titleCreateSchema.parse(base);
        expect(parsed.amount).toBe('1234.50');
        expect(parsed.description).toBe('Aluguel');
        expect(parsed.repeat).toBe('NONE');
    });

    it('lê a taxa com vírgula e recusa fora de 0 a 1', () => {
        expect(
            titleCreateSchema.parse({ ...base, feesPercentageMonthly: '0,02' })
                .feesPercentageMonthly,
        ).toBe(0.02);
        expect(titleCreateSchema.safeParse({ ...base, feesPercentageMonthly: '2' }).success).toBe(
            false,
        );
        expect(
            titleCreateSchema.safeParse({ ...base, feesPercentageMonthly: '0,005' }).success,
        ).toBe(false);
    });

    it('recusa valor inválido e data fora do formato', () => {
        expect(titleCreateSchema.safeParse({ ...base, amount: '12,345' }).success).toBe(false);
        expect(titleCreateSchema.safeParse({ ...base, expirationDate: '10/11/2026' }).success).toBe(
            false,
        );
    });

    it('exige quantidade ou data final, não os dois, quando há repetição', () => {
        const parcelado = { ...base, repeat: 'INSTALLMENT', frequency: 'MONTHLY' };
        expect(titleCreateSchema.safeParse(parcelado).success).toBe(false);
        expect(titleCreateSchema.safeParse({ ...parcelado, count: '3' }).success).toBe(true);
        expect(titleCreateSchema.safeParse({ ...parcelado, until: '2027-01-10' }).success).toBe(
            true,
        );
        expect(
            titleCreateSchema.safeParse({ ...parcelado, count: '3', until: '2027-01-10' }).success,
        ).toBe(false);
    });

    it('exige a frequência na série recorrente', () => {
        expect(
            titleCreateSchema.safeParse({ ...base, repeat: 'RECURRING', frequency: '', count: '3' })
                .success,
        ).toBe(false);
    });
});

describe('titleCreateSchema (implantação e compra de ativo)', () => {
    const ACCOUNT = '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a77';

    it('aceita a conta de destino e a ignora quando vazia', () => {
        expect(
            titleCreateSchema.parse({ ...base, destinationAccountId: ACCOUNT })
                .destinationAccountId,
        ).toBe(ACCOUNT);
        expect(
            titleCreateSchema.parse({ ...base, destinationAccountId: '' }).destinationAccountId,
        ).toBeUndefined();
        expect(titleCreateSchema.safeParse({ ...base, destinationAccountId: 'x' }).success).toBe(
            false,
        );
    });

    it('exige a data de implantação quando o título é de implantação', () => {
        expect(titleCreateSchema.safeParse({ ...base, isOpening: 'true' }).success).toBe(false);
        const ok = titleCreateSchema.parse({
            ...base,
            isOpening: 'true',
            openingDate: '2026-01-01',
            settledAmount: '100,00',
        });
        expect(ok.isOpening).toBe(true);
        expect(ok.settledAmount).toBe('100.00');
    });

    it('recusa implantação combinada com repetição', () => {
        expect(
            titleCreateSchema.safeParse({
                ...base,
                isOpening: 'true',
                openingDate: '2026-01-01',
                repeat: 'INSTALLMENT',
                frequency: 'MONTHLY',
                count: '2',
            }).success,
        ).toBe(false);
    });

    it('trata isOpening ausente como falso', () => {
        expect(titleCreateSchema.parse(base).isOpening).toBe(false);
    });
});

describe('titleUpdateSchema', () => {
    it('exige descrição e vencimento', () => {
        expect(
            titleUpdateSchema.safeParse({ description: '', expirationDate: '2026-11-10' }).success,
        ).toBe(false);
    });
});

describe('entryCreateSchema', () => {
    const entry = {
        billingAccountId: PRESET,
        principalAmount: '100,00',
        paidAt: '2026-10-15',
        paymentMethod: 'PIX',
    };

    it('aceita só o principal e normaliza os valores opcionais', () => {
        const parsed = entryCreateSchema.parse({ ...entry, interestAmount: '', fineAmount: '2,5' });
        expect(parsed.principalAmount).toBe('100.00');
        expect(parsed.interestAmount).toBeUndefined();
        expect(parsed.fineAmount).toBe('2.50');
    });

    it('recusa forma de pagamento desconhecida', () => {
        expect(entryCreateSchema.safeParse({ ...entry, paymentMethod: 'BOLETO' }).success).toBe(
            false,
        );
    });
});

describe('seriesExtendSchema', () => {
    it('exige exatamente um entre quantidade e data final', () => {
        expect(seriesExtendSchema.safeParse({}).success).toBe(false);
        expect(seriesExtendSchema.safeParse({ count: '2' }).success).toBe(true);
        expect(seriesExtendSchema.safeParse({ count: '2', until: '2027-01-01' }).success).toBe(
            false,
        );
    });
});
