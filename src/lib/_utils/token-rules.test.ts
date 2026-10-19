import { describe, expect, it } from 'vitest';
import { findTokenViolations } from './token-rules';

describe('findTokenViolations', () => {
    it('aceita classes semânticas', () => {
        const source = '<div className="bg-background text-foreground rounded-md p-4" />';
        expect(findTokenViolations(source)).toEqual([]);
    });

    it.each([
        ['hex', 'color: #BCFC04'],
        ['rgb', 'color: rgb(0,0,0)'],
        ['hsl', 'color: hsl(10 20% 30%)'],
        ['cor padrão', '<p className="text-red-500" />'],
        ['cinza padrão', '<p className="bg-gray-100" />'],
        ['cor arbitrária', '<p className="bg-[#fff]" />'],
        ['branco padrão', '<p className="bg-white" />'],
    ])('acusa %s', (_nome, source) => {
        expect(findTokenViolations(source)).toHaveLength(1);
    });

    it('informa a linha da violação', () => {
        expect(findTokenViolations('ok\n<p className="text-red-500" />')).toEqual([
            { line: 2, match: 'text-red-500' },
        ]);
    });

    it('não confunde nomes de token com cores padrão', () => {
        expect(findTokenViolations('text-negative bg-positive text-accent-foreground')).toEqual([]);
    });
});
