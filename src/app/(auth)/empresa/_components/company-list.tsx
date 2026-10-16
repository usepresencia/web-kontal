'use client';

import { selectCompanyAction } from '@/actions/session';
import { useBusyFlag } from '@/lib/_components/busy-provider';
import { Button } from '@/lib/_components/ui/button';
import type { Tenant } from '@/lib/api/schemas/tenant';
import { useEffect, useRef, useState, useTransition } from 'react';

/** Lista as empresas do usuário; com uma só, a seleciona sozinha. */
export function CompanyList({ tenants }: { tenants: Tenant[] }) {
    const [pending, startTransition] = useTransition();
    useBusyFlag(pending, 'Abrindo empresa…');
    const [error, setError] = useState(false);
    const autoSelected = useRef(false);

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

    return (
        <div className="space-y-3">
            {tenants.map(tenant => (
                <Button
                    key={tenant.companyId}
                    variant="outline"
                    className="w-full justify-between"
                    disabled={pending}
                    onClick={() => select(tenant.companyId)}
                >
                    <span>{tenant.name}</span>
                    <span className="text-muted-foreground text-xs">{tenant.role}</span>
                </Button>
            ))}
            {error && (
                <p role="alert" className="text-negative text-sm">
                    Não foi possível selecionar a empresa.
                </p>
            )}
        </div>
    );
}
