import { EmptyState } from '@/lib/_components/empty-state';
import { FilterButton } from '@/lib/_components/filter-button';
import { FILTER_PILL_CLASS, FilterField } from '@/lib/_components/filter-field';
import { FilterForm } from '@/lib/_components/filter-form';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { planPageSchema } from '@/lib/api/schemas/billing';
import { NewPlanDialog } from './new-plan-dialog';
import { PlansTable } from './plans-table';

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Aba \"Planos e contas\": busca por nome, a lista de planos no padrão das demais telas e o botão de novo plano. */
export async function PlansTab({
    searchParams,
}: {
    searchParams: Record<string, string | string[] | undefined>;
}) {
    const { page, pageSize } = parsePageParams(searchParams);
    const search = first(searchParams.search)?.trim().slice(0, 100) || undefined;

    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set('search', search);

    const plans = await apiFetch(`/billing-plans?${params}`, planPageSchema);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <FilterForm className="flex flex-wrap items-end gap-3">
                    {/* Preserva a aba ativa ao submeter o formulário */}
                    <input type="hidden" name="aba" value="planos" />
                    <FilterField label="Buscar">
                        <input
                            name="search"
                            defaultValue={search ?? ''}
                            placeholder="Nome do plano"
                            className={`${FILTER_PILL_CLASS} placeholder:text-muted-foreground focus-visible:ring-ring w-56 text-sm outline-none focus-visible:ring-2`}
                        />
                    </FilterField>
                    <FilterButton />
                </FilterForm>
                <NewPlanDialog />
            </div>
            {plans.items.length === 0 ? (
                <EmptyState title="Nenhum plano encontrado" />
            ) : (
                <PlansTable page={plans} />
            )}
        </div>
    );
}
