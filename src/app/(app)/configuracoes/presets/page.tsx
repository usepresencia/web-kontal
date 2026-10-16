import { EmptyState } from '@/lib/_components/empty-state';
import { Button } from '@/lib/_components/ui/button';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { presetPageSchema } from '@/lib/api/schemas/preset';
import Link from 'next/link';
import { PresetsTable } from './_components/presets-table';

export default async function PresetsPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { page, pageSize } = parsePageParams(await searchParams);
    const presets = await apiFetch(`/presets?page=${page}&pageSize=${pageSize}`, presetPageSchema);

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Presets de lançamento</h1>
                    <p className="text-muted-foreground text-sm">
                        Contas usadas em cada tipo de lançamento de um título.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/configuracoes/presets/nova">Novo preset</Link>
                </Button>
            </header>

            {presets.items.length === 0 ? (
                <EmptyState title="Nenhum preset cadastrado" />
            ) : (
                <PresetsTable page={presets} />
            )}
        </div>
    );
}
