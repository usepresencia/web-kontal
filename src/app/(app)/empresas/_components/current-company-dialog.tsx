'use client';

import { getCurrentCompanyAction, updateCompanyAction } from '@/actions/companies';
import { useBusyFlag } from '@/lib/_components/busy-provider';
import { Button } from '@/lib/_components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    MODAL_CLASS,
} from '@/lib/_components/ui/dialog';
import type { Company } from '@/lib/api/schemas/company';
import { useEffect, useState } from 'react';
import { CompanyForm } from './company-form';
import { LogoUpload } from './logo-upload';

/** Botão "Editar empresa atual": abre em modal o logo e os dados da empresa ativa, carregados ao abrir. */
export function CurrentCompanyDialog() {
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Editar empresa atual</Button>
            </DialogTrigger>
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
    );
}
