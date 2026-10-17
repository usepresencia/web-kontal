import { EmptyState } from '@/lib/_components/empty-state';
import { Button } from '@/lib/_components/ui/button';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { planPageSchema } from '@/lib/api/schemas/billing';
import Link from 'next/link';
import { PlansTable } from './_components/plans-table';

export default async function PlansPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { page, pageSize } = parsePageParams(await searchParams);
    const plans = await apiFetch(
        `/billing-plans?page=${page}&pageSize=${pageSize}`,
        planPageSchema,
    );

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Planos de contas</h1>
                    <p className="text-muted-foreground text-sm">Estrutura contábil da empresa.</p>
                </div>
                <Button asChild>
                    <Link href="/configuracoes/planos/nova">Novo plano</Link>
                </Button>
            </header>

            {plans.items.length === 0 ? (
                <EmptyState title="Nenhum plano cadastrado" />
            ) : (
                <PlansTable page={plans} />
            )}
        </div>
    );
}
