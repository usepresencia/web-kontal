import { Home, type LucideIcon } from 'lucide-react';

export type NavItem = { label: string; href: string; icon: LucideIcon };

/** Itens do menu lateral; cada tela de migração acrescenta o seu item. */
export const NAV_ITEMS: NavItem[] = [{ label: 'Início', href: '/home', icon: Home }];
