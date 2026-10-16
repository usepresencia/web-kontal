'use client';

import {
    createTitleAction,
    getTitleFormOptionsAction,
    type TitleFormOptions,
} from '@/actions/titles';
import { EmptyState } from '@/lib/_components/empty-state';
import { Button } from '@/lib/_components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/lib/_components/ui/dialog';
import { entryLabels } from '@/lib/_utils/title-labels';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TitleForm } from './title-form';

type NewTitleDialogProps = { type: 'INCOME' | 'EXPENSE' };

/** Botão "Novo pagamento" ou "Novo recebimento": abre o cadastro de título em modal, com as opções carregadas ao abrir. */
export function NewTitleDialog({ type }: NewTitleDialogProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<TitleFormOptions | null>(null);
    const label = entryLabels(type).create;

    useEffect(() => {
        if (!open) return;
        let active = true;
        setOptions(null);
        getTitleFormOptionsAction(type)
            .then(result => active && setOptions(result))
            .catch(() => active && setOptions({ presets: [], destinationAccounts: [] }));
        return () => {
            active = false;
        };
    }, [open, type]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus aria-hidden="true" />
                    {label}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl p-6">
                <DialogHeader className="space-y-0.5">
                    <DialogTitle className="font-display text-xl font-bold tracking-tight">
                        {label}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Cadastre o título; a baixa é registrada depois.
                    </DialogDescription>
                </DialogHeader>
                {options === null ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">Carregando…</p>
                ) : options.presets.length === 0 ? (
                    <EmptyState
                        title="Nenhum preset ativo"
                        description="Cadastre um preset antes de criar títulos."
                        action={
                            <Button asChild variant="outline">
                                <Link href="/configuracoes/presets/nova">Novo preset</Link>
                            </Button>
                        }
                    />
                ) : (
                    <TitleForm
                        action={createTitleAction}
                        type={type}
                        presets={options.presets}
                        destinationAccounts={options.destinationAccounts}
                        onSuccess={() => setOpen(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
