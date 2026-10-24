'use client';

import { createAccountAction, updateAccountAction } from '@/actions/billing';
import { ConfirmSubmitButton } from '@/lib/_components/confirm-submit-button';
import { FILTER_PILL_CLASS } from '@/lib/_components/filter-field';
import { FormPendingOverlay } from '@/lib/_components/form-pending-overlay';
import { PillInput, PillSelect } from '@/lib/_components/pill-fields';
import { useActionToast } from '@/lib/_components/use-action-toast';
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
import { useActionState, useEffect, useState, type ReactNode } from 'react';
import { accountOptionLabel } from './account-option-label';

type AccountFormProps = {
    planId: string;
    accounts: BillingAccount[];
    /** Conta pai pré-selecionada ao criar subconta. */
    defaultParentId?: string;
    /** Conta em edição; ausente para criar. */
    account?: BillingAccount;
    /** Ação extra à esquerda do botão de salvar (ex.: excluir). */
    footerStart?: ReactNode;
    /** Chamado depois que a conta é salva. */
    onSuccess?: () => void;
};

const toOptions = (labels: Record<string, string>, allowed?: string[]) =>
    Object.entries(labels)
        .filter(([value]) => !allowed || allowed.includes(value))
        .map(([value, label]) => ({ value, label }));

/** Ids da conta e de todas as suas descendentes, que não podem ser o novo pai dela. */
function subtreeIds(accounts: BillingAccount[], rootId: string): Set<string> {
    const ids = new Set([rootId]);
    let grew = true;
    while (grew) {
        grew = false;
        for (const item of accounts) {
            if (item.parentId && ids.has(item.parentId) && !ids.has(item.id)) {
                ids.add(item.id);
                grew = true;
            }
        }
    }
    return ids;
}

/** Conta do plano nos campos em pílula: criação e edição. */
export function AccountForm({
    planId,
    accounts,
    defaultParentId,
    account,
    footerStart,
    onSuccess,
}: AccountFormProps) {
    const editing = account !== undefined;
    const action = editing
        ? updateAccountAction.bind(null, planId, account.id)
        : createAccountAction.bind(null, planId);
    const [state, formAction, pending] = useActionState(action, INITIAL_FORM_STATE);
    useActionToast(state);
    const defaultParent = accounts.find(item => item.id === defaultParentId);
    const [parent, setParent] = useState(
        account ? (account.parentId ?? '') : (defaultParentId ?? ''),
    );
    const [type, setType] = useState<string>(account?.accountType ?? 'ANALYTIC');
    const [nature, setNature] = useState(account?.nature ?? defaultParent?.nature ?? '');
    const [dre, setDre] = useState(account?.dreCategory ?? '');
    const [balance, setBalance] = useState(account?.balanceCategory ?? '');
    const [cost, setCost] = useState(account?.costBehavior ?? '');
    const [active, setActive] = useState(account?.isActive === false ? 'false' : 'true');
    const errors = (field: string) => state.fieldErrors?.[field];
    const blockedParents = account ? subtreeIds(accounts, account.id) : new Set<string>();

    useEffect(() => {
        if (state.ok) onSuccess?.();
    }, [state, onSuccess]);

    const parents = accounts
        .filter(item => item.accountType === 'SYNTHETIC' && !blockedParents.has(item.id))
        .map(item => ({ value: item.id, label: accountOptionLabel(item) }));

    return (
        <form action={formAction} className="space-y-4">
            <FormPendingOverlay message="Salvando conta…" />
            <div className="grid grid-cols-2 gap-3">
                <PillInput
                    className={FILTER_PILL_CLASS}
                    label="Nome"
                    name="name"
                    defaultValue={account?.name}
                    required
                    errors={errors('name')}
                />
                <PillSelect
                    className={FILTER_PILL_CLASS}
                    label="Conta pai"
                    name="parentId"
                    value={parent}
                    onChange={setParent}
                    options={parents}
                    allowEmpty
                    emptyLabel="Sem conta pai"
                    placeholder="Sem conta pai"
                    errors={errors('parentId')}
                />
                <PillSelect
                    className={FILTER_PILL_CLASS}
                    label="Tipo"
                    name="accountType"
                    value={type}
                    onChange={setType}
                    options={toOptions(ACCOUNT_TYPE_LABELS)}
                    errors={errors('accountType')}
                />
                {!editing && (
                    <PillSelect
                        className={FILTER_PILL_CLASS}
                        label="Natureza"
                        name="nature"
                        value={nature}
                        onChange={value => {
                            setNature(value);
                            setDre('');
                            setBalance('');
                        }}
                        options={toOptions(NATURE_LABELS)}
                        allowEmpty
                        emptyLabel="Herdar da conta pai"
                        placeholder="Herdar da conta pai"
                        errors={errors('nature')}
                    />
                )}
                <PillSelect
                    className={FILTER_PILL_CLASS}
                    label="Categoria de DRE"
                    name="dreCategory"
                    value={dre}
                    onChange={setDre}
                    options={toOptions(
                        DRE_CATEGORY_LABELS,
                        nature ? DRE_CATEGORIES_BY_NATURE[nature] : undefined,
                    )}
                    allowEmpty
                    errors={errors('dreCategory')}
                />
                <PillSelect
                    className={FILTER_PILL_CLASS}
                    label="Categoria de balanço"
                    name="balanceCategory"
                    value={balance}
                    onChange={setBalance}
                    options={toOptions(
                        BALANCE_CATEGORY_LABELS,
                        nature ? BALANCE_CATEGORIES_BY_NATURE[nature] : undefined,
                    )}
                    allowEmpty
                    errors={errors('balanceCategory')}
                />
                {(nature === 'EXPENSE' || (!editing && nature === '')) && (
                    <PillSelect
                        className={FILTER_PILL_CLASS}
                        label="Comportamento do custo"
                        name="costBehavior"
                        value={cost}
                        onChange={setCost}
                        options={toOptions(COST_BEHAVIOR_LABELS)}
                        allowEmpty
                        emptyLabel="Padrão da categoria do DRE"
                        placeholder="Padrão da categoria do DRE"
                        errors={errors('costBehavior')}
                    />
                )}
                {editing && (
                    <PillSelect
                        className={FILTER_PILL_CLASS}
                        label="Status"
                        name="isActive"
                        value={active}
                        onChange={setActive}
                        options={[
                            { value: 'true', label: 'Ativa' },
                            { value: 'false', label: 'Inativa' },
                        ]}
                        errors={errors('isActive')}
                    />
                )}
            </div>

            <div className="flex items-center justify-between gap-3">
                <div>{footerStart}</div>
                <ConfirmSubmitButton
                    confirmTitle={editing ? 'Salvar conta' : 'Criar conta'}
                    confirmDescription="Confirmar e salvar as informações da conta?"
                    confirmLabel="Salvar"
                    disabled={pending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
                >
                    {pending ? 'Salvando…' : editing ? 'Salvar conta' : 'Criar conta'}
                </ConfirmSubmitButton>
            </div>
        </form>
    );
}
