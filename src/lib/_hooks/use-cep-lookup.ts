'use client';

import { useBusyFlag } from '@/lib/_components/busy-provider';
import { fetchCepData, type CepLookupData } from '@/lib/_utils/document';
import { notify } from '@/lib/_utils/notify';
import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { mergeLookup } from './use-cnpj-lookup';

/** Dados do CEP com as chaves usadas nos formulários de endereço. */
function flattenCepData(data: CepLookupData): Record<string, string> {
    return {
        'address.zipCode': data.zipCode,
        'address.street': data.street,
        'address.neighborhood': data.neighborhood,
        'address.city': data.city,
        'address.state': data.state,
    };
}

/**
 * Consulta o CEP na BrasilAPI quando o número fica completo e preenche os campos de endereço
 * vazios. Respostas de um CEP anterior são descartadas e uma consulta que falha pode ser repetida.
 */
export function useCepLookup<T extends Record<string, string>>(
    initialZipCode: string | undefined,
    setValues: Dispatch<SetStateAction<T>>,
) {
    const [loading, setLoading] = useState(false);
    useBusyFlag(loading, 'Consultando CEP…');
    const lastQueried = useRef((initialZipCode ?? '').replace(/\D/g, ''));
    const latest = useRef(0);
    const filled = useRef<Record<string, string>>({});

    return useCallback(
        (digits: string) => {
            if (digits.length !== 8 || digits === lastQueried.current) return;
            latest.current += 1;
            const ticket = latest.current;
            setLoading(true);
            void fetchCepData(digits)
                .then(data => {
                    if (ticket !== latest.current) return;
                    if (!data) {
                        notify('error', 'CEP inválido ou não encontrado na BrasilAPI.');
                        return;
                    }
                    lastQueried.current = digits;
                    const fetched = flattenCepData(data);
                    const previous = filled.current;
                    setValues(current => {
                        const merged = mergeLookup(current, fetched, previous);
                        filled.current = { ...previous, ...merged.filled };
                        return merged.values;
                    });
                })
                .finally(() => {
                    if (ticket === latest.current) setLoading(false);
                });
        },
        [setValues],
    );
}
