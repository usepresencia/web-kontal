import { describe, expect, it } from 'vitest';
import { PRESET_ROLES, REQUIRED_ROLES, accountsForRole } from './preset-roles';

const account = (over: Record<string, unknown>) => ({
    id: 'a',
    code: '1',
    name: 'Conta',
    accountType: 'ANALYTIC' as const,
    nature: 'ASSET' as const,
    isActive: true,
    ...over,
});

describe('PRESET_ROLES', () => {
    it('lista os onze papéis, com contas a receber e a pagar obrigatórias', () => {
        expect(PRESET_ROLES).toHaveLength(11);
        expect(REQUIRED_ROLES).toEqual(['receivable', 'payable']);
    });
});

describe('accountsForRole', () => {
    const accounts = [
        account({ id: '1', nature: 'ASSET' }),
        account({ id: '2', nature: 'LIABILITY' }),
        account({ id: '3', nature: 'ASSET', accountType: 'SYNTHETIC' }),
        account({ id: '4', nature: 'ASSET', isActive: false }),
        account({ id: '5', nature: 'REVENUE' }),
    ];

    it('devolve só contas analíticas, ativas e da natureza do papel', () => {
        expect(accountsForRole(accounts, 'receivable').map(a => a.id)).toEqual(['1']);
        expect(accountsForRole(accounts, 'payable').map(a => a.id)).toEqual(['2']);
        expect(accountsForRole(accounts, 'revenue').map(a => a.id)).toEqual(['5']);
        expect(accountsForRole(accounts, 'openingBalance')).toEqual([]);
    });
});
