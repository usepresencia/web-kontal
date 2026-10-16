import { describe, expect, it } from 'vitest';
import { TITLE_STATUS_LABELS, entryLabels, formatDate } from './title-labels';

describe('formatDate', () => {
    it('converte YYYY-MM-DD em DD/MM/YYYY', () => {
        expect(formatDate('2026-10-05')).toBe('05/10/2026');
    });
});

describe('TITLE_STATUS_LABELS', () => {
    it('usa "Baixado" para o título baixado por perda', () => {
        expect(TITLE_STATUS_LABELS.WRITTEN_OFF).toBe('Baixado');
    });

    it('mantém os demais rótulos de situação', () => {
        expect(TITLE_STATUS_LABELS.OPEN).toBe('Em aberto');
        expect(TITLE_STATUS_LABELS.SETTLED).toBe('Quitado');
    });
});

describe('entryLabels', () => {
    it('usa pagamento no título a pagar', () => {
        expect(entryLabels('EXPENSE')).toEqual({
            action: 'Pagar título',
            create: 'Novo pagamento',
            submit: 'Pagar',
            pending: 'Pagando…',
            overlay: 'Registrando pagamento…',
        });
    });

    it('usa recebimento no título a receber', () => {
        expect(entryLabels('INCOME')).toEqual({
            action: 'Receber título',
            create: 'Novo recebimento',
            submit: 'Receber',
            pending: 'Recebendo…',
            overlay: 'Registrando recebimento…',
        });
    });
});
