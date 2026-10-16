import { Sidebar } from '@/lib/_components/shell/sidebar';
import { apiFetch } from '@/lib/api/client';
import { tenantsSchema } from '@/lib/api/schemas/tenant';
import { requireSession } from '@/lib/auth/session';
import { readTenantId } from '@/lib/auth/session-cookies';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const me = await requireSession();
    const tenantId = await readTenantId();
    if (!tenantId) redirect('/empresa');

    const tenants = await apiFetch('/auth/tenants', tenantsSchema, { tenant: false });
    const company = tenants.find(tenant => tenant.companyId === tenantId && tenant.isActive);
    // Empresa do cookie não é mais acessível ao usuário: volta ao seletor.
    if (!company) redirect('/empresa');

    return (
        <div className="bg-sidebar flex h-screen flex-col overflow-hidden md:flex-row print:block print:h-auto print:overflow-visible">
            <Sidebar
                userName={me.name}
                companies={tenants.filter(tenant => tenant.isActive)}
                currentCompanyId={company.companyId}
            />
            <div className="bg-background relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden md:rounded-l-4xl md:shadow-xl print:overflow-visible print:shadow-none">
                <main className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0">
                    <div className="mx-auto w-full max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    );
}
