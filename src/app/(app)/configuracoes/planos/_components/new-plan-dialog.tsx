'use client';

import { createPlanAction } from '@/actions/billing';
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
import { PlanForm } from './plan-form';

/** Botão "Novo plano": abre o cadastro do plano de contas em modal. */
export function NewPlanDialog() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus aria-hidden="true" />
                    Novo plano
                </Button>
            </DialogTrigger>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader className="space-y-0.5">
                    <DialogTitle className="font-display text-xl font-bold tracking-tight">
                        Novo plano de contas
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Depois de criado, abra o plano para cadastrar as contas.
                    </DialogDescription>
                </DialogHeader>
                <PlanForm action={createPlanAction} onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
