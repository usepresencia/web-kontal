'use client';

import { createCompanyAction } from '@/actions/companies';
import { CompanyForm } from '@/lib/_components/company-form';
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
import { Plus } from 'lucide-react';
import { useState } from 'react';

/** Botão "Nova empresa": abre o cadastro da empresa em modal. */
export function NewCompanyDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus aria-hidden="true" />
                    Nova empresa
                </Button>
            </DialogTrigger>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader className="space-y-0.5">
                    <DialogTitle className="font-display text-xl font-bold tracking-tight">
                        Nova empresa
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Cadastre os dados e o endereço da empresa.
                    </DialogDescription>
                </DialogHeader>
                <CompanyForm action={createCompanyAction} onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
