/** CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00) formatado; outro tamanho volta como veio. */
export function formatDocument(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 11) {
        return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    }
    if (digits.length === 14) {
        return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }
    return value;
}

/** Máscara progressiva de CPF em tempo real (000.000.000-00). */
export function maskCpf(value: string): string {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

/** Máscara progressiva de CNPJ em tempo real (00.000.000/0000-00). */
export function maskCnpj(value: string): string {
    const d = value.replace(/\D/g, '').slice(0, 14);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
    if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

/** Máscara progressiva em tempo real: até 11 dígitos formata como CPF; acima de 11, como CNPJ. */
export function maskCpfCnpj(value: string): string {
    const d = value.replace(/\D/g, '').slice(0, 14);
    return d.length <= 11 ? maskCpf(d) : maskCnpj(d);
}

/** Máscara progressiva de CEP (00000-000). */
export function maskCep(value: string): string {
    const d = value.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
}

/** Máscara progressiva de telefone em tempo real: fixo (00) 0000-0000 ou celular (00) 00000-0000. */
export function maskPhone(value: string): string {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length === 0) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

export type CnpjLookupData = {
    name: string;
    socialReason: string;
    openingDate: string;
    cnae: string;
    taxRegime: string;
    email: string;
    phone: string;
    address: {
        zipCode: string;
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
    };
};

function str(value: unknown): string {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    return '';
}

/** Normaliza a resposta da BrasilAPI (ou formato com `estabelecimento`) para os campos do formulário. */
export function parseCnpjResponse(data: Record<string, unknown>): CnpjLookupData {
    const est =
        typeof data.estabelecimento === 'object' && data.estabelecimento !== null
            ? (data.estabelecimento as Record<string, unknown>)
            : undefined;
    const cidade =
        typeof est?.cidade === 'object' && est.cidade !== null
            ? (est.cidade as Record<string, unknown>)
            : undefined;
    const estado =
        typeof est?.estado === 'object' && est.estado !== null
            ? (est.estado as Record<string, unknown>)
            : undefined;

    const socialReason = str(data.razao_social);
    const name = str(data.nome_fantasia) || str(est?.nome_fantasia) || socialReason;
    const openingDate = str(data.data_inicio_atividade) || str(est?.data_inicio_atividade);
    const cnae = str(data.cnae_fiscal);
    const taxRegime =
        data.opcao_pelo_mei === true
            ? 'MEI'
            : data.opcao_pelo_simples === true
              ? 'Simples Nacional'
              : '';
    const email = (str(data.email) || str(est?.email)).toLowerCase();
    const phone = maskPhone(
        str(data.ddd_telefone_1) ||
            (est?.ddd_1 && est?.telefone_1 ? `${str(est.ddd_1)}${str(est.telefone_1)}` : ''),
    );

    const streetType = str(data.descricao_tipo_de_logradouro);
    const rawStreet = str(data.logradouro) || str(est?.logradouro);
    const street =
        streetType && rawStreet && !rawStreet.toUpperCase().startsWith(streetType.toUpperCase())
            ? `${streetType} ${rawStreet}`
            : rawStreet;

    return {
        name,
        socialReason,
        openingDate,
        cnae,
        taxRegime,
        email,
        phone,
        address: {
            zipCode: maskCep(str(data.cep) || str(est?.cep)),
            street,
            number: str(data.numero) || str(est?.numero),
            complement: str(data.complemento) || str(est?.complemento),
            neighborhood: str(data.bairro) || str(est?.bairro),
            city: str(data.municipio) || str(cidade?.nome),
            state: str(data.uf) || str(estado?.sigla),
        },
    };
}

/** Consulta os dados cadastrais do CNPJ na BrasilAPI (`https://brasilapi.com.br/api/cnpj/v1/{cnpj}`). */
export async function fetchCnpjData(cnpj: string): Promise<CnpjLookupData | null> {
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length !== 14) return null;
    try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`);
        if (!res.ok) return null;
        const data = (await res.json()) as Record<string, unknown>;
        return parseCnpjResponse(data);
    } catch {
        return null;
    }
}

export type CepLookupData = {
    zipCode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
};

/** Normaliza a resposta da BrasilAPI (CEP v2) para os campos de endereço do formulário. */
export function parseCepResponse(data: Record<string, unknown>): CepLookupData {
    return {
        zipCode: maskCep(str(data.cep)),
        street: str(data.street),
        neighborhood: str(data.neighborhood),
        city: str(data.city),
        state: str(data.state),
    };
}

/** Consulta o endereço do CEP na BrasilAPI (`https://brasilapi.com.br/api/cep/v2/{cep}`). */
export async function fetchCepData(cep: string): Promise<CepLookupData | null> {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return null;
    try {
        const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`);
        if (!res.ok) return null;
        const data = (await res.json()) as Record<string, unknown>;
        return parseCepResponse(data);
    } catch {
        return null;
    }
}
