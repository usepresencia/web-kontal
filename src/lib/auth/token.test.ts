import { describe, expect, it } from 'vitest';
import { isWellFormedToken } from './token';

describe('isWellFormedToken', () => {
    it('aceita um JWT de três partes base64url', () => {
        expect(isWellFormedToken('aaa.bbb.ccc')).toBe(true);
        expect(isWellFormedToken('eyJhbGciOi-_9.eyJzdWIiOi-_9.sig-_9')).toBe(true);
    });

    it.each(['', 'abc', 'a.b', 'a.b.c.d', '.b.c', 'a b.c.d', 'a.b.c=', 'a.b.c\n', '<script>.b.c'])(
        'recusa %j',
        token => {
            expect(isWellFormedToken(token)).toBe(false);
        },
    );

    it('recusa token acima de 4 KB', () => {
        expect(isWellFormedToken(`${'a'.repeat(4097)}.b.c`)).toBe(false);
    });
});

describe('token sem assinatura (emulador do Firebase)', () => {
    it('é aceito fora de produção', () => {
        expect(isWellFormedToken('aaa.bbb.', true)).toBe(true);
    });

    it('é recusado em produção', () => {
        expect(isWellFormedToken('aaa.bbb.', false)).toBe(false);
    });

    it('continua recusando partes vazias no cabeçalho ou no corpo', () => {
        expect(isWellFormedToken('.bbb.ccc', true)).toBe(false);
        expect(isWellFormedToken('aaa..ccc', true)).toBe(false);
    });
});
