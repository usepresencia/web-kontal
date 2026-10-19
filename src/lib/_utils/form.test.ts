import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { formDataToObject, stateFromZodError } from './form';

function formData(entries: Record<string, string>) {
    const data = new FormData();
    Object.entries(entries).forEach(([key, value]) => data.append(key, value));
    return data;
}

describe('formDataToObject', () => {
    it('monta objetos aninhados a partir de chaves com ponto', () => {
        expect(
            formDataToObject(formData({ name: 'A', 'address.city': 'Rio', 'address.state': 'RJ' })),
        ).toEqual({ name: 'A', address: { city: 'Rio', state: 'RJ' } });
    });

    it('ignora os campos internos das Server Actions', () => {
        expect(formDataToObject(formData({ $ACTION_ID_abc: '', name: 'A' }))).toEqual({
            name: 'A',
        });
    });

    it.each(['__proto__', 'constructor', 'prototype', 'a.__proto__.b'])(
        'recusa a chave perigosa %s',
        key => {
            const result = formDataToObject(formData({ [key]: 'x', ok: '1' }));
            expect(result).toEqual({ ok: '1' });
            expect(({} as Record<string, unknown>).polluted).toBeUndefined();
        },
    );

    it('descarta arquivos', () => {
        const data = new FormData();
        data.append('file', new File(['x'], 'a.txt'));
        data.append('name', 'A');
        expect(formDataToObject(data)).toEqual({ name: 'A' });
    });
});

describe('stateFromZodError', () => {
    it('agrupa as mensagens pelo caminho do campo', () => {
        const schema = z.object({
            name: z.string().min(1, 'Obrigatório'),
            a: z.object({ b: z.string().min(2, 'Curto') }),
        });
        const result = schema.safeParse({ name: '', a: { b: 'x' } });
        if (result.success) throw new Error('esperava falha');
        expect(stateFromZodError(result.error)).toEqual({
            ok: false,
            fieldErrors: { name: ['Obrigatório'], 'a.b': ['Curto'] },
        });
    });
});
