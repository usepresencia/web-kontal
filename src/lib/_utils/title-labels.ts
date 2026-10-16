export const TITLE_TYPE_LABELS = { INCOME: 'A receber', EXPENSE: 'A pagar' } as const;

export const TITLE_STATUS_LABELS = {
    OPEN: 'Em aberto',
    SETTLED: 'Quitado',
    WRITTEN_OFF: 'Baixado',
} as const;

export const PAYMENT_METHOD_LABELS = {
    CASH: 'Dinheiro',
    DEBIT: 'Débito',
    CREDIT: 'Crédito',
    PIX: 'Pix',
} as const;

export const SERIES_KIND_LABELS = { INSTALLMENT: 'Parcelado', RECURRING: 'Recorrente' } as const;

export const SERIES_FREQUENCY_LABELS = {
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensal',
    YEARLY: 'Anual',
} as const;

/** Data `YYYY-MM-DD` no formato brasileiro, sem passar por fuso horário. */
export function formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
}

/** Textos da baixa conforme o tipo: pagamento no título a pagar e recebimento no título a receber. */
export function entryLabels(type: 'INCOME' | 'EXPENSE') {
    return type === 'EXPENSE'
        ? {
              action: 'Pagar título',
              create: 'Novo pagamento',
              now: 'Pagar agora',
              submit: 'Pagar',
              pending: 'Pagando…',
              overlay: 'Registrando pagamento…',
          }
        : {
              action: 'Receber título',
              create: 'Novo recebimento',
              now: 'Receber agora',
              submit: 'Receber',
              pending: 'Recebendo…',
              overlay: 'Registrando recebimento…',
          };
}
