'use client';

import { Label } from '@/lib/_components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/lib/_components/ui/select';
import { useState } from 'react';

const NONE = '__none__';

type SelectFieldProps = {
    label: string;
    name: string;
    options: { value: string; label: string }[];
    defaultValue?: string | null;
    placeholder?: string;
    /** Permite escolher "nenhum": o campo é enviado vazio. */
    allowEmpty?: boolean;
    errors?: string[];
    onValueChange?: (value: string) => void;
};

/** Campo de seleção que envia o valor escolhido no formulário (campo oculto com o `name`). */
export function SelectField({
    label,
    name,
    options,
    defaultValue,
    placeholder = 'Selecione',
    allowEmpty = false,
    errors,
    onValueChange,
}: SelectFieldProps) {
    const [value, setValue] = useState(defaultValue ?? (allowEmpty ? NONE : ''));
    const errorId = `${name}-error`;

    return (
        <div className="space-y-1.5">
            <Label htmlFor={name}>{label}</Label>
            <input type="hidden" name={name} value={value === NONE ? '' : value} />
            <Select
                value={value}
                onValueChange={next => {
                    setValue(next);
                    onValueChange?.(next === NONE ? '' : next);
                }}
            >
                <SelectTrigger
                    id={name}
                    aria-invalid={errors ? true : undefined}
                    aria-describedby={errors ? errorId : undefined}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {allowEmpty && <SelectItem value={NONE}>Nenhum</SelectItem>}
                    {options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {errors && (
                <p id={errorId} role="alert" className="text-negative text-sm">
                    {errors.join(' ')}
                </p>
            )}
        </div>
    );
}
