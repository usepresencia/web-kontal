import { Button } from '@/lib/_components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/lib/_components/ui/table';
import { formatAmount } from '@/lib/_utils/money';
import { SERIES_KIND_LABELS, formatDate } from '@/lib/_utils/title-labels';
import { apiFetch } from '@/lib/api/client';
import { seriesDetailSchema } from '@/lib/api/schemas/title';
import Link from 'next/link';
import { z } from 'zod';
import { StatusBadge } from '../../_components/status-badge';
import { CancelSeriesButton, ExtendSeriesForm } from '../_components/series-actions';

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    z.uuid().parse(id);
    const series = await apiFetch(`/title-series/${id}`, seriesDetailSchema);

    return (
        <div className="max-w-4xl space-y-8">
            <header className="space-y-1">
                <Link href="/operacoes/series" className="text-muted-foreground text-sm underline">
                    ← Séries
                </Link>
                <h1 className="text-2xl font-bold">{series.baseDescription}</h1>
                <p className="text-muted-foreground text-sm">
                    {SERIES_KIND_LABELS[series.kind]} · {series.titles.length} ocorrências
                </p>
            </header>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Situação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {series.titles.map(title => (
                        <TableRow key={title.id}>
                            <TableCell>{title.seriesIndex}</TableCell>
                            <TableCell>{formatDate(title.expirationDate)}</TableCell>
                            <TableCell>{title.description}</TableCell>
                            <TableCell className="text-right">
                                {formatAmount(title.amount)}
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={title.status} />
                            </TableCell>
                            <TableCell className="text-right">
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/operacoes/titulos/${title.id}`}>Abrir</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <ExtendSeriesForm seriesId={id} />
            <CancelSeriesButton seriesId={id} />
        </div>
    );
}
