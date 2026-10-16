import { describe, expect, it } from 'vitest';
import { NAV_SECTIONS, visibleSections } from './navigation';

const section = (title: string) => NAV_SECTIONS.find(item => item.title === title);

describe('NAV_SECTIONS', () => {
    it('Cadastros traz clientes e fornecedores e o plano de contas, sem presets soltos', () => {
        const titles = section('Cadastros')?.items.map(item => item.title);
        expect(titles).toEqual(['Clientes e fornecedores', 'Plano de contas']);
    });

    it('usa rotas semânticas, sem as antigas', () => {
        const hrefs = NAV_SECTIONS.flatMap(item => item.items.map(entry => entry.href));
        expect(hrefs).toContain('/operacoes/transacoes');
        expect(hrefs).toContain('/operacoes/parcelamentos');
        expect(hrefs).toContain('/cadastros/plano-de-contas');
        expect(hrefs.some(href => /baixas|series|configuracoes\/planos/.test(href))).toBe(false);
    });

    it('a seção da plataforma só aparece para o administrador', () => {
        const titles = (admin: boolean) => visibleSections(admin).map(item => item.title);
        expect(titles(true)).toContain('Plataforma');
        expect(titles(false)).not.toContain('Plataforma');
        expect(
            visibleSections(false).flatMap(item => item.items.map(entry => entry.href)),
        ).not.toContain('/plataforma/empresas');
    });

    it('Minha empresa fica em Configurações para todos', () => {
        const hrefs = visibleSections(false).flatMap(item => item.items.map(entry => entry.href));
        expect(hrefs).toContain('/configuracoes/minha-empresa');
    });
});
