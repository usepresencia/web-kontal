'use client';

import { cn } from '@/lib/_utils/cn';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export type TitleType = 'INCOME' | 'EXPENSE';

const TYPES: { type: TitleType; label: string; icon: typeof ArrowUpCircle }[] = [
    { type: 'EXPENSE', label: 'Contas a pagar', icon: ArrowDownCircle },
    { type: 'INCOME', label: 'Contas a receber', icon: ArrowUpCircle },
];

type TitleTypeToggleProps = { value: TitleType; onChange: (type: TitleType) => void };

/** Seletor segmentado entre contas a pagar (vermelho) e contas a receber (verde). */
export function TitleTypeToggle({ value, onChange }: TitleTypeToggleProps) {
    return (
        <div
            role="radiogroup"
            aria-label="Tipo do título"
            className="bg-muted/70 flex rounded-full p-1"
        >
            {TYPES.map(({ type, label, icon: Icon }) => (
                <button
                    key={type}
                    type="button"
                    role="radio"
                    aria-checked={value === type}
                    onClick={() => onChange(type)}
                    className={cn(
                        'flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors',
                        value === type
                            ? cn(
                                  'bg-card shadow-sm',
                                  type === 'INCOME' ? 'text-positive' : 'text-negative',
                              )
                            : 'text-muted-foreground',
                    )}
                >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                </button>
            ))}
        </div>
    );
}
