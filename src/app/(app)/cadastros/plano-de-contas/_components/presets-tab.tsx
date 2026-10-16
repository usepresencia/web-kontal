import { EmptyState } from '@/lib/_components/empty-state';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { planPageSchema } from '@/lib/api/schemas/billing';
import { presetPageSchema } from '@/lib/api/schemas/preset';
import { NewPresetDialog } from './new-preset-dialog';
import { PresetsTable } from './presets-table';

/** Aba "Presets": os históricos padrão (contas por papel) e o botão de novo preset. */
export async function PresetsTab({
    searchParams,
}: {
    searchParams: Record<string, string | string[] | undefined>;
}) {
    const { page, pageSize } = parsePageParams(searchParams);
    const [presets, plans] = await Promise.all([
        apiFetch(`/presets?page=${page}&pageSize=${pageSize}`, presetPageSchema),
        apiFetch('/billing-plans?page=1&pageSize=100', planPageSchema),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <NewPresetDialog plans={plans.items} />
            </div>
            {presets.items.length === 0 ? (
                <EmptyState
                    title="Nenhum preset cadastrado"
                    description="Crie um preset para definir as contas de cada tipo de lançamento."
                />
            ) : (
                <PresetsTable page={presets} />
            )}
        </div>
    );
}
