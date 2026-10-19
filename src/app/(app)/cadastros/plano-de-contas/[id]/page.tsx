import { apiFetch } from '@/lib/api/client';
import { accountsSchema, planSchema, type BillingAccount } from '@/lib/api/schemas/billing';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { AccountsTreeTable } from '../_components/accounts-tree-table';

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!z.uuid().safeParse(id).success) notFound();

    const plan = await apiFetch(`/billing-plans/${id}`, planSchema);

    let accounts: BillingAccount[] = [];
    try {
        accounts = await apiFetch(`/billing-plans/${id}/accounts`, accountsSchema);
    } catch {
        accounts = [];
    }

    return <AccountsTreeTable plan={plan} initialAccounts={accounts} />;
}
