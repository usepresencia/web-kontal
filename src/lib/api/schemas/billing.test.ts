import { describe, expect, it } from 'vitest';
import { accountCreateSchema, accountUpdateSchema, planInputSchema } from './billing';

const PLAN_ID = '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a5b';

describe('planInputSchema', () => {
    it('apara o nome e transforma descrição vazia em ausente', () => {
        expect(planInputSchema.parse({ name: '  Plano  ', description: '' })).toEqual({
            name: 'Plano',
            description: undefined,
        });
    });

    it('exige o nome', () => {
        expect(planInputSchema.safeParse({ name: '   ' }).success).toBe(false);
    });
});

describe('accountCreateSchema', () => {
    it('transforma campos vazios do formulário em nulos e herda a natureza', () => {
        expect(
            accountCreateSchema.parse({
                billingPlanId: PLAN_ID,
                parentId: '',
                name: 'Caixa',
                accountType: 'ANALYTIC',
                nature: '',
                dreCategory: '',
                balanceCategory: 'CURRENT_ASSET',
            }),
        ).toEqual({
            billingPlanId: PLAN_ID,
            parentId: null,
            name: 'Caixa',
            accountType: 'ANALYTIC',
            nature: undefined,
            dreCategory: null,
            balanceCategory: 'CURRENT_ASSET',
            costBehavior: null,
        });
    });

    it('recusa tipo de conta fora da lista', () => {
        expect(
            accountCreateSchema.safeParse({
                billingPlanId: PLAN_ID,
                name: 'x',
                accountType: 'OUTRO',
            }).success,
        ).toBe(false);
    });

    it('recusa plano que não é UUID', () => {
        expect(
            accountCreateSchema.safeParse({
                billingPlanId: '1; DROP TABLE',
                name: 'x',
                accountType: 'ANALYTIC',
            }).success,
        ).toBe(false);
    });
});

describe('costBehavior', () => {
    it('é opcional e vazio vira nulo na criação e na edição', () => {
        const create = accountCreateSchema.parse({
            billingPlanId: PLAN_ID,
            name: 'Frete',
            accountType: 'ANALYTIC',
            costBehavior: '',
        });
        expect(create.costBehavior).toBeNull();
        const update = accountUpdateSchema.parse({
            name: 'Frete',
            accountType: 'ANALYTIC',
            isActive: 'true',
            costBehavior: 'VARIABLE',
        });
        expect(update.costBehavior).toBe('VARIABLE');
    });
});

describe('accountUpdateSchema', () => {
    it('converte o status do formulário em booleano', () => {
        expect(
            accountUpdateSchema.parse({ name: 'A', accountType: 'ANALYTIC', isActive: 'false' })
                .isActive,
        ).toBe(false);
    });

    it('envia o novo pai e trata o vazio como raiz', () => {
        const base = { name: 'A', accountType: 'ANALYTIC', isActive: 'true' };
        expect(accountUpdateSchema.parse({ ...base, parentId: 'abc' }).parentId).toBe('abc');
        expect(accountUpdateSchema.parse({ ...base, parentId: '' }).parentId).toBeNull();
    });

    it('recusa status fora de true/false', () => {
        expect(
            accountUpdateSchema.safeParse({ name: 'A', accountType: 'ANALYTIC', isActive: 'x' })
                .success,
        ).toBe(false);
    });
});
