'use client';

import { Button } from '@/lib/_components/ui/button';
import { ConfirmationDialog } from '@/lib/_components/ui/confirmation-dialog';
import { useRef, useState, type ComponentProps } from 'react';

type ConfirmSubmitButtonProps = Omit<ComponentProps<typeof Button>, 'type' | 'onClick'> & {
    confirmTitle: string;
    confirmDescription: string;
    confirmLabel?: string;
};

/** Botão de envio que, depois de validar o formulário, pede confirmação e só então o envia. */
export function ConfirmSubmitButton({
    confirmTitle,
    confirmDescription,
    confirmLabel = 'Confirmar',
    ...props
}: ConfirmSubmitButtonProps) {
    const ref = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                {...props}
                ref={ref}
                type="button"
                onClick={() => {
                    if (ref.current?.form?.reportValidity() !== false) setOpen(true);
                }}
            />
            <ConfirmationDialog
                open={open}
                onOpenChange={setOpen}
                title={confirmTitle}
                description={confirmDescription}
                confirmLabel={confirmLabel}
                onConfirm={() => ref.current?.form?.requestSubmit()}
            />
        </>
    );
}
