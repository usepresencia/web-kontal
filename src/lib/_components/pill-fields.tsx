'use client';

import { DatePickerField } from '@/lib/_components/date-picker-field';
import { Popover, PopoverContent, PopoverTrigger } from '@/lib/_components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/lib/_components/ui/select';
import { cn } from '@/lib/_utils/cn';
import { Check, ChevronDown } from 'lucide-react';
import { type ComponentProps, type ReactNode, useState } from 'react';

export const PILL_CLASS =
    'bg-background border-border h-10 rounded-full border px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring';

const NONE = '__none__';

export function FieldError({ errors }: { errors?: string[] }) {
    if (!errors) return null;
    return (
        <p role="alert" className="text-negative mt-1 pl-4 text-xs">
            {errors.join(' ')}
        </p>
    );
}

type PillFieldProps = ComponentProps<'input'> & {
    label: string;
    errors?: string[];
    /** Unidade mostrada à direita dentro do campo (ex.: "%"). */
    suffix?: string;
};

/** Campo de texto em pílula com rótulo pequeno e mensagem de erro. */
export function PillInput({
    label,
    errors,
    suffix,
    className,
    id,
    name,
    ...props
}: PillFieldProps) {
    const fieldId = id ?? name;
    return (
        <div className="min-w-0">
            <label
                htmlFor={fieldId}
                className="text-muted-foreground mb-1 block pl-4 text-xs font-medium"
            >
                {label}
            </label>
            {props.type === 'date' ? (
                <DatePickerField
                    key={
                        typeof (props.value ?? props.defaultValue) === 'string'
                            ? String(props.value ?? props.defaultValue)
                            : ''
                    }
                    id={fieldId}
                    name={name ?? fieldId ?? 'date'}
                    defaultValue={
                        typeof (props.value ?? props.defaultValue) === 'string'
                            ? String(props.value ?? props.defaultValue)
                            : ''
                    }
                    aria-invalid={errors ? true : undefined}
                    className={cn(PILL_CLASS, 'w-full justify-between', className)}
                />
            ) : (
                <div className="relative">
                    <input
                        id={fieldId}
                        name={name}
                        aria-invalid={errors ? true : undefined}
                        className={cn(PILL_CLASS, 'w-full', suffix && 'pr-9', className)}
                        {...props}
                    />
                    {suffix && (
                        <span
                            className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm"
                            aria-hidden="true"
                        >
                            {suffix}
                        </span>
                    )}
                </div>
            )}
            <FieldError errors={errors} />
        </div>
    );
}

type PillSelectProps = {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: ReactNode }[];
    placeholder?: string;
    /** Permite escolher "Nenhum" (valor vazio). */
    allowEmpty?: boolean;
    /** Texto da opção vazia (padrão "Nenhum"). */
    emptyLabel?: string;
    errors?: string[];
    /** Classes extras do botão do dropdown (ex.: a pílula clara dos filtros). */
    className?: string;
};

/** Seleção em pílula que envia o valor no formulário por um campo oculto. */
export function PillSelect({
    label,
    name,
    value,
    onChange,
    options,
    placeholder = 'Selecione',
    allowEmpty = false,
    emptyLabel = 'Nenhum',
    errors,
    className,
}: PillSelectProps) {
    return (
        <div className="min-w-0">
            <span className="text-muted-foreground mb-1 block pl-4 text-xs font-medium">
                {label}
            </span>
            <input type="hidden" name={name} value={value} />
            <Select
                value={value === '' && allowEmpty ? NONE : value}
                onValueChange={next => onChange(next === NONE ? '' : next)}
            >
                <SelectTrigger
                    aria-label={label}
                    className={cn(PILL_CLASS, 'w-full justify-between', className)}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {allowEmpty && <SelectItem value={NONE}>{emptyLabel}</SelectItem>}
                    {options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <FieldError errors={errors} />
        </div>
    );
}

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

type ComboboxOption = {
    value: string;
    label: ReactNode;
    /** Texto usado na busca (nome, código etc.); por padrão, o próprio `label` quando é string. */
    searchText?: string;
    /** Recuo em px só na lista aberta (ex.: nível na árvore do plano de contas); não afeta o valor selecionado. */
    indent?: number;
};

type PillComboboxProps = {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    options: ComboboxOption[];
    placeholder?: string;
    /** Permite escolher "Nenhum" (valor vazio). */
    allowEmpty?: boolean;
    /** Texto da opção vazia (padrão "Nenhum"). */
    emptyLabel?: string;
    errors?: string[];
    /** Classes extras do botão do dropdown (ex.: a pílula clara dos filtros). */
    className?: string;
    searchPlaceholder?: string;
};

/** Seleção em pílula com busca por texto, para listas longas (ex.: contas, clientes). */
export function PillCombobox({
    label,
    name,
    value,
    onChange,
    options,
    placeholder = 'Selecione',
    allowEmpty = false,
    emptyLabel = 'Nenhum',
    errors,
    className,
    searchPlaceholder = 'Buscar por nome ou código…',
}: PillComboboxProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const selected = options.find(option => option.value === value);
    const term = normalize(query.trim());
    const filtered =
        term === ''
            ? options
            : options.filter(option =>
                  normalize(
                      option.searchText ?? (typeof option.label === 'string' ? option.label : ''),
                  ).includes(term),
              );

    const choose = (next: string) => {
        onChange(next);
        setOpen(false);
        setQuery('');
    };

    return (
        <div className="min-w-0">
            <span className="text-muted-foreground mb-1 block pl-4 text-xs font-medium">
                {label}
            </span>
            <input type="hidden" name={name} value={value} />
            <Popover
                open={open}
                onOpenChange={next => {
                    setOpen(next);
                    if (!next) setQuery('');
                }}
            >
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        aria-label={label}
                        aria-haspopup="listbox"
                        className={cn(
                            PILL_CLASS,
                            'flex w-full items-center justify-between gap-2',
                            className,
                        )}
                    >
                        <span
                            className={cn(
                                'min-w-0 flex-1 truncate text-left',
                                !selected && 'text-muted-foreground',
                            )}
                        >
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
                    className="w-(--radix-popover-trigger-width) border-0 p-0 shadow-sm"
                    role="listbox"
                    aria-label={label}
                >
                    <div className="p-1.5">
                        <input
                            autoFocus
                            value={query}
                            onChange={event => setQuery(event.target.value)}
                            placeholder={searchPlaceholder}
                            className="placeholder:text-muted-foreground w-full rounded-md px-2 py-1.5 text-sm outline-none"
                        />
                    </div>
                    <div
                        role="separator"
                        className="via-border h-px bg-linear-to-r from-transparent to-transparent"
                    />
                    <div className="max-h-60 space-y-0.5 overflow-y-auto p-1.5">
                        {allowEmpty && (
                            <button
                                type="button"
                                role="option"
                                aria-selected={value === ''}
                                onClick={() => choose('')}
                                className="hover:bg-muted/50 flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm"
                            >
                                <span className="truncate">{emptyLabel}</span>
                                {value === '' && (
                                    <Check className="size-4 shrink-0" aria-hidden="true" />
                                )}
                            </button>
                        )}
                        {filtered.length === 0 ? (
                            <p className="text-muted-foreground px-3 py-2 text-sm">
                                Nenhum resultado
                            </p>
                        ) : (
                            filtered.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    aria-selected={option.value === value}
                                    onClick={() => choose(option.value)}
                                    className="hover:bg-muted/50 flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm"
                                    style={
                                        option.indent
                                            ? { paddingLeft: 12 + option.indent }
                                            : undefined
                                    }
                                >
                                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                                    {option.value === value && (
                                        <Check className="size-4 shrink-0" aria-hidden="true" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </PopoverContent>
            </Popover>
            <FieldError errors={errors} />
        </div>
    );
}
