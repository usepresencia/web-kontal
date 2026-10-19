import { Divider } from '@/lib/_components/divider';
import { FieldError } from '@/lib/_components/pill-fields';
import { cn } from '@/lib/_utils/cn';

type AmountInputProps = {
    name: string;
    label: string;
    /** Cor do "R$": verde para entrada, vermelho para saída. */
    tone: 'positive' | 'negative';
    errors?: string[];
    /** Valor inicial, como se digita (ex.: "1234,50"). */
    defaultValue?: string;
};

/** Campo de valor em destaque (R$ colorido e número grande), usado no cadastro e na baixa. */
export function AmountInput({ name, label, tone, errors, defaultValue }: AmountInputProps) {
    return (
        <div>
            <label
                htmlFor={name}
                className="text-muted-foreground block pl-4 text-xs font-semibold tracking-wide uppercase"
            >
                {label}
            </label>
            <div className="mt-1 flex items-baseline gap-2 pl-4">
                <span
                    className={cn(
                        'font-display text-2xl font-bold',
                        tone === 'positive' ? 'text-positive' : 'text-negative',
                    )}
                >
                    R$
                </span>
                <input
                    id={name}
                    name={name}
                    inputMode="decimal"
                    placeholder="0,00"
                    defaultValue={defaultValue}
                    autoComplete="off"
                    required
                    aria-invalid={errors ? true : undefined}
                    className="font-display placeholder:text-muted-foreground/40 w-full bg-transparent text-4xl font-bold outline-none"
                />
            </div>
            <Divider className="mt-1.5" />
            <FieldError errors={errors} />
        </div>
    );
}
