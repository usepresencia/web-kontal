import { Button } from '@/lib/_components/ui/button';
import { Filter } from 'lucide-react';

/** Botão que envia um formulário de filtros: pílula em Accent, igual ao botão "Nova". */
export function FilterButton({ label = 'Filtrar' }: { label?: string }) {
    return (
        <Button
            type="submit"
            className="bg-accent text-accent-foreground hover:bg-accent/90 h-10 rounded-full px-6 font-semibold"
        >
            <Filter aria-hidden="true" />
            {label}
        </Button>
    );
}
