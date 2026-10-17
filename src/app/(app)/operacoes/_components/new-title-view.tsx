import { createTitleAction } from '@/actions/titles';
import { EmptyState } from '@/lib/_components/empty-state';
import { Button } from '@/lib/_components/ui/button';
import { TITLE_TYPE_LABELS } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { accountPageSchema } from '@/lib/api/schemas/billing';
import { presetPageSchema } from '@/lib/api/schemas/preset';
import Link from 'next/link';
import { TitleForm } from './title-form';

/** Página de cadastro de título: carrega os presets ativos e mostra o formulário. */
export async function NewTitleView({ type }: { type: 'INCOME' | 'EXPENSE' }) {
    const presets = await apiFetch('/presets?page=1&pageSize=100&isActive=true', presetPageSchema);
    const accounts =
        type === 'EXPENSE'
            ? await apiFetch('/billing-accounts?page=1&pageSize=100', accountPageSchema)
            : null;
    const destinationAccounts = (accounts?.items ?? [])
        .filter(
            account =>
                account.accountType === 'ANALYTIC' &&
                account.isActive &&
                (account.nature === 'ASSET' || account.nature === 'EXPENSE'),
        )
        .map(account => ({ value: account.id, label: `${account.code} ${account.name}` }));

    return (
        <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold">
                Novo título ({TITLE_TYPE_LABELS[type].toLowerCase()})
            </h1>
            {presets.items.length === 0 ? (
                <EmptyState
                    title="Nenhum preset ativo"
                    description="Cadastre um preset antes de criar títulos."
                    action={
                        <Button asChild variant="outline">
                            <Link href="/configuracoes/presets/nova">Novo preset</Link>
                        </Button>
                    }
                />
            ) : (
                <TitleForm
                    action={createTitleAction}
                    type={type}
                    destinationAccounts={destinationAccounts}
                    presets={presets.items.map(preset => ({
                        value: preset.id,
                        label: preset.name,
                    }))}
                />
            )}
        </div>
    );
}
