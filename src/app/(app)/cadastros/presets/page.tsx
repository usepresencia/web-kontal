import { EmptyState } from '@/lib/_components/empty-state';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { planPageSchema } from '@/lib/api/schemas/billing';
import { presetPageSchema } from '@/lib/api/schemas/preset';
import { NewPresetDialog } from './_components/new-preset-dialog';
import { PresetsTable } from './_components/presets-table';

export default async function PresetsPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { page, pageSize } = parsePageParams(await searchParams);
    const [presets, plans] = await Promise.all([
        apiFetch(`/presets?page=${page}&pageSize=${pageSize}`, presetPageSchema),
        apiFetch('/billing-plans?page=1&pageSize=100', planPageSchema),
    ]);

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Presets</h1>
                    <p className="text-muted-foreground text-sm">
                        Defina as contas usadas em cada tipo de lançamento de um título
                    </p>
                </div>
                <NewPresetDialog plans={plans.items} />
            </header>

            {presets.items.length === 0 ? (
                <EmptyState title="Nenhum preset cadastrado" />
            ) : (
                <PresetsTable page={presets} />
            )}
        </div>
    );
}
