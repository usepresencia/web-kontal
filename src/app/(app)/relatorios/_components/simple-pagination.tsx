'use client';

import { Pagination } from '@/lib/_components/pagination';
import { usePaginationQuery } from '@/lib/_hooks/use-pagination-query';

type SimplePaginationProps = { page: number; pageSize: number; total: number };

/** Paginação de relatório com tamanho de página fixo, controlada pela query da URL. */
export function SimplePagination({ page, pageSize, total }: SimplePaginationProps) {
    const { onPageChange } = usePaginationQuery();
    return <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />;
}
