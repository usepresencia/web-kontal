import { describe, expect, it } from 'vitest';
import { FLASH_COOKIE, readFlash } from './flash';

describe('readFlash', () => {
    it('lê e decodifica a mensagem do cookie', () => {
        const header = `a=1; ${FLASH_COOKIE}=${encodeURIComponent('Título excluído.')}; b=2`;
        expect(readFlash(header)).toBe('Título excluído.');
    });

    it('devolve null sem o cookie, vazio ou malformado', () => {
        expect(readFlash('a=1; b=2')).toBeNull();
        expect(readFlash(`${FLASH_COOKIE}=`)).toBeNull();
        expect(readFlash(`${FLASH_COOKIE}=%E0%A4%A`)).toBeNull();
    });
});
