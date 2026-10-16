'use client';

import { Pagination } from '@/lib/_components/pagination';
import {
    TransactionList,
    type TransactionRow,
} from '@/lib/_components/transactions/transaction-list';
import { usePaginationQuery } from '@/lib/_hooks/use-pagination-query';
import type { Page } from '@/lib/_utils/pagination';

type TitlesTableProps = {
    rows: TransactionRow[];
    page: Pick<Page<unknown>, 'page' | 'pageSize' | 'total'>;
};

/** Lista paginada de títulos no mesmo estilo das transações recentes; cada linha abre os detalhes. */
export function TitlesTable({ rows, page }: TitlesTableProps) {
    const pagination = usePaginationQuery();

    return (
        <section className="bg-card space-y-4 rounded-2xl p-5 shadow-sm">
            <TransactionList rows={rows} />
            <Pagination
                page={page.page}
                pageSize={page.pageSize}
                total={page.total}
                onPageChange={pagination.onPageChange}
                onPageSizeChange={pagination.onPageSizeChange}
                pageSizeLabel="Títulos por página:"
            />
        </section>
    );
}
