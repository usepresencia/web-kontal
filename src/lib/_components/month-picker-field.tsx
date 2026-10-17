'use client';

import { FIELD_TRIGGER_CLASS } from '@/lib/_components/date-picker-field';
import { Popover, PopoverContent, PopoverTrigger } from '@/lib/_components/ui/popover';
import { cn } from '@/lib/_utils/cn';
import { formatMonth, monthAbbreviation } from '@/lib/_utils/dates';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

type MonthPickerFieldProps = {
    name: string;
    id?: string;
    /** Mês inicial em `YYYY-MM`. */
    defaultValue?: string;
    className?: string;
    'aria-invalid'?: boolean;
};

/** Campo de mês com a grade de meses no estilo do calendário; envia `YYYY-MM` no formulário. */
export function MonthPickerField({
    name,
    id,
    defaultValue = '',
    className,
    ...aria
}: MonthPickerFieldProps) {
    const [value, setValue] = useState(defaultValue);
    const [open, setOpen] = useState(false);
    const [year, setYear] = useState(() =>
        value ? Number(value.slice(0, 4)) : new Date().getFullYear(),
    );

    return (
        <>
            <input type="hidden" name={name} value={value} />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        id={id ?? name}
                        className={cn(FIELD_TRIGGER_CLASS, className)}
                        {...aria}
                    >
                        <span className={cn(!value && 'text-muted-foreground')}>
                            {value ? formatMonth(value) : 'mm/aaaa'}
                        </span>
                        <Calendar className="size-4 shrink-0" aria-hidden="true" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            aria-label="Ano anterior"
                            onClick={() => setYear(current => current - 1)}
                            className="hover:bg-muted rounded-md p-1"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <span className="text-sm font-semibold">{year}</span>
                        <button
                            type="button"
                            aria-label="Próximo ano"
                            onClick={() => setYear(current => current + 1)}
                            className="hover:bg-muted rounded-md p-1"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 12 }, (_, index) => {
                            const month = `${year}-${String(index + 1).padStart(2, '0')}`;
                            return (
                                <button
                                    key={month}
                                    type="button"
                                    onClick={() => {
                                        setValue(month);
                                        setOpen(false);
                                    }}
                                    aria-pressed={value === month}
                                    className={cn(
                                        'rounded-md px-2 py-2 text-sm capitalize transition-colors',
                                        value === month
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted',
                                    )}
                                >
                                    {monthAbbreviation(index)}
                                </button>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
}
