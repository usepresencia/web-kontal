import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const apiFetch = vi.fn();
vi.mock('@/lib/api/client', () => ({ apiFetch }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const { createManualEntryAction, reverseEntryAction, getJournalEntryAction } =
    await import('./journal');

const ENTRY_ID = '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a5b';
const ACCOUNT_ID = '4a1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a5b';

beforeEach(() => vi.clearAllMocks());

describe('createManualEntryAction', () => {
    const form = () => {
        const data = new FormData();
        data.set('date', '2026-10-16');
        data.set('description', 'Ajuste');
        data.set(
            'linesJson',
            JSON.stringify([
                { accountId: ACCOUNT_ID, debit: '10,00', credit: '', memo: '' },
                { accountId: ACCOUNT_ID, debit: '', credit: '10,00', memo: '' },
            ]),
        );
        return data;
    };

    it('registra o lançamento e devolve ok, sem redirecionar, para o modal fechar', async () => {
        apiFetch.mockResolvedValue({ id: ENTRY_ID });
        const result = await createManualEntryAction({ ok: false }, form());
        expect(result).toEqual({ ok: true, message: 'Lançamento registrado.' });
    });
});

describe('reverseEntryAction', () => {
    it('estorna e devolve ok, sem redirecionar', async () => {
        apiFetch.mockResolvedValue({ id: ENTRY_ID });
        const result = await reverseEntryAction(ENTRY_ID, { ok: false }, new FormData());
        expect(result).toEqual({ ok: true, message: 'Lançamento estornado.' });
    });
});

describe('getJournalEntryAction', () => {
    it('recusa identificador inválido sem consultar a API', async () => {
        expect(await getJournalEntryAction('x')).toBeNull();
        expect(apiFetch).not.toHaveBeenCalled();
    });
});
