import { createPresetAction } from '@/actions/presets';
import { EmptyState } from '@/lib/_components/empty-state';
import { Button } from '@/lib/_components/ui/button';
import { apiFetch } from '@/lib/api/client';
import { accountsSchema, planPageSchema } from '@/lib/api/schemas/billing';
import Link from 'next/link';
import { z } from 'zod';
import { PresetForm } from '../_components/preset-form';

export default async function NewPresetPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { planId } = await searchParams;
    const parsedPlanId = z.uuid().safeParse(planId);

    if (!parsedPlanId.success) {
        const plans = await apiFetch('/billing-plans?page=1&pageSize=100', planPageSchema);
        return (
            <div className="max-w-xl space-y-6">
                <h1 className="text-2xl font-bold">Novo preset</h1>
                <p className="text-muted-foreground text-sm">
                    Escolha o plano de contas do preset.
                </p>
                {plans.items.length === 0 ? (
                    <EmptyState
                        title="Nenhum plano cadastrado"
                        description="Crie um plano de contas antes."
                    />
                ) : (
                    <div className="flex flex-col gap-2">
                        {plans.items.map(plan => (
                            <Button
                                asChild
                                key={plan.id}
                                variant="outline"
                                className="justify-start"
                            >
                                <Link href={`/configuracoes/presets/nova?planId=${plan.id}`}>
                                    {plan.name}
                                </Link>
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    const accounts = await apiFetch(`/billing-plans/${parsedPlanId.data}/accounts`, accountsSchema);
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Novo preset</h1>
            <PresetForm
                action={createPresetAction}
                accounts={accounts}
                billingPlanId={parsedPlanId.data}
                submitLabel="Criar preset"
            />
        </div>
    );
}
