import { describe, expect, it } from 'vitest';
import { currentBusyMessage, popBusy, pushBusy, type BusyEntry } from './busy-stack';

describe('busy-stack', () => {
    it('empilha cada operação com um id novo e mostra a mensagem da mais recente', () => {
        let stack: BusyEntry[] = [];
        stack = pushBusy(stack, 1, 'Salvando…');
        stack = pushBusy(stack, 2, 'Excluindo…');
        expect(stack.map(entry => entry.id)).toEqual([1, 2]);
        expect(currentBusyMessage(stack)).toBe('Excluindo…');
    });

    it('remove só a operação que terminou e volta à mensagem anterior', () => {
        let stack = pushBusy(pushBusy([], 1, 'Salvando…'), 2, 'Excluindo…');
        stack = popBusy(stack, 2);
        expect(currentBusyMessage(stack)).toBe('Salvando…');
        stack = popBusy(stack, 1);
        expect(stack).toEqual([]);
        expect(currentBusyMessage(stack)).toBeNull();
    });

    it('ignora o fim de uma operação que já saiu da pilha', () => {
        const stack = pushBusy([], 1, 'Salvando…');
        expect(popBusy(stack, 99)).toEqual(stack);
    });

    it('não altera a pilha original (imutável)', () => {
        const original: BusyEntry[] = [];
        pushBusy(original, 1, 'x');
        expect(original).toEqual([]);
    });
});
