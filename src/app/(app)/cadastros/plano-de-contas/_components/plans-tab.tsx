import { EmptyState } from '@/lib/_components/empty-state';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { planPageSchema } from '@/lib/api/schemas/billing';
import { NewPlanDialog } from './new-plan-dialog';
import { PlansTable } from './plans-table';

/** Aba "Planos e contas": a lista de planos e o botão de novo plano. */
export async function PlansTab({
    searchParams,
}: {
    searchParams: Record<string, string | string[] | undefined>;
}) {
    const { page, pageSize } = parsePageParams(searchParams);
    const plans = await apiFetch(
        `/billing-plans?page=${page}&pageSize=${pageSize}`,
        planPageSchema,
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <NewPlanDialog />
            </div>
            {plans.items.length === 0 ? (
                <EmptyState title="Nenhum plano cadastrado" />
            ) : (
                <PlansTable page={plans} />
            )}
        </div>
    );
}
