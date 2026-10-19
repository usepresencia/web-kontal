/** Linha de um relatório: textos já formatados; a primeira célula pode ser recuada e o último valor colorido. */
export type ReportRow = {
    cells: string[];
    /** `group` destaca contas sintéticas e cabeçalhos; `total` marca os totais. */
    kind?: 'group' | 'total';
    /** Recuo da primeira célula, em níveis. */
    indent?: number;
    /** Cor da última célula: verde para entrada e vermelho para saída. */
    tone?: 'positive' | 'negative';
};

export type ReportColumn = { label: string; align?: 'right' };

/** Bloco de um relatório (um cartão na tela e uma tabela no PDF). */
export type ReportSection = {
    title?: string;
    note?: string;
    columns: ReportColumn[];
    rows: ReportRow[];
};

/** Tudo o que o PDF precisa: o mesmo conteúdo que a tela mostra. */
export type ReportDocument = {
    title: string;
    /** Texto do período ou da data de referência (ex.: "01/10/2026 a 31/10/2026"). */
    period: string;
    filename: string;
    sections: ReportSection[];
};
