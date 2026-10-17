export type BusyEntry = { id: number; message: string };

/** Acrescenta uma operação em andamento à pilha. */
export function pushBusy(stack: BusyEntry[], id: number, message: string): BusyEntry[] {
    return [...stack, { id, message }];
}

/** Tira da pilha a operação que terminou; um id desconhecido não muda nada. */
export function popBusy(stack: BusyEntry[], id: number): BusyEntry[] {
    return stack.some(entry => entry.id === id) ? stack.filter(entry => entry.id !== id) : stack;
}

/** Mensagem da operação mais recente, ou null quando nada está em andamento. */
export function currentBusyMessage(stack: BusyEntry[]): string | null {
    return stack.length === 0 ? null : stack[stack.length - 1].message;
}
