import { describe, expect, it } from 'vitest';
import { partyInputSchema } from './party';

const valid = {
    kind: 'SUPPLIER',
    name: ' Copel ',
    socialReason: 'Companhia Paranaense de Energia',
    document: '76.483.817/0001-71',
};

describe('partyInputSchema', () => {
    it('aceita o corpo mínimo, apara o nome e assume e-mail, telefone e endereço vazios', () => {
        expect(partyInputSchema.parse(valid)).toMatchObject({
            name: 'Copel',
            email: '',
            phone: '',
            address: null,
            defaultPresetId: null,
            isActive: true,
        });
    });

    it('transforma o preset padrão vazio em nulo e aceita um UUID', () => {
        const uuid = '3f6d0a2e-8b1c-4f5e-9a7d-1c2b3a4d5e6f';
        expect(
            partyInputSchema.parse({ ...valid, defaultPresetId: '' }).defaultPresetId,
        ).toBeNull();
        expect(partyInputSchema.parse({ ...valid, defaultPresetId: uuid }).defaultPresetId).toBe(
            uuid,
        );
    });

    it('ignora o endereço quando nenhum campo foi preenchido', () => {
        const parsed = partyInputSchema.parse({ ...valid, address: { zipCode: '', street: '  ' } });
        expect(parsed.address).toBeNull();
    });

    it('exige todos os campos do endereço quando algum foi preenchido', () => {
        const result = partyInputSchema.safeParse({ ...valid, address: { zipCode: '80000000' } });
        expect(result.success).toBe(false);
    });

    it('lê o status e recusa tipo inválido ou nome vazio', () => {
        expect(partyInputSchema.parse({ ...valid, isActive: 'false' }).isActive).toBe(false);
        expect(partyInputSchema.safeParse({ ...valid, kind: 'X' }).success).toBe(false);
        expect(partyInputSchema.safeParse({ ...valid, name: ' ' }).success).toBe(false);
    });
});
