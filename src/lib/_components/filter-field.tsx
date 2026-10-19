import type { ReactNode } from 'react';

/** Estilo dos campos de filtro: pílula clara com sombra leve, como a busca do cabeçalho da home. */
export const FILTER_PILL_CLASS = 'bg-card h-10 rounded-full border-0 px-4 shadow-sm';

/** Campo de filtro com o rótulo recuado para começar onde termina o arredondamento da pílula. */
export function FilterField({ label, children }: { label: ReactNode; children: ReactNode }) {
    return (
        <div className="space-y-1 text-sm">
            <span className="text-muted-foreground block pl-4">{label}</span>
            {children}
        </div>
    );
}
