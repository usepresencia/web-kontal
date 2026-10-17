'use client';

import { buildPageWindow, pageCount } from '@/lib/_utils/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

type PaginationProps = {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
};

/** Botões de paginação, alinhados à direita, para listagens no envelope `{items, page, pageSize, total}`. */
export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
    const totalPages = pageCount(total, pageSize);

    return (
        <nav aria-label="Paginação" className="flex items-center justify-end gap-1">
            <Button
                variant="outline"
                size="icon"
                className="size-8 [&_svg]:size-3.5"
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
                        className={item === page ? 'size-10' : 'size-8 text-xs'}
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
                className="size-8 [&_svg]:size-3.5"
                aria-label="Próxima página"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                <ChevronRight />
            </Button>
        </nav>
    );
}
