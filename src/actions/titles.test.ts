import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const apiFetch = vi.fn();
vi.mock('@/lib/api/client', () => ({ apiFetch }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({
    redirect: (url: string) => {
        throw new Error(`REDIRECT:${url}`);
    },
}));

const { getTitleEntriesAction } = await import('./titles');

const TITLE_ID = '3f1c2b4e-5a6d-4e7f-8a9b-0c1d2e3f4a5b';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('getTitleEntriesAction', () => {
    it('devolve as baixas do título', async () => {
        const items = [{ id: 'e1' }];
        apiFetch.mockResolvedValue({ items });
        expect(await getTitleEntriesAction(TITLE_ID)).toEqual(items);
        expect(apiFetch.mock.calls[0][0]).toBe(`/titles/${TITLE_ID}/entries?page=1&pageSize=100`);
    });

    it('recusa identificador que não é UUID sem consultar a API', async () => {
        expect(await getTitleEntriesAction('../../auth/me')).toEqual([]);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it('devolve lista vazia em erro 4xx da API', async () => {
        const { ApiError } = await import('@/lib/api/errors');
        apiFetch.mockRejectedValue(new ApiError(404, 'NOT_FOUND', 'x'));
        expect(await getTitleEntriesAction(TITLE_ID)).toEqual([]);
    });
});
