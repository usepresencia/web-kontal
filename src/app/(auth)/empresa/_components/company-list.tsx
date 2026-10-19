'use client';

import { selectCompanyAction } from '@/actions/session';
import { useBusyFlag } from '@/lib/_components/busy-provider';
import { Popover, PopoverContent, PopoverTrigger } from '@/lib/_components/ui/popover';
import { cn } from '@/lib/_utils/cn';
import { notify } from '@/lib/_utils/notify';
import type { Tenant } from '@/lib/api/schemas/tenant';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react';

/** Seletor de empresa em dropdown + botão Continuar (no padrão do web-presencia); com uma só, seleciona sozinha. */
export function CompanyList({ tenants }: { tenants: Tenant[] }) {
    const [pending, startTransition] = useTransition();
    useBusyFlag(pending, 'Abrindo empresa…');
    const [error, setError] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string>(
        tenants.length === 1 ? tenants[0].companyId : '',
    );
    const autoSelected = useRef(false);

    const selectedTenant = tenants.find(tenant => tenant.companyId === selectedId);
    const selectedLabel = selectedTenant ? selectedTenant.name : 'Selecione...';

    const select = (companyId: string) => {
        setError(false);
        startTransition(async () => {
            const result = await selectCompanyAction(companyId);
            if (result && !result.ok) setError(true);
        });
    };

    useEffect(() => {
        if (tenants.length === 1 && !autoSelected.current) {
            autoSelected.current = true;
            select(tenants[0].companyId);
        }
    }, [tenants]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedId) {
            notify('error', 'Selecione uma empresa para continuar.', 'Atenção');
            return;
        }
        select(selectedId);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        disabled={pending}
                        aria-haspopup="listbox"
                        aria-expanded={open}
                        className="border-border bg-card text-foreground hover:bg-muted/60 focus-visible:ring-ring flex h-11 w-full items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
                    >
                        <span className="flex min-w-0 items-center gap-2">
                            <Building2
                                className="text-muted-foreground size-5 shrink-0"
                                aria-hidden="true"
                            />
                            <span
                                className={cn(
                                    'truncate',
                                    !selectedTenant && 'text-muted-foreground',
                                )}
                            >
                                {selectedLabel}
                            </span>
                        </span>
                        <ChevronDown
                            className={cn(
                                'size-4 shrink-0 transition-transform',
                                open && 'rotate-180',
                            )}
                            aria-hidden="true"
                        />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="max-h-60 min-w-(--radix-popover-trigger-width) space-y-0.5 overflow-y-auto rounded-xl p-1.5"
                    role="listbox"
                >
                    {tenants.map(tenant => (
                        <button
                            key={tenant.companyId}
                            type="button"
                            role="option"
                            aria-selected={tenant.companyId === selectedId}
                            onClick={() => {
                                setSelectedId(tenant.companyId);
                                setOpen(false);
                            }}
                            className="hover:bg-muted/60 flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors"
                        >
                            <span className="flex min-w-0 items-center gap-2">
                                <Building2
                                    className="text-primary size-4 shrink-0"
                                    aria-hidden="true"
                                />
                                <span className="truncate">{tenant.name}</span>
                            </span>
                            {tenant.companyId === selectedId && (
                                <Check className="size-4 shrink-0" aria-hidden="true" />
                            )}
                        </button>
                    ))}
                </PopoverContent>
            </Popover>

            <div className="space-y-3">
                <button
                    type="submit"
                    disabled={pending || !selectedId}
                    className="bg-primary text-primary-foreground focus-visible:ring-ring flex h-11 w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Continuar
                </button>
                {error && (
                    <p role="alert" className="text-negative text-sm">
                        Não foi possível selecionar a empresa.
                    </p>
                )}
            </div>
        </form>
    );
}
