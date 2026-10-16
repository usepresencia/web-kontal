import { formatAmount } from '@/lib/_utils/money';
import { TITLE_TYPE_LABELS, formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { accountPageSchema } from '@/lib/api/schemas/billing';
import { presetSchema } from '@/lib/api/schemas/preset';
import { entryPageSchema, titleSchema } from '@/lib/api/schemas/title';
import Link from 'next/link';
import { z } from 'zod';
import { StatusBadge } from '../../_components/status-badge';
import { EntryForm } from './_components/entry-form';
import { DeleteTitleButton, EntriesTable, WriteOffForm } from './_components/title-actions';
import { TitleEditForm } from './_components/title-edit-form';

export default async function TitlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    z.uuid().parse(id);

    const title = await apiFetch(`/titles/${id}`, titleSchema);
    const [entries, preset] = await Promise.all([
        apiFetch(`/titles/${id}/entries?page=1&pageSize=100`, entryPageSchema),
        apiFetch(`/presets/${title.presetId}`, presetSchema),
    ]);
    const accounts = await apiFetch(
        `/billing-accounts?planId=${preset.billingPlanId}&page=1&pageSize=100`,
        accountPageSchema,
    );
    const cashAccounts = accounts.items
        .filter(
            account =>
                account.accountType === 'ANALYTIC' &&
                account.isActive &&
                account.nature === 'ASSET',
        )
        .map(account => ({ value: account.id, label: `${account.code} ${account.name}` }));

    const listPath = title.type === 'EXPENSE' ? '/operacoes/pagar' : '/operacoes/receber';
    const today = new Date().toISOString().slice(0, 10);

    return (
        <div className="max-w-4xl space-y-8">
            <header className="space-y-2">
                <Link href={listPath} className="text-muted-foreground text-sm underline">
                    ← {TITLE_TYPE_LABELS[title.type]}
                </Link>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{title.description}</h1>
                    <StatusBadge status={title.status} />
                </div>
                <p className="text-muted-foreground text-sm">
                    Valor {formatAmount(title.amount)} · Baixado {formatAmount(title.settledAmount)}{' '}
                    · Saldo {formatAmount(title.remainingAmount)} · Vence em{' '}
                    {formatDate(title.expirationDate)}
                    {title.seriesId && (
                        <>
                            {' '}
                            ·{' '}
                            <Link
                                href={`/operacoes/series/${title.seriesId}`}
                                className="underline"
                            >
                                ver série
                            </Link>
                        </>
                    )}
                </p>
            </header>

            <TitleEditForm title={title} />

            <section className="space-y-3">
                <h2 className="font-display text-lg font-semibold">Baixas</h2>
                <EntriesTable titleId={id} entries={entries.items} />
            </section>

            {title.status === 'OPEN' && (
                <>
                    <EntryForm
                        titleId={id}
                        accounts={cashAccounts}
                        today={today}
                        paying={title.type === 'EXPENSE'}
                    />
                    <WriteOffForm titleId={id} />
                </>
            )}

            <DeleteTitleButton title={title} />
        </div>
    );
}
