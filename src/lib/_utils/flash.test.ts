import { describe, expect, it } from 'vitest';
import { FLASH_COOKIE, readFlash } from './flash';

const cookie = (title: string, message: string) =>
    `${FLASH_COOKIE}=${encodeURIComponent(`${title}\n${message}`)}`;

describe('readFlash', () => {
    it('lê e decodifica o título e a frase do cookie', () => {
        const header = `a=1; ${cookie('Título excluído', 'O título foi excluído com sucesso.')}; b=2`;
        expect(readFlash(header)).toEqual({
            title: 'Título excluído',
            message: 'O título foi excluído com sucesso.',
        });
    });

    it('devolve null sem o cookie, vazio, sem frase ou malformado', () => {
        expect(readFlash('a=1; b=2')).toBeNull();
        expect(readFlash(`${FLASH_COOKIE}=`)).toBeNull();
        expect(readFlash(`${FLASH_COOKIE}=${encodeURIComponent('só título')}`)).toBeNull();
        expect(readFlash(`${FLASH_COOKIE}=%E0%A4%A`)).toBeNull();
    });
});
