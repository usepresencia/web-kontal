import { EmptyState } from '@/lib/_components/empty-state';
import { Button } from '@/lib/_components/ui/button';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { companyPageSchema } from '@/lib/api/schemas/company';
import Link from 'next/link';
import { CompaniesTable } from './_components/companies-table';

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
                    <p className="text-muted-foreground text-sm">Empresas que você pode acessar.</p>
                </div>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/empresas/atual">Editar empresa atual</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/empresas/nova">Nova empresa</Link>
                    </Button>
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
