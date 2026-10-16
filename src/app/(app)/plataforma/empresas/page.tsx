import { EmptyState } from '@/lib/_components/empty-state';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { companyPageSchema } from '@/lib/api/schemas/company';
import { requirePlatformAdmin } from '@/lib/auth/session';
import { CompaniesTable } from './_components/companies-table';
import { NewCompanyDialog } from './_components/new-company-dialog';

export default async function PlatformCompaniesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    await requirePlatformAdmin();
    const { page, pageSize } = parsePageParams(await searchParams);
    const companies = await apiFetch(
        `/companies?page=${page}&pageSize=${pageSize}`,
        companyPageSchema,
        { tenant: false },
    );

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Empresas da plataforma</h1>
                    <p className="text-muted-foreground text-sm">
                        Gerencie todas as empresas da plataforma
                    </p>
                </div>
                <NewCompanyDialog />
            </header>

            {companies.items.length === 0 ? (
                <EmptyState title="Nenhuma empresa cadastrada" />
            ) : (
                <CompaniesTable page={companies} />
            )}
        </div>
    );
}
