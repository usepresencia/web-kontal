import { setToastShow } from '@/lib/_components/ui/toast-registry';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notify, notifyResult } from './notify';
import { SUCCESS } from './toast-messages';

const show = vi.fn();

beforeEach(() => {
    show.mockClear();
    setToastShow(show);
});

describe('notify', () => {
    it('mostra o toast com título, frase e variante', () => {
        notify('success', 'Feito com sucesso.', 'Salvo');
        expect(show).toHaveBeenCalledWith({
            variant: 'success',
            message: 'Feito com sucesso.',
            title: 'Salvo',
        });
    });

    it('usa "Erro" como título padrão do erro', () => {
        notify('error', 'Falhou');
        expect(show.mock.calls[0][0].title).toBe('Erro');
    });

    it('não falha sem o provider montado', () => {
        setToastShow(null);
        expect(() => notify('error', 'x')).not.toThrow();
    });
});

describe('notifyResult', () => {
    it('usa o texto da ação ou o padrão no sucesso', () => {
        notifyResult(
            { ok: true, title: 'Da ação', message: 'Frase da ação.' },
            SUCCESS.planDeleted,
            'Falha',
        );
        notifyResult({ ok: true }, SUCCESS.planDeleted, 'Falha');
        expect(show.mock.calls.map(call => [call[0].title, call[0].message])).toEqual([
            ['Da ação', 'Frase da ação.'],
            ['Plano excluído', 'O plano foi excluído com sucesso.'],
        ]);
    });

    it('mostra o motivo ou a mensagem padrão no erro', () => {
        notifyResult({ ok: false, message: 'Motivo' }, SUCCESS.planDeleted, 'Falha');
        notifyResult({ ok: false }, SUCCESS.planDeleted, 'Falha');
        expect(show.mock.calls.map(call => [call[0].variant, call[0].message])).toEqual([
            ['error', 'Motivo'],
            ['error', 'Falha'],
        ]);
    });
});
