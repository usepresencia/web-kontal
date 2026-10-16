import { Card, CardContent, CardHeader, CardTitle } from '@/lib/_components/ui/card';
import { cn } from '@/lib/_utils/cn';
import { formatAmount } from '@/lib/_utils/money';

type SummaryCardProps = { title: string; amount: string; tone?: 'positive' | 'negative' | 'auto' };

/** Cartão com um valor financeiro; a cor segue o sinal quando o tom é automático. */
export function SummaryCard({ title, amount, tone }: SummaryCardProps) {
    const color =
        tone === 'auto'
            ? amount.startsWith('-')
                ? 'text-negative'
                : 'text-positive'
            : tone === 'negative'
              ? 'text-negative'
              : tone === 'positive'
                ? 'text-positive'
                : '';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className={cn('font-display text-2xl font-bold', color)}>
                    {formatAmount(amount)}
                </p>
            </CardContent>
        </Card>
    );
}
