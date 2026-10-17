import { cn } from '@/lib/_utils/cn';
import { formatAmount } from '@/lib/_utils/money';
import { Wallet } from 'lucide-react';

type ResultCardProps = {
    amount: string;
    /** Participação de receitas e despesas no movimento do mês; ausente sem movimento. */
    share: { first: number; second: number } | null;
};

/** Cartão escuro do resultado do mês, com a divisão entre receitas e despesas. */
export function ResultCard({ amount, share }: ResultCardProps) {
    const negative = amount.startsWith('-');

    return (
        <div className="bg-sidebar text-sidebar-foreground animate-fade-in flex flex-col justify-between rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <p className="text-sidebar-foreground/70 text-xs font-medium tracking-wide uppercase">
                    Resultado
                </p>
                <div className="bg-accent text-accent-foreground flex size-9 items-center justify-center rounded-full">
                    <Wallet className="size-4" aria-hidden="true" />
                </div>
            </div>
            <p
                className={cn(
                    'font-display my-4 text-2xl font-bold tracking-tight',
                    negative ? 'text-negative' : 'text-positive',
                )}
            >
                {formatAmount(amount)}
            </p>
            {share ? (
                <div className="space-y-2">
                    <div
                        className="flex h-2 overflow-hidden rounded-full"
                        role="img"
                        aria-label={`${share.first}% receitas, ${share.second}% despesas`}
                    >
                        <div className="bg-positive" style={{ width: `${share.first}%` }} />
                        <div className="bg-negative" style={{ width: `${share.second}%` }} />
                    </div>
                    <div className="text-sidebar-foreground/70 flex justify-between text-xs">
                        <span>{share.first}% receitas</span>
                        <span>{share.second}% despesas</span>
                    </div>
                </div>
            ) : (
                <p className="text-sidebar-foreground/70 text-xs">Sem movimento no mês</p>
            )}
        </div>
    );
}
