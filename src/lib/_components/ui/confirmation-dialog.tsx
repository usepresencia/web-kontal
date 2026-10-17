'use client';

import * as React from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/lib/_components/ui/alert-dialog';
import { buttonVariants } from '@/lib/_components/ui/button';

export interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    variant?: 'default' | 'destructive';
    icon?: React.ReactNode;
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    variant = 'default',
    icon,
}: ConfirmationDialogProps) {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await Promise.resolve(onConfirm());
            onOpenChange(false);
        } catch {
            // onConfirm é responsável por mostrar o feedback de erro via toast
            // dialog permanece aberto para o usuário tentar novamente
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                    {icon && (
                        <div
                            className="border-border flex size-9 shrink-0 items-center justify-center rounded-full border"
                            aria-hidden="true"
                        >
                            {icon}
                        </div>
                    )}
                    <AlertDialogHeader className={icon ? 'flex-1' : undefined}>
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                        <AlertDialogDescription>{description}</AlertDialogDescription>
                    </AlertDialogHeader>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={e => {
                            e.preventDefault();
                            void handleConfirm();
                        }}
                        disabled={isLoading}
                        className={
                            variant === 'destructive'
                                ? buttonVariants({ variant: 'destructive' })
                                : undefined
                        }
                    >
                        {isLoading ? 'Aguarde…' : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
