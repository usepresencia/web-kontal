'use client';

import { getCurrentCompanyAction, updateCompanyAction } from '@/actions/companies';
import { useBusyFlag } from '@/lib/_components/busy-provider';
import { CompanyForm } from '@/lib/_components/company-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    MODAL_CLASS,
} from '@/lib/_components/ui/dialog';
import { formatDocument } from '@/lib/_utils/document';
import type { Company } from '@/lib/api/schemas/company';
import { Building2, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LogoUpload } from './logo-upload';

interface CurrentCompanyCardProps {
    /** Dados iniciais da empresa (carregados pelo server component da página). */
    company: Company;
}

/** Card clicável da empresa atual no padrão de lista; abre modal de edição ao clicar. */
export function CurrentCompanyCard({ company: initial }: CurrentCompanyCardProps) {
    const [open, setOpen] = useState(false);
    const [company, setCompany] = useState<Company | null>(null);
    useBusyFlag(open && company === null, 'Carregando empresa…');

    useEffect(() => {
        if (!open) return;
        let active = true;
        setCompany(null);
        getCurrentCompanyAction()
            .then(result => active && setCompany(result))
            .catch(() => active && setCompany(null));
        return () => {
            active = false;
        };
    }, [open]);

    return (
        <section className="bg-card space-y-4 rounded-2xl p-5 shadow-sm">
            <ul className="space-y-1">
                <li>
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        aria-haspopup="dialog"
                        className="group hover:bg-muted/50 focus-visible:ring-ring -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-xl px-3 py-2 text-left focus-visible:ring-2 focus-visible:outline-none"
                    >
                        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
                            {initial.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={initial.logoUrl}
                                    alt=""
                                    className="size-full object-cover"
                                />
                            ) : (
                                <Building2 className="size-4" aria-hidden="true" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-foreground truncate text-sm font-medium">
                                {initial.name}
                            </p>
                            <p className="text-muted-foreground truncate text-xs">
                                {initial.socialReason} · {formatDocument(initial.cnpj)}
                            </p>
                            <p className="text-muted-foreground truncate text-xs">
                                {initial.address.city}/{initial.address.state} · {initial.email}
                            </p>
                        </div>
                        <ChevronRight
                            className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                            aria-hidden="true"
                        />
                    </button>
                </li>
            </ul>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className={MODAL_CLASS}>
                    <DialogHeader className="space-y-0.5">
                        <DialogTitle className="font-display text-xl font-bold tracking-tight">
                            Empresa atual
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            Atualize o logo e os dados da empresa selecionada.
                        </DialogDescription>
                    </DialogHeader>
                    {company && (
                        <>
                            <LogoUpload logoUrl={company.logoUrl} />
                            <CompanyForm
                                action={updateCompanyAction}
                                company={company}
                                onSuccess={() => setOpen(false)}
                            />
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}
