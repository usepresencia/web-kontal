import type { ReactNode } from 'react';

type EmptyStateProps = {
    title: string;
    description?: string;
    action?: ReactNode;
};

/** Mensagem exibida quando uma listagem não tem itens, no mesmo cartão das listas. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
    return (
        <section className="bg-card flex flex-col items-center gap-2 rounded-2xl px-5 py-10 text-center shadow-sm">
            <h3 className="font-display text-base font-semibold">{title}</h3>
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
            {action}
        </section>
    );
}
