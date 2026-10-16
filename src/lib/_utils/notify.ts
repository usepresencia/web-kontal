import { getToastShow } from '@/lib/_components/ui/toast-registry';
import type { FormState } from '@/lib/_utils/form';

type Variant = 'success' | 'error';

/** Mostra um toast; sem o `ToastProvider` montado, não faz nada. */
export function notify(variant: Variant, message: string): void {
    getToastShow()?.({ variant, message, title: variant === 'success' ? 'Pronto' : 'Erro' });
}

/** Mostra o toast do resultado de uma ação: sucesso com a mensagem dela (ou a informada) e erro com o motivo. */
export function notifyResult(result: FormState, success: string, failure: string): void {
    if (result.ok) notify('success', result.message ?? success);
    else notify('error', result.message ?? failure);
}
