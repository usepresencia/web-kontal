import { getPartyFormOptionsAction } from '@/actions/parties';
import { DropdownSelect } from '@/lib/_components/dropdown-select';
import { EmptyState } from '@/lib/_components/empty-state';
import { FilterButton } from '@/lib/_components/filter-button';
import { FILTER_PILL_CLASS, FilterField } from '@/lib/_components/filter-field';
import { FilterForm } from '@/lib/_components/filter-form';
import { parsePageParams } from '@/lib/_utils/pagination';
import { apiFetch } from '@/lib/api/client';
import { PARTY_KIND_LABELS, PARTY_KINDS, partyPageSchema } from '@/lib/api/schemas/party';
import { NewPartyDialog } from './_components/new-party-dialog';
import { PartiesTable } from './_components/parties-table';

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function PartiesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const query = await searchParams;
    const { page, pageSize } = parsePageParams(query);
    const kind = PARTY_KINDS.find(item => item === first(query.kind));
    const status =
        first(query.isActive) === 'true' || first(query.isActive) === 'false'
            ? first(query.isActive)
            : undefined;
    const search = first(query.search)?.trim().slice(0, 100) || undefined;

    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (kind) params.set('kind', kind);
    if (status) params.set('isActive', status);
    if (search) params.set('search', search);

    const [parties, presets] = await Promise.all([
        apiFetch(`/parties?${params}`, partyPageSchema),
        getPartyFormOptionsAction(),
    ]);

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Clientes e fornecedores</h1>
                    <p className="text-muted-foreground text-sm">
                        Gerencie quem compra de você e de quem você compra
                    </p>
                </div>
                <NewPartyDialog presets={presets} />
            </header>

            <FilterForm className="flex flex-wrap items-end gap-3">
                <FilterField label="Buscar">
                    <input
                        name="search"
                        defaultValue={search ?? ''}
                        placeholder="Nome ou documento"
                        className={`${FILTER_PILL_CLASS} placeholder:text-muted-foreground focus-visible:ring-ring w-56 text-sm outline-none focus-visible:ring-2`}
                    />
                </FilterField>
                <FilterField label="Tipo">
                    <DropdownSelect
                        name="kind"
                        defaultValue={kind ?? ''}
                        className={`${FILTER_PILL_CLASS} w-52`}
                        options={[
                            { value: '', label: 'Todos' },
                            ...PARTY_KINDS.map(item => ({
                                value: item,
                                label: PARTY_KIND_LABELS[item],
                            })),
                        ]}
                    />
                </FilterField>
                <FilterField label="Status">
                    <DropdownSelect
                        name="isActive"
                        defaultValue={status ?? ''}
                        className={`${FILTER_PILL_CLASS} w-36`}
                        options={[
                            { value: '', label: 'Todos' },
                            { value: 'true', label: 'Ativos' },
                            { value: 'false', label: 'Inativos' },
                        ]}
                    />
                </FilterField>
                <FilterButton />
            </FilterForm>

            {parties.items.length === 0 ? (
                <EmptyState
                    title="Nenhum cliente ou fornecedor encontrado"
                    description="Cadastre quem se relaciona com a empresa para lançar títulos."
                />
            ) : (
                <PartiesTable page={parties} presets={presets} />
            )}
        </div>
    );
}
