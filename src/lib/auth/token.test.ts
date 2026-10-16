import { describe, expect, it } from 'vitest';
import { isWellFormedToken } from './token';

describe('isWellFormedToken', () => {
    it('aceita um JWT de três partes base64url', () => {
        expect(isWellFormedToken('aaa.bbb.ccc')).toBe(true);
        expect(isWellFormedToken('eyJhbGciOi-_9.eyJzdWIiOi-_9.sig-_9')).toBe(true);
    });

    it.each([
        '',
        'abc',
        'a.b',
        'a.b.c.d',
        'a..c',
        '.b.c',
        'a b.c.d',
        'a.b.c=',
        'a.b.c\n',
        '<script>.b.c',
    ])('recusa %j', token => {
        expect(isWellFormedToken(token)).toBe(false);
    });

    it('recusa token acima de 4 KB', () => {
        expect(isWellFormedToken(`${'a'.repeat(4097)}.b.c`)).toBe(false);
    });
});
