'use client';

import { getJournalAccountOptionsAction } from '@/actions/journal';
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
import { toLocalIsoDate } from '@/lib/_utils/dates';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ManualEntryForm } from './manual-entry-form';

/** Botão "Novo lançamento": abre em modal o lançamento manual, com as contas carregadas ao abrir. */
export function NewEntryDialog() {
    const [open, setOpen] = useState(false);
    const [accounts, setAccounts] = useState<{ value: string; label: string }[] | null>(null);
    useBusyFlag(open && accounts === null, 'Carregando…');

    useEffect(() => {
        if (!open) return;
        let active = true;
        setAccounts(null);
        getJournalAccountOptionsAction()
            .then(items => active && setAccounts(items))
            .catch(() => active && setAccounts([]));
        return () => {
            active = false;
        };
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus aria-hidden="true" />
                    Novo lançamento
                </Button>
            </DialogTrigger>
            <DialogContent className={MODAL_CLASS}>
                <DialogHeader className="space-y-0.5">
                    <DialogTitle className="font-display text-xl font-bold tracking-tight">
                        Novo lançamento
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Registre um lançamento contábil manual; débitos e créditos precisam fechar.
                    </DialogDescription>
                </DialogHeader>
                {accounts === null ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">Carregando…</p>
                ) : (
                    <ManualEntryForm
                        accounts={accounts}
                        today={toLocalIsoDate(new Date())}
                        onSuccess={() => setOpen(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
