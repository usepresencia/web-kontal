'use client';

import { createAccountAction, updateAccountAction } from '@/actions/billing';
import { FormField } from '@/lib/_components/form-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { SelectField } from '@/lib/_components/select-field';
import { Button } from '@/lib/_components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/lib/_components/ui/dialog';
import {
    ACCOUNT_TYPE_LABELS,
    BALANCE_CATEGORIES_BY_NATURE,
    BALANCE_CATEGORY_LABELS,
    COST_BEHAVIOR_LABELS,
    DRE_CATEGORIES_BY_NATURE,
    DRE_CATEGORY_LABELS,
    NATURE_LABELS,
} from '@/lib/_utils/billing-labels';
import { INITIAL_FORM_STATE } from '@/lib/_utils/form';
import type { BillingAccount } from '@/lib/api/schemas/billing';
import { useActionState, useEffect, useState } from 'react';

type AccountDialogProps = {
    planId: string;
    accounts: BillingAccount[];
    /** Conta em edição; ausente para criar. */
    account?: BillingAccount;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const toOptions = (labels: Record<string, string>, allowed?: string[]) =>
    Object.entries(labels)
        .filter(([value]) => !allowed || allowed.includes(value))
        .map(([value, label]) => ({ value, label }));

/** Diálogo de criação e edição de conta do plano. */
export function AccountDialog({
    planId,
    accounts,
    account,
    open,
    onOpenChange,
}: AccountDialogProps) {
    const editing = account !== undefined;
    const action = editing
        ? updateAccountAction.bind(null, planId, account.id)
        : createAccountAction.bind(null, planId);
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    const [nature, setNature] = useState(account?.nature ?? '');
    const errors = (field: string) => state.fieldErrors?.[field];

    useEffect(() => {
        if (state.ok) onOpenChange(false);
    }, [state, onOpenChange]);

    const dreOptions = toOptions(
        DRE_CATEGORY_LABELS,
        nature ? DRE_CATEGORIES_BY_NATURE[nature] : undefined,
    );
    const balanceOptions = toOptions(
        BALANCE_CATEGORY_LABELS,
        nature ? BALANCE_CATEGORIES_BY_NATURE[nature] : undefined,
    );
    const parents = accounts
        .filter(item => item.accountType === 'SYNTHETIC')
        .map(item => ({ value: item.id, label: `${item.code} ${item.name}` }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editing ? 'Editar conta' : 'Nova conta'}</DialogTitle>
                    <DialogDescription>
                        {editing
                            ? 'Nome, tipo, categorias e status podem ser alterados.'
                            : 'A natureza é herdada da conta pai quando não informada.'}
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-4">
                    <FormPendingOverlay message="Salvando conta…" />
                    <FormField
                        label="Nome"
                        name="name"
                        defaultValue={account?.name}
                        errors={errors('name')}
                        required
                    />
                    {!editing && (
                        <SelectField
                            label="Conta pai"
                            name="parentId"
                            options={parents}
                            allowEmpty
                            placeholder="Sem conta pai"
                            errors={errors('parentId')}
                        />
                    )}
                    <SelectField
                        label="Tipo"
                        name="accountType"
                        options={toOptions(ACCOUNT_TYPE_LABELS)}
                        defaultValue={account?.accountType ?? 'ANALYTIC'}
                        errors={errors('accountType')}
                    />
                    {!editing && (
                        <SelectField
                            label="Natureza"
                            name="nature"
                            options={toOptions(NATURE_LABELS)}
                            allowEmpty
                            placeholder="Herdar da conta pai"
                            onValueChange={setNature}
                            errors={errors('nature')}
                        />
                    )}
                    <SelectField
                        label="Categoria de DRE"
                        name="dreCategory"
                        options={dreOptions}
                        defaultValue={account?.dreCategory}
                        allowEmpty
                        errors={errors('dreCategory')}
                    />
                    <SelectField
                        label="Categoria de balanço"
                        name="balanceCategory"
                        options={balanceOptions}
                        defaultValue={account?.balanceCategory}
                        allowEmpty
                        errors={errors('balanceCategory')}
                    />
                    {(nature === 'EXPENSE' || (!editing && nature === '')) && (
                        <SelectField
                            label="Comportamento do custo (DRE gerencial)"
                            name="costBehavior"
                            options={toOptions(COST_BEHAVIOR_LABELS)}
                            defaultValue={account?.costBehavior}
                            allowEmpty
                            placeholder="Padrão da categoria do DRE"
                            errors={errors('costBehavior')}
                        />
                    )}
                    {editing && (
                        <SelectField
                            label="Status"
                            name="isActive"
                            options={[
                                { value: 'true', label: 'Ativa' },
                                { value: 'false', label: 'Inativa' },
                            ]}
                            defaultValue={account.isActive ? 'true' : 'false'}
                            errors={errors('isActive')}
                        />
                    )}

                    {state.message && !state.ok && (
                        <p role="alert" className="text-negative text-sm">
                            {state.message}
                        </p>
                    )}

                    <Button type="submit" disabled={pending}>
                        {pending ? 'Salvando…' : 'Salvar'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
