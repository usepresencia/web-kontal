'use client';

import { DatePickerField } from '@/lib/_components/date-picker-field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/lib/_components/ui/select';
import { cn } from '@/lib/_utils/cn';
import type { ComponentProps } from 'react';

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
                    id={fieldId}
                    name={name ?? fieldId ?? 'date'}
                    defaultValue={typeof props.defaultValue === 'string' ? props.defaultValue : ''}
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
    options: { value: string; label: string }[];
    placeholder?: string;
    /** Permite escolher "Nenhum" (valor vazio). */
    allowEmpty?: boolean;
    /** Texto da opção vazia (padrão "Nenhum"). */
    emptyLabel?: string;
    errors?: string[];
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
                    className={cn(PILL_CLASS, 'w-full justify-between')}
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
