'use client';

import {
    createTitleAction,
    getTitleFormOptionsAction,
    type TitleFormOptions,
} from '@/actions/titles';
import { useBusyFlag } from '@/lib/_components/busy-provider';
import { EmptyState } from '@/lib/_components/empty-state';
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
import { entryLabels } from '@/lib/_utils/title-labels';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TitleForm } from './title-form';

type NewTitleDialogProps = {
    type: 'INCOME' | 'EXPENSE';
    /** Abre o cadastro de saldo inicial (implantação) no lugar do título comum. */
    opening?: boolean;
};

/** Botão que abre em modal o cadastro de título ("Novo pagamento", "Novo recebimento") ou de saldo inicial, com as opções carregadas ao abrir. */
export function NewTitleDialog({ type, opening = false }: NewTitleDialogProps) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<TitleFormOptions | null>(null);
    useBusyFlag(open && options === null, 'Carregando…');
    const label = opening ? entryLabels(type).opening : entryLabels(type).create;

    useEffect(() => {
        if (!open) return;
        let active = true;
        setOptions(null);
        getTitleFormOptionsAction(type)
            .then(result => active && setOptions(result))
            .catch(
                () =>
                    active &&
                    setOptions({ presets: [], destinationAccounts: [], financialAccounts: [] }),
            );
        return () => {
            active = false;
        };
    }, [open, type]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={opening ? 'outline' : 'default'}>
                    <Plus aria-hidden="true" />
                    {label}
                </Button>
            </DialogTrigger>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader className="space-y-0.5">
                    <DialogTitle className="font-display text-xl font-bold tracking-tight">
                        {label}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        {opening
                            ? type === 'EXPENSE'
                                ? 'Registre a despesa que já existia antes de usar o sistema.'
                                : 'Registre o saldo que já existia antes de usar o sistema.'
                            : 'Cadastre o título e, se quiser, já registre a transação.'}
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
                                <Link href="/configuracoes/presets">Novo preset</Link>
                            </Button>
                        }
                    />
                ) : (
                    <TitleForm
                        action={createTitleAction}
                        type={type}
                        presets={options.presets}
                        destinationAccounts={options.destinationAccounts}
                        financialAccounts={options.financialAccounts}
                        opening={opening}
                        onSuccess={() => setOpen(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
