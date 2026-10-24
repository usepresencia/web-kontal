import { describe, expect, it } from 'vitest';
import {
    formatDocument,
    maskCep,
    maskCnpj,
    maskCpf,
    maskCpfCnpj,
    maskPhone,
    parseCepResponse,
    parseCnpjResponse,
} from './document';

describe('formatDocument', () => {
    it('formata CPF e CNPJ', () => {
        expect(formatDocument('52998224725')).toBe('529.982.247-25');
        expect(formatDocument('11222333000181')).toBe('11.222.333/0001-81');
    });

    it('mantém o que já está formatado e o que não é CPF nem CNPJ', () => {
        expect(formatDocument('529.982.247-25')).toBe('529.982.247-25');
        expect(formatDocument('123')).toBe('123');
    });
});

describe('maskCpf, maskCnpj e maskCpfCnpj', () => {
    it('aplica máscara progressiva de CPF', () => {
        expect(maskCpf('529')).toBe('529');
        expect(maskCpf('52998')).toBe('529.98');
        expect(maskCpf('52998224')).toBe('529.982.24');
        expect(maskCpf('5299822472599')).toBe('529.982.247-25');
    });

    it('aplica máscara progressiva de CNPJ', () => {
        expect(maskCnpj('11')).toBe('11');
        expect(maskCnpj('11222')).toBe('11.222');
        expect(maskCnpj('11222333')).toBe('11.222.333');
        expect(maskCnpj('112223330001')).toBe('11.222.333/0001');
        expect(maskCnpj('1122233300018199')).toBe('11.222.333/0001-81');
    });

    it('alterna entre CPF (até 11 dígitos) e CNPJ (12 a 14 dígitos)', () => {
        expect(maskCpfCnpj('52998224725')).toBe('529.982.247-25');
        expect(maskCpfCnpj('112223330001')).toBe('11.222.333/0001');
        expect(maskCpfCnpj('11222333000181')).toBe('11.222.333/0001-81');
    });

    it('aplica máscara progressiva de CEP', () => {
        expect(maskCep('01310')).toBe('01310');
        expect(maskCep('01310100')).toBe('01310-100');
    });
});

describe('maskPhone', () => {
    it('aplica máscara progressiva enquanto digita', () => {
        expect(maskPhone('')).toBe('');
        expect(maskPhone('1')).toBe('(1');
        expect(maskPhone('11')).toBe('(11');
        expect(maskPhone('113')).toBe('(11) 3');
        expect(maskPhone('113000')).toBe('(11) 3000');
        expect(maskPhone('1130004')).toBe('(11) 3000-4');
    });

    it('formata fixo (10 dígitos) com 4 dígitos antes do traço', () => {
        expect(maskPhone('1130004000')).toBe('(11) 3000-4000');
    });

    it('formata celular (11 dígitos) com 5 dígitos antes do traço', () => {
        expect(maskPhone('11987654321')).toBe('(11) 98765-4321');
    });

    it('ignora o que não é dígito e corta além de 11 dígitos', () => {
        expect(maskPhone('(11) 98765-4321')).toBe('(11) 98765-4321');
        expect(maskPhone('119876543219999')).toBe('(11) 98765-4321');
    });
});

describe('parseCnpjResponse', () => {
    it('extrai dados do formato padrão da BrasilAPI', () => {
        const parsed = parseCnpjResponse({
            razao_social: 'KONTAL TECNOLOGIA LTDA',
            nome_fantasia: 'KONTAL TECH',
            data_inicio_atividade: '2020-03-15',
            cnae_fiscal: 6201501,
            opcao_pelo_simples: true,
            email: 'CONTATO@KONTAL.COM.BR',
            ddd_telefone_1: '1130004000',
            cep: '01310100',
            descricao_tipo_de_logradouro: 'AVENIDA',
            logradouro: 'PAULISTA',
            numero: '1000',
            complemento: 'CONJ 101',
            bairro: 'BELA VISTA',
            municipio: 'SAO PAULO',
            uf: 'SP',
        });

        expect(parsed).toEqual({
            name: 'KONTAL TECH',
            socialReason: 'KONTAL TECNOLOGIA LTDA',
            openingDate: '2020-03-15',
            cnae: '6201501',
            taxRegime: 'Simples Nacional',
            email: 'contato@kontal.com.br',
            phone: '(11) 3000-4000',
            address: {
                zipCode: '01310-100',
                street: 'AVENIDA PAULISTA',
                number: '1000',
                complement: 'CONJ 101',
                neighborhood: 'BELA VISTA',
                city: 'SAO PAULO',
                state: 'SP',
            },
        });
    });

    it('usa razão social como nome fantasia quando nome_fantasia vem vazio', () => {
        const parsed = parseCnpjResponse({
            razao_social: 'EMPRESA SEM FANTASIA LTDA',
            nome_fantasia: '',
        });
        expect(parsed.name).toBe('EMPRESA SEM FANTASIA LTDA');
    });
});

describe('parseCepResponse', () => {
    it('extrai e aplica a máscara ao CEP da resposta da BrasilAPI (CEP v2)', () => {
        const parsed = parseCepResponse({
            cep: '01310100',
            state: 'SP',
            city: 'São Paulo',
            neighborhood: 'Bela Vista',
            street: 'Avenida Paulista',
            service: 'viacep',
        });
        expect(parsed).toEqual({
            zipCode: '01310-100',
            street: 'Avenida Paulista',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
        });
    });

    it('devolve texto vazio para campos ausentes', () => {
        expect(parseCepResponse({ cep: '01310100' })).toEqual({
            zipCode: '01310-100',
            street: '',
            neighborhood: '',
            city: '',
            state: '',
        });
    });
});
