import { createTitleAction, getTitleFormOptionsAction } from '@/actions/titles';
import { EmptyState } from '@/lib/_components/empty-state';
import { Button } from '@/lib/_components/ui/button';
import { entryLabels } from '@/lib/_utils/title-labels';
import Link from 'next/link';
import { TitleForm } from './title-form';

/** Página de cadastro de título: carrega os presets ativos e mostra o formulário. */
export async function NewTitleView({ type }: { type: 'INCOME' | 'EXPENSE' }) {
    const { presets, destinationAccounts } = await getTitleFormOptionsAction(type);

    return (
        <div className="max-w-2xl space-y-6">
            <h1 className="text-2xl font-bold">{entryLabels(type).create}</h1>
            {presets.length === 0 ? (
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
                    presets={presets}
                />
            )}
        </div>
    );
}
