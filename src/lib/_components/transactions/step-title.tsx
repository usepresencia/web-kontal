import { DialogTitle } from '@/lib/_components/ui/dialog';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

type StepTitleProps = {
    children: ReactNode;
    /** Quando informado, mostra o chevron de voltar antes do título. */
    onBack?: () => void;
};

/** Título de uma etapa do modal, com o chevron de voltar antes do texto nas etapas seguintes. */
export function StepTitle({ children, onBack }: StepTitleProps) {
    return (
        <div className="flex items-center gap-1">
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Voltar"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted/50 -ml-2 rounded-full p-1"
                >
                    <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
            )}
            <DialogTitle>{children}</DialogTitle>
        </div>
    );
}
