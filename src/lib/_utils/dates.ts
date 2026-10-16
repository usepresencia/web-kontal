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
