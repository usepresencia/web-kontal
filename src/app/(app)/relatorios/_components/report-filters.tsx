import { DatePickerField } from '@/lib/_components/date-picker-field';
import { FilterButton } from '@/lib/_components/filter-button';
import type { ReactNode } from 'react';

type ReportFiltersProps = {
    /** `period` mostra início e fim; `date` mostra uma data só (balanço). */
    mode: 'period' | 'date';
    start?: string;
    end: string;
    children?: ReactNode;
};

/** Filtros de um relatório, enviados por GET para a própria página. */
export function ReportFilters({ mode, start, end, children }: ReportFiltersProps) {
    return (
        <form method="get" className="flex flex-wrap items-end gap-3">
            {mode === 'period' && (
                <div className="space-y-1 text-sm">
                    <span className="text-muted-foreground">De</span>
                    <DatePickerField name="start" defaultValue={start} className="w-44" />
                </div>
            )}
            <div className="space-y-1 text-sm">
                <span className="text-muted-foreground">{mode === 'period' ? 'Até' : 'Data'}</span>
                <DatePickerField
                    name={mode === 'period' ? 'end' : 'date'}
                    defaultValue={end}
                    className="w-44"
                />
            </div>
            {children}
            <FilterButton label="Gerar" />
        </form>
    );
}
