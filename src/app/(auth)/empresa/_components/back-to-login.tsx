import { logoutAction } from '@/actions/session';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { LogOut } from 'lucide-react';

/** Botão Voltar: apaga os cookies da sessão e leva ao login do Presencia para entrar de novo. */
export function BackToLogin() {
    return (
        <form action={logoutAction}>
            <FormPendingOverlay message="Saindo…" untilNavigation />
            <button
                type="submit"
                className="border-input bg-card text-foreground hover:bg-muted focus-visible:ring-ring flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
                <LogOut className="size-5" aria-hidden="true" />
                Voltar
            </button>
        </form>
    );
}
