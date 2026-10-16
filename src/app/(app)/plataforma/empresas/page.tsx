import { EmptyState } from '@/lib/_components/empty-state';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { companyPageSchema } from '@/lib/api/schemas/company';
import { CompaniesTable } from './_components/companies-table';
import { CurrentCompanyDialog } from './_components/current-company-dialog';
import { NewCompanyDialog } from './_components/new-company-dialog';

export default async function CompaniesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
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
                    <h1 className="text-2xl font-bold">Empresas</h1>
                    <p className="text-muted-foreground text-sm">
                        Gerencie as empresas que você pode acessar
                    </p>
                </div>
                <div className="flex gap-2">
                    <CurrentCompanyDialog />
                    <NewCompanyDialog />
                </div>
            </header>

            {companies.items.length === 0 ? (
                <EmptyState title="Nenhuma empresa cadastrada" />
            ) : (
                <CompaniesTable page={companies} />
            )}
        </div>
    );
}
