import { DatePickerField } from '@/lib/_components/date-picker-field';
import { MonthPickerField } from '@/lib/_components/month-picker-field';
import { Input } from '@/lib/_components/ui/input';
import { Label } from '@/lib/_components/ui/label';
import type { ComponentProps } from 'react';

type FormFieldProps = ComponentProps<typeof Input> & {
    label: string;
    name: string;
    errors?: string[];
    /** Unidade mostrada à direita dentro do campo (ex.: "%"). */
    suffix?: string;
};

/** Campo de formulário com rótulo e mensagens de erro ligadas por `aria-describedby`. */
export function FormField({ label, name, errors, suffix, ...props }: FormFieldProps) {
    const errorId = `${name}-error`;
    return (
        <div className="space-y-1.5">
            <Label htmlFor={name}>{label}</Label>
            {props.type === 'date' ? (
                <DatePickerField
                    name={name}
                    defaultValue={typeof props.defaultValue === 'string' ? props.defaultValue : ''}
                    aria-invalid={errors ? true : undefined}
                />
            ) : props.type === 'month' ? (
                <MonthPickerField
                    name={name}
                    defaultValue={typeof props.defaultValue === 'string' ? props.defaultValue : ''}
                    aria-invalid={errors ? true : undefined}
                />
            ) : (
                <div className="relative">
                    <Input
                        id={name}
                        name={name}
                        aria-invalid={errors ? true : undefined}
                        aria-describedby={errors ? errorId : undefined}
                        className={suffix ? 'pr-9' : undefined}
                        {...props}
                    />
                    {suffix && (
                        <span
                            className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm"
                            aria-hidden="true"
                        >
                            {suffix}
                        </span>
                    )}
                </div>
            )}
            {errors && (
                <p id={errorId} role="alert" className="text-negative text-sm">
                    {errors.join(' ')}
                </p>
            )}
        </div>
    );
}
