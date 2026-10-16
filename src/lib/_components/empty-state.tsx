import type { ReactNode } from 'react';

type EmptyStateProps = {
    title: string;
    description?: string;
    action?: ReactNode;
};

/** Mensagem exibida quando uma listagem não tem itens. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
    return (
        <div className="border-border bg-card flex flex-col items-center gap-2 rounded-lg border p-8 text-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && <p className="text-muted-foreground text-sm">{description}</p>}
            {action}
        </div>
    );
}
