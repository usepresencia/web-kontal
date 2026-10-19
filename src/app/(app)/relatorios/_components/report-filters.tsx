import { DatePickerField } from '@/lib/_components/date-picker-field';
import { FilterButton } from '@/lib/_components/filter-button';
import { FILTER_PILL_CLASS, FilterField } from '@/lib/_components/filter-field';
import { FilterForm } from '@/lib/_components/filter-form';
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
        <FilterForm className="flex flex-wrap items-end gap-3">
            {mode === 'period' && (
                <FilterField label="De">
                    <DatePickerField
                        name="start"
                        defaultValue={start}
                        className={`${FILTER_PILL_CLASS} w-36`}
                    />
                </FilterField>
            )}
            <FilterField label={mode === 'period' ? 'Até' : 'Data'}>
                <DatePickerField
                    name={mode === 'period' ? 'end' : 'date'}
                    defaultValue={end}
                    className={`${FILTER_PILL_CLASS} w-36`}
                />
            </FilterField>
            {children}
            <FilterButton />
        </FilterForm>
    );
}
