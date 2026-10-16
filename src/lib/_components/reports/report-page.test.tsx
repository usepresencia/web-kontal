import { BusyProvider } from '@/lib/_components/busy-provider';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ReportPage } from './report-page';
import type { ReportDocument } from './report-types';

const report = (sections: ReportDocument['sections']): ReportDocument => ({
    title: 'Balancete',
    period: '01/10/2026 a 31/10/2026',
    filename: 'balancete',
    sections,
});

const render = (sections: ReportDocument['sections']) =>
    renderToStaticMarkup(
        <BusyProvider>
            <ReportPage
                subtitle="Saldos do período"
                report={report(sections)}
                filters={<form>filtros</form>}
                empty={<p>vazio</p>}
            />
        </BusyProvider>,
    );

const section = { columns: [{ label: 'Conta' }], rows: [{ cells: ['x'] }] };

describe('ReportPage', () => {
    it('mostra título, subtítulo e o botão "Gerar PDF" no cabeçalho', () => {
        const html = render([section]);
        expect(html).toContain('Balancete');
        expect(html).toContain('Saldos do período');
        expect(html).toContain('Gerar PDF');
        expect(html.indexOf('Gerar PDF')).toBeLessThan(html.indexOf('filtros'));
    });

    it('esconde o "Gerar PDF" e mostra o estado vazio quando não há blocos', () => {
        const html = render([]);
        expect(html).not.toContain('Gerar PDF');
        expect(html).toContain('vazio');
    });
});
