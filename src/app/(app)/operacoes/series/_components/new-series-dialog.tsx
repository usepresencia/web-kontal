'use client';

import {
    createTitleAction,
    getTitleFormOptionsAction,
    type TitleFormOptions,
} from '@/actions/titles';
import { useBusyFlag } from '@/lib/_components/busy-provider';
import { EmptyState } from '@/lib/_components/empty-state';
import { TitleTypeToggle, type TitleType } from '@/lib/_components/transactions/title-type-toggle';
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
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TitleForm } from '../../_components/title-form';

/** Botão "Novo parcelamento": abre em modal o cadastro de um parcelamento ou recorrência, a pagar ou a receber. */
export function NewSeriesDialog() {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<TitleType>('EXPENSE');
    const [options, setOptions] = useState<TitleFormOptions | null>(null);
    useBusyFlag(open && options === null, 'Carregando…');

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
                <Button>
                    <Plus aria-hidden="true" />
                    Novo parcelamento
                </Button>
            </DialogTrigger>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader className="space-y-0.5">
                    <DialogTitle className="font-display text-xl font-bold tracking-tight">
                        Novo parcelamento
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Cadastre um título parcelado ou recorrente; as ocorrências são geradas
                        automaticamente.
                    </DialogDescription>
                </DialogHeader>
                <TitleTypeToggle value={type} onChange={setType} />
                {options === null ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">Carregando…</p>
                ) : options.presets.length === 0 ? (
                    <EmptyState
                        title="Nenhum preset ativo"
                        description="Cadastre um preset antes de criar parcelamentos."
                        action={
                            <Button asChild variant="outline">
                                <Link href="/configuracoes/presets">Novo preset</Link>
                            </Button>
                        }
                    />
                ) : (
                    <TitleForm
                        key={type}
                        action={createTitleAction}
                        type={type}
                        presets={options.presets}
                        destinationAccounts={options.destinationAccounts}
                        series
                        onSuccess={() => setOpen(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
