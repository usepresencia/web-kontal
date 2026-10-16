'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/lib/_components/ui/dropdown-menu';
import { Plus } from 'lucide-react';
import Link from 'next/link';

/** Botão "Nova" com a escolha entre conta a receber e conta a pagar. */
export function NewTransactionMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="bg-accent text-accent-foreground flex h-11 items-center gap-2 rounded-full px-5 text-base font-semibold">
                <Plus className="size-4" aria-hidden="true" />
                Nova
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href="/operacoes/receber/novo">Conta a receber</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/operacoes/pagar/novo">Conta a pagar</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
