import { cn } from '@/lib/_utils/cn';

/** Marca Kontal: os dois losangos e o nome. */
export function Logo({ className }: { className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-2', className)}>
            <svg viewBox="0 0 40 32" className="fill-sidebar-primary h-6 w-8" aria-hidden="true">
                <polygon points="12,0 40,0 28,12 0,12" />
                <polygon points="12,20 40,20 28,32 0,32" />
            </svg>
            <span className="font-display text-xl font-bold tracking-tight">Kontal</span>
        </span>
    );
}
