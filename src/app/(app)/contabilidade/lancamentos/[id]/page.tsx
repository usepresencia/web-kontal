import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/lib/_components/ui/table';
import { formatAmount } from '@/lib/_utils/money';
import { formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { journalDetailSchema } from '@/lib/api/schemas/journal';
import Link from 'next/link';
import { z } from 'zod';
import { ReverseForm } from '../_components/reverse-form';

export default async function JournalEntryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    z.uuid().parse(id);
    const entry = await apiFetch(`/journal-entries/${id}`, journalDetailSchema);
    const canReverse = entry.referenceType === 'MANUAL' && !entry.reversedBy;

    return (
        <div className="max-w-4xl space-y-8">
            <header className="space-y-1">
                <Link
                    href="/contabilidade/lancamentos"
                    className="text-muted-foreground text-sm underline"
                >
                    ← Lançamentos
                </Link>
                <h1 className="text-2xl font-bold">
                    Nº {entry.number} · {entry.description}
                </h1>
                <p className="text-muted-foreground text-sm">{formatDate(entry.date)}</p>
            </header>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Conta</TableHead>
                        <TableHead>Histórico</TableHead>
                        <TableHead className="text-right">Débito</TableHead>
                        <TableHead className="text-right">Crédito</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entry.lines.map((line, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <span className="font-mono text-sm">{line.accountCode}</span>{' '}
                                {line.accountName}
                            </TableCell>
                            <TableCell className="text-muted-foreground">{line.memo}</TableCell>
                            <TableCell className="text-right">{formatAmount(line.debit)}</TableCell>
                            <TableCell className="text-right">
                                {formatAmount(line.credit)}
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow className="bg-muted font-semibold">
                        <TableCell colSpan={2}>Totais</TableCell>
                        <TableCell className="text-right">
                            {formatAmount(entry.totalDebits)}
                        </TableCell>
                        <TableCell className="text-right">
                            {formatAmount(entry.totalCredits)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>

            {canReverse && <ReverseForm entryId={id} />}
        </div>
    );
}
