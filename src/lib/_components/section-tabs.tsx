import { cn } from '@/lib/_utils/cn';
import Link from 'next/link';

type SectionTab = { key: string; label: string; href: string };

type SectionTabsProps = { tabs: SectionTab[]; active: string; label: string };

/** Abas de uma tela, em links: a aba escolhida vem da URL, então funciona no servidor e sem JavaScript. */
export function SectionTabs({ tabs, active, label }: SectionTabsProps) {
    return (
        <nav aria-label={label} className="bg-muted/70 inline-flex rounded-full p-1">
            {tabs.map(tab => (
                <Link
                    key={tab.key}
                    href={tab.href}
                    aria-current={tab.key === active ? 'page' : undefined}
                    className={cn(
                        'h-9 rounded-full px-5 text-sm font-semibold transition-colors',
                        'inline-flex items-center justify-center',
                        tab.key === active
                            ? 'bg-card text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {tab.label}
                </Link>
            ))}
        </nav>
    );
}
