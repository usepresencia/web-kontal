/** Página devolvida pelas listagens da api-kontal. */
export type Page<T> = {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
};

export type PageWindowItem = number | 'gap';

/** Quantidade de páginas para o total de itens (no mínimo 1). */
export function pageCount(total: number, pageSize: number): number {
    return Math.max(1, Math.ceil(total / pageSize));
}

/** Intervalo de itens exibido na página atual (0 e 0 quando não há itens). */
export function pageRange(
    page: number,
    pageSize: number,
    total: number,
): { from: number; to: number } {
    if (total === 0) return { from: 0, to: 0 };
    return { from: (page - 1) * pageSize + 1, to: Math.min(page * pageSize, total) };
}

/** Monta a janela de páginas a exibir: primeira, última, vizinhas da atual e lacunas. */
export function buildPageWindow(page: number, totalPages: number): PageWindowItem[] {
    if (totalPages < 1) return [];
    const wanted = new Set([1, totalPages, page - 1, page, page + 1]);
    if (page <= 2) wanted.add(3);
    if (page >= totalPages - 1) wanted.add(totalPages - 2);

    const pages = [...wanted].filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b);
    const result: PageWindowItem[] = [];
    pages.forEach((current, index) => {
        const previous = pages[index - 1];
        if (previous !== undefined) {
            if (current - previous === 2) result.push(previous + 1);
            else if (current - previous > 2) result.push('gap');
        }
        result.push(current);
    });
    return result;
}

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function positiveInt(value: string | string[] | undefined): number | null {
    const raw = Array.isArray(value) ? value[0] : value;
    return raw !== undefined && /^[1-9]\d*$/.test(raw) ? Number(raw) : null;
}

/** Lê `page` e `pageSize` da query da URL, com os mesmos limites da api-kontal (1 a 100 por página). */
export function parsePageParams(query: Record<string, string | string[] | undefined>): {
    page: number;
    pageSize: number;
} {
    const pageSize = positiveInt(query.pageSize);
    return {
        page: positiveInt(query.page) ?? 1,
        pageSize: pageSize !== null && pageSize <= MAX_PAGE_SIZE ? pageSize : DEFAULT_PAGE_SIZE,
    };
}
