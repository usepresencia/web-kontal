'use client';

import { LoadingOverlay } from '@/lib/_components/ui/loading-overlay';
import { currentBusyMessage, popBusy, pushBusy, type BusyEntry } from '@/lib/_utils/busy-stack';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';

const DEFAULT_MESSAGE = 'Carregando…';

type Begin = (message?: string) => () => void;

const BusyContext = createContext<Begin | null>(null);

/** Mantém uma única camada de carregamento para todas as requisições que precisam aguardar. */
export function BusyProvider({ children }: { children: ReactNode }) {
    const [stack, setStack] = useState<BusyEntry[]>([]);
    const nextId = useRef(1);

    const begin = useCallback<Begin>((message = DEFAULT_MESSAGE) => {
        const id = nextId.current++;
        setStack(current => pushBusy(current, id, message));
        return () => setStack(current => popBusy(current, id));
    }, []);

    const message = currentBusyMessage(stack);

    return (
        <BusyContext.Provider value={begin}>
            {children}
            <LoadingOverlay isLoading={message !== null} message={message ?? DEFAULT_MESSAGE} />
        </BusyContext.Provider>
    );
}

function useBegin(): Begin {
    const begin = useContext(BusyContext);
    if (!begin) throw new Error('BusyProvider ausente na árvore.');
    return begin;
}

/** Devolve `run`, que mostra o carregamento enquanto a promessa não termina. */
export function useBusyRun() {
    const begin = useBegin();
    return useMemo(
        () =>
            async function run<T>(task: () => Promise<T>, message?: string): Promise<T> {
                const end = begin(message);
                try {
                    return await task();
                } finally {
                    end();
                }
            },
        [begin],
    );
}

/** Mostra o carregamento enquanto `active` for verdadeiro (ex.: `isPending` de uma transição). */
export function useBusyFlag(active: boolean, message?: string) {
    const begin = useBegin();
    useEffect(() => {
        if (!active) return;
        return begin(message);
    }, [active, begin, message]);
}
