import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SectionTabs } from './section-tabs';

const tabs = [
    { key: 'planos', label: 'Planos', href: '/cadastros/plano-de-contas' },
    { key: 'presets', label: 'Presets', href: '/cadastros/plano-de-contas?aba=presets' },
];

describe('SectionTabs', () => {
    it('renderiza uma aba por link, marcando só a ativa', () => {
        const html = renderToStaticMarkup(
            <SectionTabs tabs={tabs} active="presets" label="Seções" />,
        );
        expect(html).toContain('href="/cadastros/plano-de-contas?aba=presets"');
        expect(html).toContain('href="/cadastros/plano-de-contas"');
        expect((html.match(/aria-current="page"/g) ?? []).length).toBe(1);
        expect(html).toMatch(/aria-current="page"[^>]*>Presets</);
    });
});
