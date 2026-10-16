'use client';

import { Divider } from '@/lib/_components/divider';
import { Pagination } from '@/lib/_components/pagination';
import { usePaginationQuery } from '@/lib/_hooks/use-pagination-query';
import type { Page } from '@/lib/_utils/pagination';
import type { Company } from '@/lib/api/schemas/company';
import { Building2, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { CompanyDialog } from './company-dialog';

/** Lista paginada de empresas no padrão das demais telas; cada linha abre o modal de detalhes. */
export function CompaniesTable({ page }: { page: Page<Company> }) {
    const pagination = usePaginationQuery();
    const [selected, setSelected] = useState<Company | null>(null);

    return (
        <section className="bg-card space-y-4 rounded-2xl p-5 shadow-sm">
            <ul className="space-y-1">
                {page.items.map((company, index) => (
                    <li key={company.id}>
                        {index > 0 && <Divider className="my-1 mr-3 ml-12" />}
                        <button
                            type="button"
                            onClick={() => setSelected(company)}
                            aria-haspopup="dialog"
                            className="group hover:bg-muted/50 focus-visible:ring-ring -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-xl px-3 py-2 text-left focus-visible:ring-2 focus-visible:outline-none"
                        >
                            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
                                {company.logoUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={company.logoUrl}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <Building2 className="size-4" aria-hidden="true" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-foreground truncate text-sm font-medium">
                                    {company.name}
                                </p>
                                <p className="text-muted-foreground truncate text-xs">
                                    {company.cnpj} · {company.address.city}/{company.address.state}
                                </p>
                            </div>
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
                pageSizeLabel="Empresas por página:"
            />
            <CompanyDialog company={selected} onClose={() => setSelected(null)} />
        </section>
    );
}
