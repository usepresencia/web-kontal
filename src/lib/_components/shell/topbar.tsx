import { ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';

/** Cabeçalho com a empresa ativa e o atalho para trocar de empresa. */
export function Topbar({ companyName }: { companyName: string }) {
    return (
        <header className="px-6 pt-6 pb-4 print:hidden">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
                <div>
                    <p className="text-muted-foreground text-sm">Empresa ativa</p>
                    <h2 className="font-display text-xl font-bold">{companyName}</h2>
                </div>
                <Link
                    href="/empresa"
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
                >
                    <ArrowLeftRight className="size-4" aria-hidden="true" />
                    Trocar empresa
                </Link>
            </div>
            <div className="from-primary/30 mx-auto mt-4 h-px w-full max-w-7xl bg-gradient-to-r from-50% to-transparent" />
        </header>
    );
}
