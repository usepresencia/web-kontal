import { Sidebar } from '@/lib/_components/shell/sidebar';
import { Topbar } from '@/lib/_components/shell/topbar';
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
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar companyName={company.name} userName={me.name} />
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
