'use client';

import { buildPageWindow, pageCount, pageRange } from '@/lib/_utils/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

type PaginationProps = {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
};

/** Controles de paginação para listagens no envelope `{items, page, pageSize, total}`. */
export function Pagination({
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    const totalPages = pageCount(total, pageSize);
    const { from, to } = pageRange(page, pageSize, total);

    return (
        <nav
            aria-label="Paginação"
            className="flex flex-col items-center justify-between gap-3 md:flex-row"
        >
            <p className="text-muted-foreground text-sm">
                Mostrando {from}–{to} de {total}
            </p>

            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Página anterior"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <ChevronLeft />
                </Button>

                {buildPageWindow(page, totalPages).map((item, index) =>
                    item === 'gap' ? (
                        <span key={`gap-${index}`} className="text-muted-foreground px-2">
                            …
                        </span>
                    ) : (
                        <Button
                            key={item}
                            variant={item === page ? 'default' : 'outline'}
                            size="icon"
                            aria-label={`Página ${item}`}
                            aria-current={item === page ? 'page' : undefined}
                            onClick={() => onPageChange(item)}
                        >
                            {item}
                        </Button>
                    ),
                )}

                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Próxima página"
                    disabled={page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    <ChevronRight />
                </Button>
            </div>

            {onPageSizeChange && (
                <Select value={String(pageSize)} onValueChange={v => onPageSizeChange(Number(v))}>
                    <SelectTrigger className="w-28" aria-label="Itens por página">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PAGE_SIZE_OPTIONS.map(size => (
                            <SelectItem key={size} value={String(size)}>
                                {size} / página
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </nav>
    );
}
