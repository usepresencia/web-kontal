import { apiFetch } from '@/lib/api/client';
import { accountPageSchema } from '@/lib/api/schemas/billing';
import { ManualEntryForm } from '../_components/manual-entry-form';

export default async function NewManualEntryPage() {
    const accounts = await apiFetch('/billing-accounts?page=1&pageSize=100', accountPageSchema);
    const options = accounts.items
        .filter(account => account.accountType === 'ANALYTIC' && account.isActive)
        .map(account => ({ value: account.id, label: `${account.code} ${account.name}` }));

    return (
        <div className="max-w-5xl space-y-6">
            <h1 className="text-2xl font-bold">Novo lançamento manual</h1>
            <ManualEntryForm accounts={options} today={new Date().toISOString().slice(0, 10)} />
        </div>
    );
}
