import { EmptyState } from '@/lib/_components/empty-state';
import { apiFetch } from '@/lib/api/client';
import { tenantsSchema } from '@/lib/api/schemas/tenant';
import { requireSession } from '@/lib/auth/session';
import { CompanyList } from './_components/company-list';

export default async function SelectCompanyPage() {
    const me = await requireSession();
    const tenants = (await apiFetch('/auth/tenants', tenantsSchema, { tenant: false })).filter(
        tenant => tenant.isActive,
    );

    return (
        <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-8">
            <header className="space-y-1">
                <h1 className="text-2xl font-bold">Escolha a empresa</h1>
                <p className="text-muted-foreground text-sm">Olá, {me.name}.</p>
            </header>
            {tenants.length === 0 ? (
                <EmptyState
                    title="Nenhuma empresa disponível"
                    description="Seu usuário ainda não tem empresas ativas no Kontal."
                />
            ) : (
                <CompanyList tenants={tenants} />
            )}
        </main>
    );
}
