'use client';

import { Divider } from '@/lib/_components/divider';
import { Pagination } from '@/lib/_components/pagination';
import { usePaginationQuery } from '@/lib/_hooks/use-pagination-query';
import { formatDocument } from '@/lib/_utils/document';
import type { Page } from '@/lib/_utils/pagination';
import { PARTY_KIND_LABELS, type Party } from '@/lib/api/schemas/party';
import { ChevronRight, Users } from 'lucide-react';
import { useState } from 'react';
import { PartyDialog } from './party-dialog';

type PartiesTableProps = { page: Page<Party>; presets: { value: string; label: string }[] };

/** Lista paginada de clientes e fornecedores no padrão das demais telas; cada linha abre o modal de edição. */
export function PartiesTable({ page, presets }: PartiesTableProps) {
    const pagination = usePaginationQuery();
    const [selected, setSelected] = useState<Party | null>(null);

    return (
        <section className="bg-card space-y-4 rounded-2xl p-5 shadow-sm">
            <ul className="space-y-1">
                {page.items.map((party, index) => (
                    <li key={party.id}>
                        {index > 0 && <Divider className="my-1 mr-3 ml-12" />}
                        <button
                            type="button"
                            onClick={() => setSelected(party)}
                            aria-haspopup="dialog"
                            className="group hover:bg-muted/50 focus-visible:ring-ring -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-xl px-3 py-2 text-left focus-visible:ring-2 focus-visible:outline-none"
                        >
                            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                                <Users className="size-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-foreground truncate text-sm font-medium">
                                    {party.name}
                                </p>
                                <p className="text-muted-foreground flex items-center gap-2 text-xs">
                                    {PARTY_KIND_LABELS[party.kind]} ·{' '}
                                    {formatDocument(party.document)}
                                    {party.defaultPresetName && (
                                        <span className="bg-muted rounded-full px-2 py-0.5 text-[11px]">
                                            {party.defaultPresetName}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <span className="bg-muted rounded-full px-2 py-0.5 text-[11px]">
                                {party.isActive ? 'Ativo' : 'Inativo'}
                            </span>
                            <ChevronRight
                                className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                                aria-hidden="true"
                            />
                        </button>
                    </li>
                ))}
            </ul>
            <Pagination
                page={page.page}
                pageSize={page.pageSize}
                total={page.total}
                onPageChange={pagination.onPageChange}
                onPageSizeChange={pagination.onPageSizeChange}
                pageSizeLabel="Cadastros por página:"
            />
            <PartyDialog party={selected} presets={presets} onClose={() => setSelected(null)} />
        </section>
    );
}
