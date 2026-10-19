'use client';

import {
    deleteAccountAction,
    deletePlanAction,
    getPlanAccountsAction,
    setDefaultPlanAction,
    updatePlanAction,
} from '@/actions/billing';
import { useBusyRun } from '@/lib/_components/busy-provider';
import { Divider } from '@/lib/_components/divider';
import { FilterButton } from '@/lib/_components/filter-button';
import { FILTER_PILL_CLASS, FilterField } from '@/lib/_components/filter-field';
import { StepTitle } from '@/lib/_components/transactions/step-title';
import { Button } from '@/lib/_components/ui/button';
import { ConfirmationDialog } from '@/lib/_components/ui/confirmation-dialog';
import { Dialog, DialogContent, DialogHeader, MODAL_CLASS } from '@/lib/_components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/lib/_components/ui/dropdown-menu';
import { ACCOUNT_TYPE_LABELS, NATURE_LABELS } from '@/lib/_utils/billing-labels';
import { cn } from '@/lib/_utils/cn';
import { notifyResult } from '@/lib/_utils/notify';
import { SUCCESS } from '@/lib/_utils/toast-messages';
import type { BillingAccount, BillingPlan } from '@/lib/api/schemas/billing';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    FileText,
    MoreHorizontal,
    Pencil,
    Plus,
    Star,
    Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccountForm } from './account-form';
import { PlanForm } from './plan-form';

export type AccountsTreeTableProps = {
    plan: BillingPlan;
    initialAccounts: BillingAccount[];
};

type AccountModalState = {
    open: boolean;
    account?: BillingAccount;
    defaultParentId?: string;
};

type ConfirmState =
    | { kind: 'account'; account: BillingAccount }
    | { kind: 'plan'; plan: BillingPlan }
    | { kind: 'default'; plan: BillingPlan }
    | null;

/**
 * Exibe a árvore hierárquica de contas de um plano seguindo o padrão de UI de tabelas/listas do sistema.
 */
export function AccountsTreeTable({ plan, initialAccounts }: AccountsTreeTableProps) {
    const router = useRouter();
    const run = useBusyRun();

    const [currentPlan, setCurrentPlan] = useState<BillingPlan>(plan);
    const [accounts, setAccounts] = useState<BillingAccount[]>(initialAccounts);
    const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');

    const [accountModal, setAccountModal] = useState<AccountModalState>({ open: false });
    const [editingPlan, setEditingPlan] = useState(false);
    const [confirm, setConfirm] = useState<ConfirmState>(null);

    useEffect(() => {
        setCurrentPlan(plan);
    }, [plan]);

    useEffect(() => {
        setAccounts(initialAccounts);
    }, [initialAccounts]);

    const refreshAccounts = useCallback(async () => {
        try {
            const data = await getPlanAccountsAction(currentPlan.id);
            setAccounts(data);
        } catch {
            setAccounts([]);
        }
    }, [currentPlan.id]);

    const sortedAccounts = useMemo(() => {
        return [...accounts].sort((a, b) =>
            a.code.localeCompare(b.code, 'pt-BR', { numeric: true }),
        );
    }, [accounts]);

    const { parentMap, parentIdsSet } = useMemo(() => {
        const parentMap = new Map<string, string | null>();
        const parentIdsSet = new Set<string>();

        for (const acc of sortedAccounts) {
            parentMap.set(acc.id, acc.parentId);
            if (acc.parentId) {
                parentIdsSet.add(acc.parentId);
            }
            if (acc.accountType === 'SYNTHETIC') {
                parentIdsSet.add(acc.id);
            }
        }
        return { parentMap, parentIdsSet };
    }, [sortedAccounts]);

    const toggleCollapse = useCallback((id: string) => {
        setCollapsedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const visibleAccounts = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (query) {
            const matchedIds = new Set<string>();
            for (const acc of sortedAccounts) {
                if (
                    acc.code.toLowerCase().includes(query) ||
                    acc.name.toLowerCase().includes(query)
                ) {
                    matchedIds.add(acc.id);
                    let p = parentMap.get(acc.id);
                    while (p) {
                        matchedIds.add(p);
                        p = parentMap.get(p) ?? null;
                    }
                }
            }
            return sortedAccounts.filter(acc => matchedIds.has(acc.id));
        }

        return sortedAccounts.filter(acc => {
            let p = parentMap.get(acc.id);
            while (p) {
                if (collapsedIds.has(p)) return false;
                p = parentMap.get(p) ?? null;
            }
            return true;
        });
    }, [sortedAccounts, search, parentMap, collapsedIds]);

    const handleConfirmDelete = async () => {
        if (!confirm) return;
        if (confirm.kind === 'default') {
            const result = await run(
                () => setDefaultPlanAction(confirm.plan.id),
                'Definindo plano padrão…',
            );
            notifyResult(result, SUCCESS.planDefaulted, 'Não foi possível definir o padrão.');
            setConfirm(null);
            if (result.ok) {
                setCurrentPlan(current => ({ ...current, isDefault: true }));
                router.refresh();
            }
            return;
        }
        if (confirm.kind === 'plan') {
            const result = await run(() => deletePlanAction(confirm.plan.id), 'Excluindo plano…');
            notifyResult(result, SUCCESS.planDeleted, 'Não foi possível excluir.');
            setConfirm(null);
            if (result.ok) {
                router.push('/cadastros/plano-de-contas');
            }
            return;
        }

        const result = await run(
            () => deleteAccountAction(currentPlan.id, confirm.account.id),
            'Excluindo conta…',
        );
        notifyResult(result, SUCCESS.accountDeleted, 'Não foi possível excluir.');
        setConfirm(null);
        if (result.ok) {
            setAccountModal({ open: false });
            await refreshAccounts();
            router.refresh();
        }
    };

    const deleteAccountButton = (account: BillingAccount) => (
        <Button
            type="button"
            variant="destructive"
            className="rounded-full px-6 font-semibold"
            onClick={() => setConfirm({ kind: 'account', account })}
        >
            Excluir conta
        </Button>
    );

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Link
                        href="/cadastros/plano-de-contas"
                        aria-label="Voltar para planos de contas"
                        className="text-muted-foreground hover:text-foreground hover:bg-muted/60 focus-visible:ring-ring -ml-2 flex size-9 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                        <ChevronLeft className="size-5" aria-hidden="true" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{currentPlan.name}</h1>
                        <p className="text-muted-foreground text-sm">
                            Gerencie as contas e a hierarquia deste plano
                        </p>
                    </div>
                </div>
                <Button type="button" onClick={() => setAccountModal({ open: true })}>
                    <Plus aria-hidden="true" />
                    Nova conta
                </Button>
            </header>

            <form onSubmit={e => e.preventDefault()} className="flex flex-wrap items-end gap-3">
                <FilterField label="Buscar">
                    <input
                        type="text"
                        name="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Código ou nome da conta"
                        className={`${FILTER_PILL_CLASS} placeholder:text-muted-foreground focus-visible:ring-ring w-56 text-sm outline-none focus-visible:ring-2`}
                    />
                </FilterField>
                <FilterButton />
            </form>

            <section className="bg-card space-y-4 rounded-2xl p-5 shadow-sm">
                {/* Barra superior de controle do plano e ações */}
                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="text-foreground flex items-center gap-2 truncate text-base font-semibold">
                            {currentPlan.name}
                            {currentPlan.isDefault && (
                                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-medium">
                                    Padrão
                                </span>
                            )}
                        </h2>
                        {currentPlan.description && (
                            <p className="text-muted-foreground truncate text-xs">
                                {currentPlan.description}
                            </p>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Ações do plano"
                                className="text-muted-foreground hover:text-foreground size-8 shrink-0 rounded-full"
                            >
                                <MoreHorizontal className="size-4" aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-40">
                            <DropdownMenuItem
                                onClick={() => setEditingPlan(true)}
                                className="gap-2"
                            >
                                <Pencil
                                    className="text-muted-foreground size-4"
                                    aria-hidden="true"
                                />
                                Editar plano
                            </DropdownMenuItem>
                            {!currentPlan.isDefault && (
                                <DropdownMenuItem
                                    onClick={() =>
                                        setConfirm({ kind: 'default', plan: currentPlan })
                                    }
                                    className="gap-2"
                                >
                                    <Star
                                        className="text-muted-foreground size-4"
                                        aria-hidden="true"
                                    />
                                    Definir como padrão
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={() => setConfirm({ kind: 'plan', plan: currentPlan })}
                                className="text-destructive focus:text-destructive gap-2"
                            >
                                <Trash2 className="size-4" aria-hidden="true" />
                                Excluir plano
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Lista em árvore seguindo o padrão das tabelas do sistema */}
                {visibleAccounts.length === 0 ? (
                    <p className="text-muted-foreground py-6 text-center text-sm">
                        {sortedAccounts.length === 0
                            ? 'Plano sem contas. Clique em "Nova conta" para começar.'
                            : 'Nenhuma conta encontrada com o termo informado.'}
                    </p>
                ) : (
                    <ul className="space-y-1">
                        {visibleAccounts.map((account, index) => {
                            const isSynthetic = account.accountType === 'SYNTHETIC';
                            const hasChildren = parentIdsSet.has(account.id);
                            const isCollapsed = collapsedIds.has(account.id);
                            const indentPx = Math.max(0, account.level - 1) * 20;

                            return (
                                <li key={account.id} style={{ paddingLeft: `${indentPx}px` }}>
                                    {index > 0 && <Divider className="my-1 mr-3 ml-12" />}
                                    <button
                                        type="button"
                                        onClick={() => setAccountModal({ open: true, account })}
                                        aria-haspopup="dialog"
                                        className="group hover:bg-muted/50 focus-visible:ring-ring -mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-xl px-3 py-2 text-left focus-visible:ring-2 focus-visible:outline-none"
                                    >
                                        {/* Ícone expansor ou marcador de folha */}
                                        {hasChildren ? (
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    toggleCollapse(account.id);
                                                }}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.stopPropagation();
                                                        toggleCollapse(account.id);
                                                    }
                                                }}
                                                className="bg-primary/10 text-primary hover:bg-primary/20 flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
                                                title={isCollapsed ? 'Expandir' : 'Recolher'}
                                                aria-label={
                                                    isCollapsed
                                                        ? `Expandir conta ${account.name}`
                                                        : `Recolher conta ${account.name}`
                                                }
                                            >
                                                {isCollapsed ? (
                                                    <ChevronRight
                                                        className="size-4 shrink-0"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    <ChevronDown
                                                        className="size-4 shrink-0"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full">
                                                <FileText className="size-4" aria-hidden="true" />
                                            </div>
                                        )}

                                        {/* Informações da conta */}
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={cn(
                                                    'text-foreground truncate text-sm',
                                                    isSynthetic ? 'font-semibold' : 'font-medium',
                                                )}
                                            >
                                                <span className="font-mono text-xs">
                                                    {account.code}
                                                </span>{' '}
                                                {account.name}
                                            </p>
                                            <p className="text-muted-foreground flex items-center gap-2 text-xs">
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2 py-0.5 text-[11px] font-medium',
                                                        isSynthetic
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    {ACCOUNT_TYPE_LABELS[account.accountType]}
                                                </span>
                                                <span>·</span>
                                                <span>{NATURE_LABELS[account.nature]}</span>
                                            </p>
                                        </div>

                                        {/* Status da conta */}
                                        <span
                                            className={cn(
                                                'rounded-full px-2 py-0.5 text-[11px] font-medium',
                                                account.isActive
                                                    ? 'bg-positive/10 text-positive'
                                                    : 'bg-muted text-muted-foreground',
                                            )}
                                        >
                                            {account.isActive ? 'Ativa' : 'Inativa'}
                                        </span>

                                        {/* Indicador de clique para editar */}
                                        <ChevronRight
                                            className="text-muted-foreground size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {/* Modal de Nova Conta / Editar Conta */}
                {accountModal.open && (
                    <Dialog
                        open
                        onOpenChange={open =>
                            !open && setAccountModal({ open: false, account: undefined })
                        }
                    >
                        <DialogContent className={MODAL_CLASS}>
                            <DialogHeader>
                                <StepTitle>
                                    {accountModal.account ? 'Editar conta' : 'Nova conta'}
                                </StepTitle>
                            </DialogHeader>
                            <AccountForm
                                key={
                                    accountModal.account?.id ??
                                    accountModal.defaultParentId ??
                                    'new'
                                }
                                planId={currentPlan.id}
                                accounts={accounts}
                                defaultParentId={accountModal.defaultParentId}
                                account={accountModal.account}
                                footerStart={
                                    accountModal.account
                                        ? deleteAccountButton(accountModal.account)
                                        : undefined
                                }
                                onSuccess={async () => {
                                    setAccountModal({ open: false });
                                    await refreshAccounts();
                                    router.refresh();
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                )}

                {/* Modal de Editar Plano */}
                {editingPlan && (
                    <Dialog open onOpenChange={open => !open && setEditingPlan(false)}>
                        <DialogContent className={MODAL_CLASS}>
                            <DialogHeader>
                                <StepTitle>Editar plano</StepTitle>
                            </DialogHeader>
                            <PlanForm
                                action={updatePlanAction.bind(null, currentPlan.id)}
                                plan={currentPlan}
                                onSuccess={() => {
                                    setEditingPlan(false);
                                    router.refresh();
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                )}

                {/* Diálogo de confirmação para exclusões */}
                <ConfirmationDialog
                    open={confirm !== null}
                    onOpenChange={open => !open && setConfirm(null)}
                    title={
                        confirm?.kind === 'default'
                            ? 'Definir plano padrão'
                            : confirm?.kind === 'account'
                              ? 'Excluir conta'
                              : 'Excluir plano'
                    }
                    description={
                        confirm?.kind === 'default'
                            ? `Usar o plano ${confirm.plan.name} como padrão nos relatórios e no fechamento do período?`
                            : confirm?.kind === 'account'
                              ? `Excluir ${confirm.account.code} ${confirm.account.name}? Contas com movimento ou com filhas não podem ser excluídas.`
                              : `Excluir o plano ${confirm?.plan.name ?? ''}? O plano padrão só pode ser excluído depois de escolher outro. Planos com contas em uso não podem ser excluídos.`
                    }
                    confirmLabel={confirm?.kind === 'default' ? 'Definir' : 'Excluir'}
                    variant={confirm?.kind === 'default' ? 'default' : 'destructive'}
                    onConfirm={handleConfirmDelete}
                />
            </section>
        </div>
    );
}
