'use client';

import { createPartyAction } from '@/actions/parties';
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
import { PartyForm } from './party-form';

/** Botão "Novo cliente/fornecedor": abre o cadastro em modal. */
export function NewPartyDialog({ presets }: { presets: { value: string; label: string }[] }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus aria-hidden="true" />
                    Novo cliente/fornecedor
                </Button>
            </DialogTrigger>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader className="space-y-0.5">
                    <DialogTitle className="font-display text-xl font-bold tracking-tight">
                        Novo cliente ou fornecedor
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Escolha o preset padrão: é ele que define as contas contábeis dos títulos.
                    </DialogDescription>
                </DialogHeader>
                <PartyForm
                    action={createPartyAction}
                    presets={presets}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
