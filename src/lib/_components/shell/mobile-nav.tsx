'use client';

import { Button } from '@/lib/_components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/lib/_components/ui/sheet';
import { NAV_ITEMS } from '@/lib/navigation';
import { Menu } from 'lucide-react';
import { Logo } from './logo';
import { NavLinks } from './nav-links';

/** Menu em gaveta para telas pequenas. */
export function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-sidebar text-sidebar-foreground w-64 gap-6">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <Logo className="px-2 pt-2" />
                <NavLinks items={NAV_ITEMS} />
            </SheetContent>
        </Sheet>
    );
}
