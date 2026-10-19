import { cn } from '@/lib/_utils/cn';

/** Símbolo da Kontal: os dois losangos. */
export function LogoMark({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 40 32"
            className={cn('fill-sidebar-primary h-6 w-8 shrink-0', className)}
            aria-hidden="true"
        >
            <polygon points="12,0 40,0 28,12 0,12" />
            <polygon points="12,20 40,20 28,32 0,32" />
        </svg>
    );
}

/** Marca Kontal: o símbolo e o nome. */
export function Logo({ className }: { className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-2', className)}>
            <LogoMark />
            <span className="font-display text-xl font-bold tracking-tight">Kontal</span>
        </span>
    );
}
