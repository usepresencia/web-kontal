import { describe, expect, it } from 'vitest';
import { initials } from './text';

describe('initials', () => {
    it.each([
        ['Padaria Exemplo', 'PE'],
        ['aluguel', 'A'],
        ['  Conta   de   luz ', 'CD'],
        ['', ''],
        ['Ótica São João', 'ÓS'],
    ])('"%s" vira "%s"', (name, expected) => {
        expect(initials(name)).toBe(expected);
    });
});
