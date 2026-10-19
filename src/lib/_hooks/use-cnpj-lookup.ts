'use client';

import { useBusyFlag } from '@/lib/_components/busy-provider';
import { fetchCnpjData, type CnpjLookupData } from '@/lib/_utils/document';
import { notify } from '@/lib/_utils/notify';
import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';

/** Dados da consulta do CNPJ com as chaves usadas nos formulários. */
export function flattenCnpjData(data: CnpjLookupData): Record<string, string> {
    return {
        name: data.name,
        socialReason: data.socialReason,
        openingDate: data.openingDate,
        cnae: data.cnae,
        taxRegime: data.taxRegime,
        email: data.email,
        phone: data.phone,
        'address.zipCode': data.address.zipCode,
        'address.street': data.address.street,
        'address.number': data.address.number,
        'address.complement': data.address.complement,
        'address.neighborhood': data.address.neighborhood,
        'address.city': data.address.city,
        'address.state': data.address.state,
    };
}

/**
 * Preenche só o que o usuário não digitou: um campo é trocado se estiver vazio ou se ainda tem o
 * valor que uma consulta anterior pôs nele. Chaves que o formulário não tem são ignoradas.
 */
export function mergeLookup<T extends Record<string, string>>(
    current: T,
    fetched: Record<string, string>,
    previouslyFilled: Record<string, string>,
): { values: T; filled: Record<string, string> } {
    const values: Record<string, string> = { ...current };
    const filled: Record<string, string> = {};
    for (const [key, value] of Object.entries(fetched)) {
        if (!(key in current) || !value) continue;
        if (current[key] === '' || current[key] === previouslyFilled[key]) {
            values[key] = value;
            filled[key] = value;
        }
    }
    return { values: values as T, filled };
}

/**
 * Consulta o CNPJ na BrasilAPI quando o número fica completo e preenche os campos vazios do
 * formulário. Respostas de um CNPJ anterior são descartadas e uma consulta que falha pode ser repetida.
 */
export function useCnpjLookup<T extends Record<string, string>>(
    initialDocument: string | undefined,
    setValues: Dispatch<SetStateAction<T>>,
) {
    const [loading, setLoading] = useState(false);
    useBusyFlag(loading, 'Consultando CNPJ…');
    const lastQueried = useRef((initialDocument ?? '').replace(/\D/g, ''));
    const latest = useRef(0);
    const filled = useRef<Record<string, string>>({});

    return useCallback(
        (digits: string) => {
            if (digits.length !== 14 || digits === lastQueried.current) return;
            latest.current += 1;
            const ticket = latest.current;
            setLoading(true);
            void fetchCnpjData(digits)
                .then(data => {
                    if (ticket !== latest.current) return;
                    if (!data) {
                        notify('error', 'CNPJ inválido ou não encontrado na BrasilAPI.');
                        return;
                    }
                    lastQueried.current = digits;
                    const fetched = flattenCnpjData(data);
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
