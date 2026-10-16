import { getToastShow } from '@/lib/_components/ui/toast-registry';
import type { FormState } from '@/lib/_utils/form';
import type { ToastText } from '@/lib/_utils/toast-messages';

type Variant = 'success' | 'error';

/** Mostra um toast com título e frase, como no web-presencia; sem o `ToastProvider` montado, não faz nada. */
export function notify(variant: Variant, message: string, title?: string): void {
    getToastShow()?.({
        variant,
        message,
        title: title ?? (variant === 'success' ? 'Pronto' : 'Erro'),
    });
}

/** Mostra o toast do resultado de uma ação: sucesso com o texto dela (ou o informado) e erro com o motivo. */
export function notifyResult(result: FormState, success: ToastText, failure: string): void {
    if (result.ok)
        notify('success', result.message ?? success.message, result.title ?? success.title);
    else notify('error', result.message ?? failure, result.title);
}
