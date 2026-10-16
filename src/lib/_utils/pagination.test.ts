import { describe, expect, it } from 'vitest';
import { buildPageWindow, pageCount, pageRange, parsePageParams } from './pagination';

describe('buildPageWindow', () => {
    it.each([
        [1, 0, []],
        [1, 1, [1]],
        [1, 3, [1, 2, 3]],
        [1, 10, [1, 2, 3, 'gap', 10]],
        [4, 10, [1, 2, 3, 4, 5, 'gap', 10]],
        [5, 10, [1, 'gap', 4, 5, 6, 'gap', 10]],
        [9, 10, [1, 'gap', 8, 9, 10]],
        [10, 10, [1, 'gap', 8, 9, 10]],
    ])('página %i de %i', (page, total, expected) => {
        expect(buildPageWindow(page, total)).toEqual(expected);
    });
});

describe('pageCount', () => {
    it('arredonda para cima e nunca é menor que 1', () => {
        expect(pageCount(0, 10)).toBe(1);
        expect(pageCount(10, 10)).toBe(1);
        expect(pageCount(11, 10)).toBe(2);
    });
});

describe('pageRange', () => {
    it('informa o intervalo mostrado', () => {
        expect(pageRange(1, 10, 25)).toEqual({ from: 1, to: 10 });
        expect(pageRange(3, 10, 25)).toEqual({ from: 21, to: 25 });
        expect(pageRange(1, 10, 0)).toEqual({ from: 0, to: 0 });
    });
});

describe('parsePageParams', () => {
    it('usa página 1 e tamanho 10 por padrão', () => {
        expect(parsePageParams({})).toEqual({ page: 1, pageSize: 10 });
    });

    it('lê os valores da query', () => {
        expect(parsePageParams({ page: '3', pageSize: '25' })).toEqual({ page: 3, pageSize: 25 });
    });

    it('usa o primeiro valor quando a query repete o parâmetro', () => {
        expect(parsePageParams({ page: ['2', '9'] })).toEqual({ page: 2, pageSize: 10 });
    });

    it.each([
        [{ page: '0' }, { page: 1, pageSize: 10 }],
        [{ page: '-4' }, { page: 1, pageSize: 10 }],
        [{ page: 'abc' }, { page: 1, pageSize: 10 }],
        [{ page: '1.5' }, { page: 1, pageSize: 10 }],
        [{ pageSize: '0' }, { page: 1, pageSize: 10 }],
        [{ pageSize: '101' }, { page: 1, pageSize: 10 }],
        [{ pageSize: '100' }, { page: 1, pageSize: 100 }],
    ])('descarta valores inválidos %j', (query, expected) => {
        expect(parsePageParams(query)).toEqual(expected);
    });
});
