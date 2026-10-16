import { setToastShow } from '@/lib/_components/ui/toast-registry';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { notify, notifyResult } from './notify';

const show = vi.fn();

beforeEach(() => {
    show.mockClear();
    setToastShow(show);
});

describe('notify', () => {
    it('mostra o toast com a variante e a mensagem', () => {
        notify('success', 'Feito');
        expect(show).toHaveBeenCalledWith(
            expect.objectContaining({ variant: 'success', message: 'Feito' }),
        );
    });

    it('não falha sem o provider montado', () => {
        setToastShow(null);
        expect(() => notify('error', 'x')).not.toThrow();
    });
});

describe('notifyResult', () => {
    it('usa a mensagem da ação ou a padrão no sucesso', () => {
        notifyResult({ ok: true, message: 'Da ação' }, 'Padrão', 'Falha');
        notifyResult({ ok: true }, 'Padrão', 'Falha');
        expect(show.mock.calls.map(call => call[0].message)).toEqual(['Da ação', 'Padrão']);
    });

    it('mostra o motivo ou a mensagem padrão no erro', () => {
        notifyResult({ ok: false, message: 'Motivo' }, 'Ok', 'Falha');
        notifyResult({ ok: false }, 'Ok', 'Falha');
        expect(show.mock.calls.map(call => [call[0].variant, call[0].message])).toEqual([
            ['error', 'Motivo'],
            ['error', 'Falha'],
        ]);
    });
});
