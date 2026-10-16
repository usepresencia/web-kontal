'use client';

import type { FormState } from '@/lib/_utils/form';
import { notify } from '@/lib/_utils/notify';
import { useEffect } from 'react';

/** Mostra um toast com a mensagem de cada novo resultado da ação do formulário (sucesso ou erro). */
export function useActionToast(state: FormState): void {
    useEffect(() => {
        if (state.message) notify(state.ok ? 'success' : 'error', state.message);
    }, [state]);
}
