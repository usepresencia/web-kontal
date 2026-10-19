/** Título e frase de um toast de confirmação, no formato do web-presencia ("Salvo" + "… com sucesso."). */
export type ToastText = { title: string; message: string };

const done = (title: string, message: string): ToastText => ({ title, message });

/** Confirmações das operações que gravam dados, usadas pelas ações do servidor e pelo cliente. */
export const SUCCESS = {
    titleCreated: done('Título criado', 'O título foi criado com sucesso.'),
    titleUpdated: done('Título atualizado', 'Os dados do título foram atualizados com sucesso.'),
    titleDeleted: done('Título excluído', 'O título foi excluído com sucesso.'),
    seriesCreated: done('Parcelamento criado', 'O parcelamento foi criado com sucesso.'),
    seriesExtended: done('Parcelamento estendido', 'O parcelamento foi estendido com sucesso.'),
    seriesCancelled: done('Parcelamento cancelado', 'O parcelamento foi cancelado com sucesso.'),
    transactionCreated: done('Transação registrada', 'A transação foi registrada com sucesso.'),
    transactionDeleted: done('Transação excluída', 'A transação foi excluída com sucesso.'),
    writeOff: done('Baixa registrada', 'O saldo foi baixado por perda com sucesso.'),
    entryCreated: done('Lançamento registrado', 'O lançamento foi registrado com sucesso.'),
    entryReversed: done('Lançamento estornado', 'O lançamento foi estornado com sucesso.'),
    periodClosed: done('Período fechado', 'O período foi fechado com sucesso.'),
    periodReopened: done('Período reaberto', 'O período foi reaberto com sucesso.'),
    planCreated: done('Plano criado', 'O plano foi criado com sucesso.'),
    planUpdated: done('Plano atualizado', 'O plano foi atualizado com sucesso.'),
    planDefaulted: done(
        'Plano padrão definido',
        'O plano foi definido como padrão da empresa com sucesso.',
    ),
    planDeleted: done('Plano excluído', 'O plano foi excluído com sucesso.'),
    accountCreated: done('Conta criada', 'A conta foi criada com sucesso.'),
    accountUpdated: done('Conta atualizada', 'A conta foi atualizada com sucesso.'),
    accountDeleted: done('Conta excluída', 'A conta foi excluída com sucesso.'),
    presetCreated: done('Preset criado', 'O preset foi criado com sucesso.'),
    presetUpdated: done('Preset atualizado', 'O preset foi atualizado com sucesso.'),
    presetDeleted: done('Preset excluído', 'O preset foi excluído com sucesso.'),
    partyCreated: done('Cadastro criado', 'O cliente ou fornecedor foi criado com sucesso.'),
    partyUpdated: done(
        'Cadastro atualizado',
        'O cliente ou fornecedor foi atualizado com sucesso.',
    ),
    partyDeleted: done('Cadastro excluído', 'O cliente ou fornecedor foi excluído com sucesso.'),
    companyCreated: done('Empresa criada', 'A empresa foi criada com sucesso.'),
    companyUpdated: done('Empresa atualizada', 'A empresa foi atualizada com sucesso.'),
    companyDeactivated: done('Empresa desativada', 'A empresa foi desativada com sucesso.'),
} as const satisfies Record<string, ToastText>;
