'use client';

import { NAV_ITEMS } from '@/lib/navigation';
import { Logo } from './logo';
import { NavLinks } from './nav-links';

/** Menu lateral fixo (telas médias e maiores); cliente para que os ícones não cruzem a fronteira servidor/cliente. */
export function Sidebar() {
    return (
        <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border hidden w-60 shrink-0 flex-col gap-6 border-r p-4 md:flex">
            <Logo className="px-2 pt-2" />
            <NavLinks items={NAV_ITEMS} />
        </aside>
    );
}
