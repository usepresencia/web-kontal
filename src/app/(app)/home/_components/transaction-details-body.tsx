import { Badge } from '@/lib/_components/ui/badge';
import { Button } from '@/lib/_components/ui/button';
import { cn } from '@/lib/_utils/cn';
import { formatAmount } from '@/lib/_utils/money';
import {
    PAYMENT_METHOD_LABELS,
    TITLE_STATUS_LABELS,
    TITLE_TYPE_LABELS,
    formatDate,
} from '@/lib/_utils/title-labels';
import type { Title, TitleEntry } from '@/lib/api/schemas/title';
import { Check, Copy } from 'lucide-react';
import Link from 'next/link';

type TransactionDetailsBodyProps = {
    title: Title;
    ago: string;
    /** Baixas do título; null enquanto carregam. */
    entries: TitleEntry[] | null;
    copied: boolean;
    onCopy: () => void;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-foreground truncate text-sm">{children}</dd>
        </div>
    );
}

/** Conteúdo do modal de detalhes da transação (sem hooks, para testar com renderToStaticMarkup). */
export function TransactionDetailsBody({
    title,
    ago,
    entries,
    copied,
    onCopy,
}: TransactionDetailsBodyProps) {
    const income = title.type === 'INCOME';

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
                <Badge
                    variant="secondary"
                    className={cn(
                        'px-2 text-[10px] uppercase',
                        income ? 'bg-positive/15 text-positive' : 'bg-negative/15 text-negative',
                    )}
                >
                    {TITLE_TYPE_LABELS[title.type]}
                </Badge>
                <Badge variant="outline" className="px-2 text-[10px] uppercase">
                    {TITLE_STATUS_LABELS[title.status]}
                </Badge>
                {title.seriesIndex !== null && (
                    <Badge variant="outline" className="px-2 text-[10px] uppercase">
                        Parcela {title.seriesIndex}
                    </Badge>
                )}
                <span className="text-muted-foreground ml-auto text-xs">Criado {ago}</span>
            </div>

            <div>
                <p className="text-foreground text-base font-semibold">{title.description}</p>
                <p
                    className={cn(
                        'font-display text-2xl font-bold',
                        income ? 'text-positive' : 'text-negative',
                    )}
                >
                    {income ? '+' : '-'}
                    {formatAmount(title.amount)}
                </p>
            </div>

            <dl className="grid grid-cols-2 gap-3">
                <Field label="Preset">{title.presetName ?? '-'}</Field>
                <Field label="Juros mensais">
                    {Math.round(title.feesPercentageMonthly * 100)}%
                </Field>
                <Field label="Emissão">{formatDate(title.issueDate)}</Field>
                <Field label="Vencimento">{formatDate(title.expirationDate)}</Field>
                <Field label="Baixado">{formatAmount(title.settledAmount)}</Field>
                <Field label="Saldo em aberto">{formatAmount(title.remainingAmount)}</Field>
                <div className="col-span-2 flex items-center gap-2">
                    <Field label="ID do título">
                        <code className="font-mono text-xs">{title.id}</code>
                    </Field>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Copiar ID do título"
                        onClick={onCopy}
                    >
                        {copied ? <Check /> : <Copy />}
                    </Button>
                </div>
            </dl>

            <section className="space-y-2">
                <h3 className="text-foreground text-sm font-semibold">Baixas</h3>
                {entries === null ? (
                    <p className="text-muted-foreground text-sm">Carregando…</p>
                ) : entries.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhuma baixa registrada.</p>
                ) : (
                    <ul className="divide-border/40 divide-y">
                        {entries.map(entry => (
                            <li
                                key={entry.id}
                                className="flex items-center justify-between py-2 text-sm"
                            >
                                <span>
                                    {formatDate(entry.paidAt)}
                                    <span className="text-muted-foreground ml-2 text-xs">
                                        {entry.kind === 'WRITE_OFF'
                                            ? 'Perda'
                                            : (PAYMENT_METHOD_LABELS[
                                                  entry.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS
                                              ] ?? entry.paymentMethod)}
                                    </span>
                                </span>
                                <span className="font-medium">
                                    {formatAmount(entry.totalAmount)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <div className="flex justify-end">
                <Button asChild>
                    <Link href={`/operacoes/titulos/${title.id}`}>Abrir título completo</Link>
                </Button>
            </div>
        </div>
    );
}
