import { cn } from '@/lib/_utils/cn';

/** Divisor padrão: linha fraca em degradê (10% da cor primária) que some para a direita. */
export function Divider({ className }: { className?: string }) {
    return (
        <div
            role="separator"
            className={cn('from-primary/10 h-px bg-linear-to-r from-50% to-transparent', className)}
        />
    );
}
