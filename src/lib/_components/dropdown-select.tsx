'use client';

import { FIELD_TRIGGER_CLASS } from '@/lib/_components/date-picker-field';
import { Popover, PopoverContent, PopoverTrigger } from '@/lib/_components/ui/popover';
import { cn } from '@/lib/_utils/cn';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export type DropdownOption = { value: string; label: string };

type DropdownSelectProps = {
    options: DropdownOption[];
    /** Quando informado, o dropdown é controlado. */
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    /** Nome do campo oculto enviado no formulário. */
    name?: string;
    id?: string;
    placeholder?: string;
    className?: string;
    'aria-label'?: string;
    'aria-invalid'?: boolean;
};

/** Dropdown próprio (lista em popover) no padrão do web-presencia, no lugar do `<select>` nativo. */
export function DropdownSelect({
    options,
    value,
    defaultValue = '',
    onChange,
    name,
    id,
    placeholder = 'Selecione',
    className,
    ...aria
}: DropdownSelectProps) {
    const [inner, setInner] = useState(defaultValue);
    const [open, setOpen] = useState(false);
    const current = value ?? inner;
    const selected = options.find(option => option.value === current);

    const choose = (next: string) => {
        setInner(next);
        onChange?.(next);
        setOpen(false);
    };

    return (
        <>
            {name && <input type="hidden" name={name} value={current} />}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        id={id ?? name}
                        aria-haspopup="listbox"
                        className={cn(FIELD_TRIGGER_CLASS, className)}
                        {...aria}
                    >
                        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
                            {selected ? selected.label : placeholder}
                        </span>
                        <ChevronDown
                            className={cn(
                                'size-4 shrink-0 transition-transform',
                                open && 'rotate-180',
                            )}
                            aria-hidden="true"
                        />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="max-h-60 min-w-(--radix-popover-trigger-width) space-y-0.5 overflow-y-auto p-1.5"
                    role="listbox"
                >
                    {options.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={option.value === current}
                            onClick={() => choose(option.value)}
                            className="hover:bg-muted/50 flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm"
                        >
                            <span className="truncate">{option.label}</span>
                            {option.value === current && (
                                <Check className="size-4 shrink-0" aria-hidden="true" />
                            )}
                        </button>
                    ))}
                </PopoverContent>
            </Popover>
        </>
    );
}
