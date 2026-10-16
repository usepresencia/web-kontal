import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FILTER_PILL_CLASS, FilterField } from './filter-field';

describe('FilterField', () => {
    it('mostra o rótulo recuado acima do campo', () => {
        const html = renderToStaticMarkup(
            <FilterField label="Situação">
                <input name="status" />
            </FilterField>,
        );
        expect(html).toContain('Situação');
        expect(html).toContain('pl-4');
        expect(html.indexOf('Situação')).toBeLessThan(html.indexOf('<input'));
    });

    it('usa a pílula clara da busca do cabeçalho', () => {
        expect(FILTER_PILL_CLASS).toContain('rounded-full');
        expect(FILTER_PILL_CLASS).toContain('bg-card');
        expect(FILTER_PILL_CLASS).toContain('shadow-sm');
    });
});
