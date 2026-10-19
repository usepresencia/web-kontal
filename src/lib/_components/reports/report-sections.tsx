import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/lib/_components/ui/table';
import { cn } from '@/lib/_utils/cn';
import type { ReportSection } from './report-types';

const INDENT_PX = 16;

/** Blocos do relatório, cada um num cartão no mesmo padrão das listas do app. */
export function ReportSections({ sections }: { sections: ReportSection[] }) {
    return (
        <div className="space-y-4">
            {sections.map((section, index) => (
                <section key={index} className="bg-card space-y-3 rounded-2xl p-5 shadow-sm">
                    {(section.title || section.note) && (
                        <div className="space-y-0.5">
                            {section.title && (
                                <h2 className="font-display text-base font-semibold">
                                    {section.title}
                                </h2>
                            )}
                            {section.note && (
                                <p className="text-muted-foreground text-sm">{section.note}</p>
                            )}
                        </div>
                    )}
                    <Table className="[&_tr]:border-primary/10 [&_td]:py-2.5 [&_tr]:hover:bg-transparent">
                        <TableHeader>
                            <TableRow>
                                {section.columns.map(column => (
                                    <TableHead
                                        key={column.label}
                                        className={cn(
                                            'text-xs',
                                            column.align === 'right' && 'text-right',
                                        )}
                                    >
                                        {column.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {section.rows.map((row, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    className={cn(
                                        row.kind === 'total' && 'bg-muted/60 font-semibold',
                                        row.kind === 'group' && 'font-semibold',
                                    )}
                                >
                                    {row.cells.map((cell, cellIndex) => (
                                        <TableCell
                                            key={cellIndex}
                                            className={cn(
                                                section.columns[cellIndex]?.align === 'right' &&
                                                    'text-right',
                                                cellIndex === row.cells.length - 1 &&
                                                    row.tone === 'positive' &&
                                                    'text-positive',
                                                cellIndex === row.cells.length - 1 &&
                                                    row.tone === 'negative' &&
                                                    'text-negative',
                                            )}
                                            style={
                                                cellIndex === 0 && row.indent
                                                    ? {
                                                          paddingLeft: `${16 + row.indent * INDENT_PX}px`,
                                                      }
                                                    : undefined
                                            }
                                        >
                                            {cell}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </section>
            ))}
        </div>
    );
}
