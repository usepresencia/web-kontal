import { describe, expect, it } from 'vitest';
import { formatDocument } from './document';

describe('formatDocument', () => {
    it('formata CPF e CNPJ', () => {
        expect(formatDocument('52998224725')).toBe('529.982.247-25');
        expect(formatDocument('11222333000181')).toBe('11.222.333/0001-81');
    });

    it('mantém o que já está formatado e o que não é CPF nem CNPJ', () => {
        expect(formatDocument('529.982.247-25')).toBe('529.982.247-25');
        expect(formatDocument('123')).toBe('123');
    });
});
