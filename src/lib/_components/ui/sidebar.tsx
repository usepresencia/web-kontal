'use client';

import { cn } from '@/lib/_utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 280;
const COLLAPSE_DELAY_MS = 300;
const EASE = [0.4, 0, 0.2, 1] as const;

type SidebarContextProps = { open: boolean; animate: boolean };

const SidebarContext = createContext<SidebarContextProps>({ open: false, animate: true });

/** Estado da sidebar: se está expandida e se a animação de recolher vale (desktop). */
export function useSidebar() {
    return useContext(SidebarContext);
}

type SidebarPartProps = { children: ReactNode; className?: string };

/** Sidebar de desktop: recolhida em ícones, expande ao passar o mouse. */
export function DesktopSidebar({ children, className }: SidebarPartProps) {
    const [open, setOpen] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    return (
        <SidebarContext.Provider value={{ open, animate: true }}>
            <motion.div
                onMouseEnter={() => {
                    clearTimeout(timerRef.current);
                    setOpen(true);
                }}
                onMouseLeave={() => {
                    timerRef.current = setTimeout(() => setOpen(false), COLLAPSE_DELAY_MS);
                }}
                className={cn(
                    'bg-sidebar text-sidebar-foreground relative hidden h-full shrink-0 md:flex',
                    className,
                )}
                animate={{ width: open ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
                transition={{ duration: 0.3, ease: EASE }}
            >
                <motion.div
                    className="flex size-full flex-col overflow-hidden p-4"
                    animate={{ width: open ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
                    transition={{ duration: 0.3, ease: EASE }}
                >
                    {children}
                </motion.div>
            </motion.div>
        </SidebarContext.Provider>
    );
}

/** Sidebar de telas pequenas: barra com botão de menu e gaveta. */
export function MobileSidebar({ children, className }: SidebarPartProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="bg-sidebar text-sidebar-foreground flex h-12 items-center px-4 md:hidden">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="hover:bg-sidebar-muted rounded-lg p-2"
                    aria-label="Abrir menu"
                >
                    <Menu className="size-5" />
                </button>
            </div>
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-overlay fixed inset-0 z-40 md:hidden"
                            aria-hidden
                            onClick={() => setOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className={cn(
                                'bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-50 flex w-72 flex-col p-6 md:hidden',
                                className,
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="hover:bg-sidebar-muted absolute top-4 right-4 rounded-lg p-1"
                                aria-label="Fechar menu"
                            >
                                <X className="size-5" />
                            </button>
                            <SidebarContext.Provider value={{ open: true, animate: false }}>
                                {children}
                            </SidebarContext.Provider>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

/** Mostra a sidebar de desktop e a de telas pequenas com o mesmo conteúdo. */
export function SidebarBody({ children, className }: SidebarPartProps) {
    return (
        <>
            <DesktopSidebar className={className}>{children}</DesktopSidebar>
            <MobileSidebar className={className}>{children}</MobileSidebar>
        </>
    );
}
