'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/lib/_components/ui/popover';
import { cn } from '@/lib/_utils/cn';
import { isoToLocalDate, toLocalIsoDate } from '@/lib/_utils/dates';
import { formatDate } from '@/lib/_utils/title-labels';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ptBR } from 'react-day-picker/locale';

export const FIELD_TRIGGER_CLASS =
    'border-input bg-background text-foreground focus-visible:ring-ring flex h-10 w-full items-center justify-between gap-2 rounded-md border px-3 text-left text-sm focus-visible:ring-2 focus-visible:outline-none';

export type DatePickerFieldProps = {
    name: string;
    id?: string;
    /** Data inicial em `YYYY-MM-DD`. */
    defaultValue?: string;
    placeholder?: string;
    /** Mostra o botão "Limpar" (para datas opcionais). */
    clearable?: boolean;
    className?: string;
    'aria-label'?: string;
    'aria-invalid'?: boolean;
    onChange?: (iso: string) => void;
};

/** Campo de data com o calendário (DayPicker) no estilo do web-presencia; envia `YYYY-MM-DD` no formulário. */
export function DatePickerField({
    name,
    id,
    defaultValue = '',
    placeholder = 'dd/mm/aaaa',
    clearable = false,
    className,
    onChange,
    ...aria
}: DatePickerFieldProps) {
    const [iso, setIso] = useState(defaultValue);
    const [open, setOpen] = useState(false);
    const selected = iso ? isoToLocalDate(iso) : undefined;

    const update = (next: string) => {
        setIso(next);
        onChange?.(next);
    };

    return (
        <>
            <input type="hidden" name={name} value={iso} />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        id={id ?? name}
                        className={cn(FIELD_TRIGGER_CLASS, className)}
                        {...aria}
                    >
                        <span className={cn(!iso && 'text-muted-foreground')}>
                            {iso ? formatDate(iso) : placeholder}
                        </span>
                        <Calendar className="size-4 shrink-0" aria-hidden="true" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="p-4">
                    <div className="rdp-root">
                        <DayPicker
                            mode="single"
                            selected={selected}
                            onSelect={date => {
                                update(date ? toLocalIsoDate(date) : '');
                                setOpen(false);
                            }}
                            defaultMonth={selected ?? new Date()}
                            locale={ptBR}
                            numberOfMonths={1}
                        />
                    </div>
                    {clearable && iso && (
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    update('');
                                    setOpen(false);
                                }}
                                className="border-input text-foreground hover:bg-muted rounded-lg border px-4 py-2 text-sm font-medium"
                            >
                                Limpar
                            </button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </>
    );
}
