import { describe, expect, it } from 'vitest';
import { buildPageWindow, pageCount, pageRange } from './pagination';

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
