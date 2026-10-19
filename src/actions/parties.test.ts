import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const apiFetch = vi.fn();
vi.mock('@/lib/api/client', () => ({ apiFetch }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const { createPartyAction, deletePartyAction, getTitlePartiesAction } = await import('./parties');

const PARTY_ID = '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a5b';

const form = (extra: Record<string, string> = {}) => {
    const data = new FormData();
    const fields = {
        kind: 'SUPPLIER',
        name: 'Copel',
        socialReason: 'Companhia Paranaense de Energia',
        document: '76.483.817/0001-71',
        ...extra,
    };
    Object.entries(fields).forEach(([key, value]) => data.set(key, value));
    return data;
};

beforeEach(() => vi.clearAllMocks());

describe('createPartyAction', () => {
    it('cria a contraparte e devolve título e frase do toast', async () => {
        apiFetch.mockResolvedValue({});
        const result = await createPartyAction({ ok: false }, form());
        expect(result).toMatchObject({ ok: true, title: 'Cadastro criado' });
        expect(apiFetch.mock.calls[0][0]).toBe('/parties');
        expect(apiFetch.mock.calls[0][2].method).toBe('POST');
    });

    it('devolve o erro do campo sem chamar a API', async () => {
        const result = await createPartyAction({ ok: false }, form({ name: '' }));
        expect(result.ok).toBe(false);
        expect(result.fieldErrors?.name).toBeDefined();
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it('traduz o erro da API (documento repetido)', async () => {
        const { ApiError } = await import('@/lib/api/errors');
        apiFetch.mockRejectedValue(new ApiError(409, 'PARTY_DOCUMENT_TAKEN', 'Documento repetido'));
        const result = await createPartyAction({ ok: false }, form());
        expect(result).toMatchObject({ ok: false, message: 'Documento repetido' });
    });
});

describe('deletePartyAction', () => {
    it('recusa identificador inválido sem consultar a API', async () => {
        expect((await deletePartyAction('x')).ok).toBe(false);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it('exclui pelo identificador', async () => {
        apiFetch.mockResolvedValue(undefined);
        expect((await deletePartyAction(PARTY_ID)).ok).toBe(true);
        expect(apiFetch.mock.calls[0][0]).toBe(`/parties/${PARTY_ID}`);
    });
});

describe('getTitlePartiesAction', () => {
    const items = [
        { id: '1', kind: 'SUPPLIER', name: 'Copel', defaultPresetId: 'p1' },
        { id: '2', kind: 'CLIENT', name: 'Maria', defaultPresetId: null },
        { id: '3', kind: 'BOTH', name: 'Loja', defaultPresetId: null },
    ];

    it('título a pagar lista fornecedores e ambos', async () => {
        apiFetch.mockResolvedValue({ items });
        const result = await getTitlePartiesAction('EXPENSE');
        expect(result.map(party => party.label)).toEqual(['Copel', 'Loja']);
        expect(result[0].defaultPresetId).toBe('p1');
    });

    it('título a receber lista clientes e ambos', async () => {
        apiFetch.mockResolvedValue({ items });
        expect((await getTitlePartiesAction('INCOME')).map(party => party.label)).toEqual([
            'Maria',
            'Loja',
        ]);
    });

    it('devolve vazio para tipo inválido sem consultar a API', async () => {
        // @ts-expect-error tipo inválido de propósito
        expect(await getTitlePartiesAction('X')).toEqual([]);
        expect(apiFetch).not.toHaveBeenCalled();
    });
});
