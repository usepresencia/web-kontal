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
            <DropdownMenuTrigger className="bg-accent text-accent-foreground flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold">
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
