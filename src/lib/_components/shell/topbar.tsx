import { logoutAction } from '@/actions/session';
import { Button } from '@/lib/_components/ui/button';
import { LogOut } from 'lucide-react';
import { MobileNav } from './mobile-nav';

type TopbarProps = { companyName: string; userName: string };

/** Barra superior com a empresa ativa, o usuário e o botão de sair. */
export function Topbar({ companyName, userName }: TopbarProps) {
    return (
        <header className="border-border bg-card flex items-center justify-between gap-4 border-b px-4 py-3">
            <div className="flex items-center gap-2">
                <MobileNav />
                <div>
                    <p className="font-display font-semibold">{companyName}</p>
                    <p className="text-muted-foreground text-xs">{userName}</p>
                </div>
            </div>
            <form action={logoutAction}>
                <Button type="submit" variant="ghost" size="sm">
                    <LogOut />
                    Sair
                </Button>
            </form>
        </header>
    );
}
