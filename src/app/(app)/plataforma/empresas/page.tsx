import { DropdownSelect } from '@/lib/_components/dropdown-select';
import { EmptyState } from '@/lib/_components/empty-state';
import { FilterButton } from '@/lib/_components/filter-button';
import { FILTER_PILL_CLASS, FilterField } from '@/lib/_components/filter-field';
import { FilterForm } from '@/lib/_components/filter-form';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { companyPageSchema } from '@/lib/api/schemas/company';
import { requirePlatformAdmin } from '@/lib/auth/session';
import { CompaniesTable } from './_components/companies-table';
import { NewCompanyDialog } from './_components/new-company-dialog';

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function PlatformCompaniesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    await requirePlatformAdmin();
    const query = await searchParams;
    const { page, pageSize } = parsePageParams(query);
    const search = first(query.search)?.trim().slice(0, 100) || undefined;
    const status =
        first(query.isActive) === 'true' || first(query.isActive) === 'false'
            ? first(query.isActive)
            : undefined;

    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set('search', search);
    if (status) params.set('isActive', status);

    const companies = await apiFetch(`/companies?${params}`, companyPageSchema, { tenant: false });

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

            <FilterForm className="flex flex-wrap items-end gap-3">
                <FilterField label="Buscar">
                    <input
                        name="search"
                        defaultValue={search ?? ''}
                        placeholder="Nome ou CNPJ"
                        className={`${FILTER_PILL_CLASS} placeholder:text-muted-foreground focus-visible:ring-ring w-56 text-sm outline-none focus-visible:ring-2`}
                    />
                </FilterField>
                <FilterField label="Status">
                    <DropdownSelect
                        name="isActive"
                        defaultValue={status ?? ''}
                        className={`${FILTER_PILL_CLASS} w-36`}
                        options={[
                            { value: '', label: 'Todos' },
                            { value: 'true', label: 'Ativos' },
                            { value: 'false', label: 'Inativos' },
                        ]}
                    />
                </FilterField>
                <FilterButton />
            </FilterForm>

            {companies.items.length === 0 ? (
                <EmptyState title="Nenhuma empresa cadastrada" />
            ) : (
                <CompaniesTable page={companies} />
            )}
        </div>
    );
}
