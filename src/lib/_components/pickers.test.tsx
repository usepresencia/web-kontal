import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DatePickerField } from './date-picker-field';
import { DropdownSelect } from './dropdown-select';
import { MonthPickerField } from './month-picker-field';

describe('DatePickerField', () => {
    it('mostra a data formatada e envia o valor ISO num campo oculto', () => {
        const html = renderToStaticMarkup(
            <DatePickerField name="vencimento" defaultValue="2026-10-16" />,
        );
        expect(html).toContain('16/10/2026');
        expect(html).toContain('type="hidden"');
        expect(html).toContain('name="vencimento"');
        expect(html).toContain('value="2026-10-16"');
    });

    it('mostra o texto de apoio quando está vazio', () => {
        const html = renderToStaticMarkup(<DatePickerField name="d" />);
        expect(html).toContain('dd/mm/aaaa');
        expect(html).toContain('value=""');
    });
});

describe('MonthPickerField', () => {
    it('mostra mês e ano e envia YYYY-MM', () => {
        const html = renderToStaticMarkup(<MonthPickerField name="mes" defaultValue="2026-10" />);
        expect(html).toContain('10/2026');
        expect(html).toContain('value="2026-10"');
    });
});

describe('DropdownSelect', () => {
    const options = [
        { value: '', label: 'Todas' },
        { value: 'OPEN', label: 'Em aberto' },
    ];

    it('mostra o rótulo da opção escolhida e envia o valor', () => {
        const html = renderToStaticMarkup(
            <DropdownSelect name="status" defaultValue="OPEN" options={options} />,
        );
        expect(html).toContain('Em aberto');
        expect(html).toContain('name="status"');
        expect(html).toContain('value="OPEN"');
    });

    it('mostra o placeholder quando nenhuma opção está escolhida', () => {
        const html = renderToStaticMarkup(
            <DropdownSelect
                name="conta"
                defaultValue="x"
                options={options}
                placeholder="Selecione"
            />,
        );
        expect(html).toContain('Selecione');
    });

    it('escapa o rótulo das opções (anti-XSS)', () => {
        const html = renderToStaticMarkup(
            <DropdownSelect
                defaultValue="a"
                options={[{ value: 'a', label: '<script>alert(1)</script>' }]}
            />,
        );
        expect(html).not.toContain('<script>alert');
    });
});
