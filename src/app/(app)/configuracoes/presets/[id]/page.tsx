import { updatePresetAction } from '@/actions/presets';
import { apiFetch } from '@/lib/api/client';
import { accountsSchema } from '@/lib/api/schemas/billing';
import { presetSchema } from '@/lib/api/schemas/preset';
import { z } from 'zod';
import { PresetForm } from '../_components/preset-form';

export default async function EditPresetPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    z.uuid().parse(id);

    const preset = await apiFetch(`/presets/${id}`, presetSchema);
    const accounts = await apiFetch(
        `/billing-plans/${preset.billingPlanId}/accounts`,
        accountsSchema,
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">{preset.name}</h1>
            <p className="text-muted-foreground text-sm">Plano: {preset.billingPlanName}</p>
            <PresetForm
                action={updatePresetAction.bind(null, id)}
                accounts={accounts}
                billingPlanId={preset.billingPlanId}
                preset={preset}
                submitLabel="Salvar preset"
            />
        </div>
    );
}
