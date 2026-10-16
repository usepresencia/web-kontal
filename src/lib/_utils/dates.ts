const pad = (n: number) => String(n).padStart(2, '0');

/** Primeiro e último dia do mês da data informada, como `YYYY-MM-DD`. */
export function currentMonthRange(now: Date): { start: string; end: string } {
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    return {
        start: `${year}-${pad(month + 1)}-01`,
        end: `${year}-${pad(month + 1)}-${pad(lastDay)}`,
    };
}

/** Valida uma data `YYYY-MM-DD` real (rejeita 30 de fevereiro); devolve null se inválida. */
export function parseIsoDate(value: string | string[] | undefined): string | null {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
    const [year, month, day] = raw.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const valid =
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day;
    return valid ? raw : null;
}

/** Período da query (`start` e `end`), com o mês corrente por padrão e as pontas em ordem. */
export function parsePeriodParams(
    query: Record<string, string | string[] | undefined>,
    now: Date,
): { start: string; end: string } {
    const fallback = currentMonthRange(now);
    const start = parseIsoDate(query.start) ?? fallback.start;
    const end = parseIsoDate(query.end) ?? fallback.end;
    return start <= end ? { start, end } : { start: end, end: start };
}

/** Mês seguinte a um mês `YYYY-MM`, virando o ano em dezembro. */
export function nextMonth(month: string): string {
    const [year, number] = month.split('-').map(Number);
    return number === 12 ? `${year + 1}-01` : `${year}-${pad(number + 1)}`;
}

/** Mês `YYYY-MM` no formato brasileiro `MM/YYYY`. */
export function formatMonth(month: string): string {
    const [year, number] = month.split('-');
    return `${number}/${year}`;
}

const MS_PER_DAY = 86_400_000;

/** Há quantos dias a data ISO aconteceu: "hoje", "ontem" ou "Nd atrás" (pela data, sem a hora). */
export function daysAgoLabel(iso: string, now: Date): string {
    const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
    const then = Date.UTC(year, month - 1, day);
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.max(0, Math.floor((today - then) / MS_PER_DAY));
    if (days === 0) return 'hoje';
    if (days === 1) return 'ontem';
    return `${days}d atrás`;
}
