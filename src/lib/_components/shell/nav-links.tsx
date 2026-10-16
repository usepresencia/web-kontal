'use client';

import { cn } from '@/lib/_utils/cn';
import type { NavItem } from '@/lib/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Links do menu, com o item da rota atual destacado. */
export function NavLinks({ items }: { items: NavItem[] }) {
    const pathname = usePathname();

    return (
        <nav aria-label="Principal" className="flex flex-col gap-1">
            {items.map(({ label, href, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                    <Link
                        key={href}
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                            active
                                ? 'bg-sidebar-muted text-sidebar-primary'
                                : 'text-sidebar-foreground hover:bg-sidebar-muted',
                        )}
                    >
                        <Icon className="size-4" aria-hidden="true" />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
