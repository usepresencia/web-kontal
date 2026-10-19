'use client';

import { createPartyAction } from '@/actions/parties';
import { Button } from '@/lib/_components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    MODAL_CLASS,
} from '@/lib/_components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/lib/_components/ui/dropdown-menu';
import { PARTY_KIND_LABELS, type PartyKind } from '@/lib/api/schemas/party';
import { ChevronDown, Plus, Store, UserCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { PartyForm } from './party-form';

const KIND_ICONS: Record<PartyKind, React.ElementType> = {
    CLIENT: UserCheck,
    SUPPLIER: Store,
    BOTH: Users,
};

/** Dropdown \"+ Novo\": escolhe se cria Cliente, Fornecedor ou Ambos, e abre o modal já com o tipo pré-selecionado. */
export function NewPartyDropdown({ presets }: { presets: { value: string; label: string }[] }) {
    const [kind, setKind] = useState<PartyKind | null>(null);

    const open = kind !== null;
    const setOpen = (value: boolean) => {
        if (!value) setKind(null);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>
                        <Plus aria-hidden="true" />
                        Novo
                        <ChevronDown aria-hidden="true" className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-44">
                    {(['CLIENT', 'SUPPLIER', 'BOTH'] as const).map(k => {
                        const Icon = KIND_ICONS[k];
                        return (
                            <DropdownMenuItem key={k} onClick={() => setKind(k)} className="gap-2">
                                <Icon className="text-muted-foreground size-4" aria-hidden="true" />
                                {PARTY_KIND_LABELS[k]}
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className={MODAL_CLASS}>
                    <DialogHeader className="space-y-0.5">
                        <DialogTitle className="font-display text-xl font-bold tracking-tight">
                            {kind
                                ? `Novo ${PARTY_KIND_LABELS[kind].toLowerCase()}`
                                : 'Novo cadastro'}
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            Escolha o preset padrão: é ele que define as contas contábeis dos
                            títulos.
                        </DialogDescription>
                    </DialogHeader>
                    {kind && (
                        <PartyForm
                            action={createPartyAction}
                            presets={presets}
                            defaultKind={kind}
                            onSuccess={() => setKind(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
