import { Input } from '@/lib/_components/ui/input';
import { Label } from '@/lib/_components/ui/label';
import type { ComponentProps } from 'react';

type FormFieldProps = ComponentProps<typeof Input> & {
    label: string;
    name: string;
    errors?: string[];
};

/** Campo de formulário com rótulo e mensagens de erro ligadas por `aria-describedby`. */
export function FormField({ label, name, errors, ...props }: FormFieldProps) {
    const errorId = `${name}-error`;
    return (
        <div className="space-y-1.5">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                aria-invalid={errors ? true : undefined}
                aria-describedby={errors ? errorId : undefined}
                {...props}
            />
            {errors && (
                <p id={errorId} role="alert" className="text-negative text-sm">
                    {errors.join(' ')}
                </p>
            )}
        </div>
    );
}
