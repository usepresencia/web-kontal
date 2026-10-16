'use client';

import { logoutAction } from '@/actions/session';
import { SidebarBody, useSidebar } from '@/lib/_components/ui/sidebar';
import { cn } from '@/lib/_utils/cn';
import { NAV_SECTIONS, type NavItem } from '@/lib/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoMark } from './logo';

/** Mostra o conteúdo só quando a sidebar está expandida (ou fixa, na gaveta do mobile). */
function useShowLabels() {
    const { open, animate } = useSidebar();
    return !animate || open;
}

function NavLinkButton({ title, href, icon: Icon }: NavItem) {
    const pathname = usePathname();
    const showLabels = useShowLabels();
    const active = pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            title={showLabels ? undefined : title}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'flex items-center gap-3 rounded-lg p-2 transition-colors',
                active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-muted',
            )}
        >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            {showLabels && <span className="text-sm whitespace-nowrap">{title}</span>}
        </Link>
    );
}

function SidebarContent({ userName }: { userName: string }) {
    const showLabels = useShowLabels();

    return (
        <div className="flex h-full flex-col justify-between gap-4">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                <div
                    className={cn(
                        'border-sidebar-border flex items-center gap-3 border-b pb-4',
                        !showLabels && 'justify-center',
                    )}
                >
                    <LogoMark />
                    <AnimatePresence>
                        {showLabels && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="font-display text-xl font-bold tracking-tight"
                            >
                                Kontal
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <nav aria-label="Principal" className="mt-4 flex flex-col gap-4">
                    {NAV_SECTIONS.map(section => (
                        <div key={section.title} className="flex flex-col gap-1">
                            {showLabels ? (
                                <p className="text-sidebar-foreground/60 mb-1 px-2 text-[10px] font-semibold tracking-wider uppercase">
                                    {section.title}
                                </p>
                            ) : (
                                <div
                                    className="bg-sidebar-border mx-2 my-1 h-px"
                                    aria-hidden="true"
                                />
                            )}
                            {section.items.map(item => (
                                <NavLinkButton key={item.href} {...item} />
                            ))}
                        </div>
                    ))}
                </nav>
            </div>

            <div className="border-sidebar-border border-t pt-4">
                <div className={cn('flex items-center gap-3', !showLabels && 'justify-center')}>
                    <div className="bg-sidebar-muted text-sidebar-primary ring-sidebar-primary/30 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2">
                        {userName.slice(0, 2).toUpperCase()}
                    </div>
                    {showLabels && (
                        <>
                            <p className="min-w-0 flex-1 truncate text-sm font-medium">
                                {userName}
                            </p>
                            <form action={logoutAction}>
                                <button
                                    type="submit"
                                    className="text-sidebar-foreground/70 hover:text-sidebar-foreground shrink-0"
                                    aria-label="Sair"
                                >
                                    <LogOut className="size-4" />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/** Menu lateral em grupos: recolhido em ícones no desktop, gaveta no mobile. */
export function Sidebar({ userName }: { userName: string }) {
    return (
        <SidebarBody>
            <SidebarContent userName={userName} />
        </SidebarBody>
    );
}
