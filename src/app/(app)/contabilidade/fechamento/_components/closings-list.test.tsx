import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ClosingsList } from './closings-list';

const items = [
    { id: 'a', month: '2026-08', throughDate: '2026-08-31', closingEntryId: null },
    { id: 'b', month: '2026-12', throughDate: '2026-12-31', closingEntryId: 'e1' },
    { id: 'c', month: '2026-09', throughDate: '2026-09-30', closingEntryId: null },
];

const html = renderToStaticMarkup(<ClosingsList items={items} />);

describe('ClosingsList', () => {
    it('usa a lista do padrão, sem tabela, com divisor entre os itens', () => {
        expect(html).not.toContain('<table');
        expect(html).toContain('lucide-lock');
        expect((html.match(/role="separator"/g) ?? []).length).toBe(2);
    });

    it('ordena do mais recente ao mais antigo e marca só o primeiro como último fechamento', () => {
        expect(html.indexOf('12/2026')).toBeLessThan(html.indexOf('09/2026'));
        expect(html.indexOf('09/2026')).toBeLessThan(html.indexOf('08/2026'));
        expect((html.match(/Último fechamento/g) ?? []).length).toBe(1);
    });

    it('mostra o rótulo "Fechado em" antes da data em que o período está travado e se houve apuração', () => {
        expect(html).toContain('31/12/2026');
        expect(html).toContain('Fechado em');
        expect(html.indexOf('Fechado em')).toBeLessThan(html.indexOf('31/12/2026'));
        expect(html).toContain('Com apuração do resultado');
    });
});
