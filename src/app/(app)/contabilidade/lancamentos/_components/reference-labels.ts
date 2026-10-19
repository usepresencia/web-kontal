/** Origem do lançamento contábil: operações do sistema (títulos e transações) ou lançamentos manuais. */
export const REFERENCE_LABELS: Record<string, string> = {
    TITLE_CREATION: 'Título',
    TITLE_CANCELLATION: 'Cancelamento',
    SETTLEMENT: 'Transação',
    SETTLEMENT_REVERSAL: 'Estorno de transação',
    MANUAL: 'Manual',
    MANUAL_REVERSAL: 'Estorno manual',
};
