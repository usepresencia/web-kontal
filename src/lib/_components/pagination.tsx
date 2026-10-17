'use client';

import { DropdownSelect } from '@/lib/_components/dropdown-select';
import { cn } from '@/lib/_utils/cn';
import { buildPageWindow, pageCount } from '@/lib/_utils/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

type PaginationProps = {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    /** Quando informado, mostra à esquerda o dropdown de itens por página. */
    onPageSizeChange?: (pageSize: number) => void;
};

/** Paginação para listagens no envelope `{items, page, pageSize, total}`: itens por página à esquerda e botões à direita. */
export function Pagination({
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    const totalPages = pageCount(total, pageSize);

    return (
        <nav
            aria-label="Paginação"
            className={cn(
                'flex items-center gap-3',
                onPageSizeChange ? 'justify-between' : 'justify-end',
            )}
        >
            {onPageSizeChange && (
                <DropdownSelect
                    aria-label="Itens por página"
                    value={String(pageSize)}
                    onChange={value => onPageSizeChange(Number(value))}
                    className="w-36"
                    options={PAGE_SIZE_OPTIONS.map(size => ({
                        value: String(size),
                        label: `${size} / página`,
                    }))}
                />
            )}
            <div className="flex items-center gap-1">
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
            </div>
        </nav>
    );
}
