import { logoutAction } from '@/actions/session';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { apiFetch } from '@/lib/api/client';
import { tenantsSchema } from '@/lib/api/schemas/tenant';
import { requireSession } from '@/lib/auth/session';
import { LogOut } from 'lucide-react';
import { CompanyList } from './_components/company-list';

export default async function SelectCompanyPage() {
    await requireSession();
    const tenants = (await apiFetch('/auth/tenants', tenantsSchema, { tenant: false })).filter(
        tenant => tenant.isActive,
    );

    if (tenants.length === 0) {
        return (
            <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-8">
                <div className="w-full space-y-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-foreground text-3xl font-bold tracking-tight">
                            Ops, tivemos um problema!
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Sua conta não tem acesso a nenhum espaço. Entre em contato com o
                            administrador ou faça login com outra conta.
                        </p>
                    </div>
                    <form action={logoutAction}>
                        <FormPendingOverlay message="Saindo…" />
                        <button
                            type="submit"
                            className="border-input bg-card text-foreground hover:bg-muted focus-visible:ring-ring flex h-11 w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
                        >
                            <LogOut className="size-5" aria-hidden="true" />
                            Voltar
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-8">
            <div className="w-full space-y-6">
                <header className="text-center md:text-left">
                    <h1 className="text-foreground text-3xl font-bold tracking-tight">
                        Entrar no seu espaço de trabalho
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">Escolha seu ambiente</p>
                </header>
                <CompanyList tenants={tenants} />
            </div>
        </main>
    );
}
