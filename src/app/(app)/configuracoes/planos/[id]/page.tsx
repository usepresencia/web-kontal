import { updatePlanAction } from '@/actions/billing';
import { apiFetch } from '@/lib/api/client';
import { accountsSchema, planSchema } from '@/lib/api/schemas/billing';
import { z } from 'zod';
import { AccountsSection } from '../_components/accounts-section';
import { PlanForm } from '../_components/plan-form';

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    z.uuid().parse(id);

    const [plan, accounts] = await Promise.all([
        apiFetch(`/billing-plans/${id}`, planSchema),
        apiFetch(`/billing-plans/${id}/accounts`, accountsSchema),
    ]);

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">{plan.name}</h1>
            <PlanForm
                action={updatePlanAction.bind(null, id)}
                plan={plan}
                submitLabel="Salvar plano"
            />
            <AccountsSection planId={id} accounts={accounts} />
        </div>
    );
}
