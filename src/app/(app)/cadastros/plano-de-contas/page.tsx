import { SectionTabs } from '@/lib/_components/section-tabs';
import { PlansTab } from './_components/plans-tab';
import { PresetsTab } from './_components/presets-tab';

const BASE = '/cadastros/plano-de-contas';

export default async function ChartOfAccountsPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const query = await searchParams;
    const tab =
        (Array.isArray(query.aba) ? query.aba[0] : query.aba) === 'presets' ? 'presets' : 'planos';

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold">Plano de contas</h1>
                <p className="text-muted-foreground text-sm">
                    Gerencie os planos, as contas e os históricos padrão que a contabilidade usa
                </p>
            </header>
            <SectionTabs
                label="Seções do plano de contas"
                active={tab}
                tabs={[
                    { key: 'planos', label: 'Planos e contas', href: BASE },
                    { key: 'presets', label: 'Históricos padrão', href: `${BASE}?aba=presets` },
                ]}
            />
            {tab === 'presets' ? (
                <PresetsTab searchParams={query} />
            ) : (
                <PlansTab searchParams={query} />
            )}
        </div>
    );
}
