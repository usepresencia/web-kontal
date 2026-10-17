import { describe, expect, it } from 'vitest';
import { presetCreateSchema } from './preset';

const ID = (n: number) => `3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a${String(n).padStart(2, '0')}`;

const valid = {
    billingPlanId: ID(1),
    name: ' Padrão ',
    isActive: 'true',
    accounts: { receivable: ID(2), payable: ID(3), revenue: '', expense: ID(4) },
};

describe('presetCreateSchema', () => {
    it('aceita as contas obrigatórias e transforma as opcionais vazias em nulo', () => {
        const parsed = presetCreateSchema.parse(valid);
        expect(parsed.name).toBe('Padrão');
        expect(parsed.accounts.revenue).toBeNull();
        expect(parsed.accounts.expense).toBe(ID(4));
        expect(parsed.accounts.badDebt).toBeNull();
    });

    it('exige contas a receber e a pagar', () => {
        const result = presetCreateSchema.safeParse({
            ...valid,
            accounts: { ...valid.accounts, receivable: '' },
        });
        expect(result.success).toBe(false);
    });

    it('recusa conta que não é UUID', () => {
        expect(
            presetCreateSchema.safeParse({
                ...valid,
                accounts: { ...valid.accounts, expense: 'x' },
            }).success,
        ).toBe(false);
    });

    it('trata isActive ausente como ativo e "false" como inativo', () => {
        expect(presetCreateSchema.parse({ ...valid, isActive: undefined }).isActive).toBe(true);
        expect(presetCreateSchema.parse({ ...valid, isActive: 'false' }).isActive).toBe(false);
    });
});
