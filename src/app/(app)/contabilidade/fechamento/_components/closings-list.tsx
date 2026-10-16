import { Divider } from '@/lib/_components/divider';
import { formatMonth } from '@/lib/_utils/dates';
import { formatDate } from '@/lib/_utils/title-labels';
import { Lock } from 'lucide-react';

type Closing = { id: string; month: string; throughDate: string; closingEntryId: string | null };

/** Fechamentos do mais recente ao mais antigo, no padrão das demais listas; o primeiro é o que pode ser reaberto. */
export function ClosingsList({ items }: { items: Closing[] }) {
    const sorted = [...items].sort((a, b) => b.month.localeCompare(a.month));

    return (
        <section className="bg-card rounded-2xl p-5 shadow-sm">
            <ul className="space-y-1">
                {sorted.map((item, index) => (
                    <li key={item.id}>
                        {index > 0 && <Divider className="my-1 mr-3 ml-12" />}
                        <div className="flex items-center gap-3 py-2">
                            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full">
                                <Lock className="size-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-foreground text-sm font-medium">
                                    {formatMonth(item.month)}
                                </p>
                                <p className="text-muted-foreground flex items-center gap-2 text-xs">
                                    {item.closingEntryId ? 'Com apuração do resultado' : 'Mensal'}
                                    {index === 0 && (
                                        <span className="bg-muted rounded-full px-2 py-0.5 text-[11px]">
                                            Último fechamento
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 pr-3">
                                <span className="text-foreground text-sm font-semibold">
                                    {formatDate(item.throughDate)}
                                </span>
                                <span className="text-muted-foreground text-xs">Travado até</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
