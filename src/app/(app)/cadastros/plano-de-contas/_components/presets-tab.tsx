import { EmptyState } from '@/lib/_components/empty-state';
import { FilterButton } from '@/lib/_components/filter-button';
import { FILTER_PILL_CLASS, FilterField } from '@/lib/_components/filter-field';
import { FilterForm } from '@/lib/_components/filter-form';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { planPageSchema } from '@/lib/api/schemas/billing';
import { presetPageSchema } from '@/lib/api/schemas/preset';
import { NewPresetDialog } from './new-preset-dialog';
import { PresetsTable } from './presets-table';

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Aba "Presets": os históricos padrão (contas por papel) e o botão de novo preset. */
export async function PresetsTab({
    searchParams,
}: {
    searchParams: Record<string, string | string[] | undefined>;
}) {
    const { page, pageSize } = parsePageParams(searchParams);
    const search = first(searchParams.search)?.trim().slice(0, 100) || undefined;

    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set('search', search);

    const [presets, plans] = await Promise.all([
        apiFetch(`/presets?${params}`, presetPageSchema),
        apiFetch('/billing-plans?page=1&pageSize=100', planPageSchema),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <FilterForm className="flex flex-wrap items-end gap-3">
                    {/* Preserva a aba ativa ao submeter o formulário */}
                    <input type="hidden" name="aba" value="presets" />
                    <FilterField label="Buscar">
                        <input
                            name="search"
                            defaultValue={search ?? ''}
                            placeholder="Nome do preset"
                            className={`${FILTER_PILL_CLASS} placeholder:text-muted-foreground focus-visible:ring-ring w-56 text-sm outline-none focus-visible:ring-2`}
                        />
                    </FilterField>
                    <FilterButton />
                </FilterForm>
                <NewPresetDialog plans={plans.items} />
            </div>
            {presets.items.length === 0 ? (
                <EmptyState
                    title="Nenhum preset encontrado"
                    description="Crie um preset para definir as contas de cada tipo de lançamento."
                />
            ) : (
                <PresetsTable page={presets} />
            )}
        </div>
    );
}
