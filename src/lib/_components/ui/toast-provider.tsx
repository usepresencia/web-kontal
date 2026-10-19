'use client';

import { cn } from '@/lib/_utils/cn';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';
import { setToastDismiss, setToastShow } from './toast-registry';

type Variant = 'default' | 'success' | 'error' | 'warning';
type Position =
    'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastOptions {
    title?: string;
    message: string;
    variant?: Variant;
    duration?: number;
    position?: Position;
    actions?: { label: string; onClick: () => void; variant?: 'default' | 'outline' | 'ghost' };
    onDismiss?: () => void;
    highlightTitle?: boolean;
}

export interface ToasterRef {
    show: (opts: ToastOptions) => void;
}

const variantStyles: Record<Variant, string> = {
    default: 'bg-card border-primary/15 text-foreground',
    success: 'bg-card border-primary/15 text-foreground',
    error: 'bg-card border-destructive/15 text-foreground',
    warning: 'bg-card border-warning/15 text-foreground',
};

const titleColor: Record<Variant, string> = {
    default: 'text-foreground',
    success: 'text-primary',
    error: 'text-destructive',
    warning: 'text-warning',
};

const iconColor: Record<Variant, string> = {
    default: 'text-muted-foreground',
    success: 'text-primary',
    error: 'text-destructive',
    warning: 'text-warning',
};

const variantIcons: Record<Variant, React.ComponentType<{ className?: string }>> = {
    default: Info,
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
};

const toastAnimation = {
    initial: { opacity: 0, y: 50, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 50, scale: 0.95 },
};

const CustomToaster = forwardRef<ToasterRef, { defaultPosition?: Position }>(
    ({ defaultPosition = 'bottom-right' }, ref) => {
        useImperativeHandle(ref, () => ({
            show({
                title,
                message,
                variant = 'default',
                duration = 4000,
                position = defaultPosition,
                actions,
                onDismiss,
                highlightTitle,
            }) {
                const Icon = variantIcons[variant];

                sonnerToast.custom(
                    toastId => (
                        <motion.div
                            variants={toastAnimation}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className={cn(
                                'shadow-card flex w-full max-w-xs items-center justify-between rounded-(--radius) border p-3',
                                variantStyles[variant],
                            )}
                        >
                            <div className="flex items-start gap-2">
                                <Icon
                                    className={cn('mt-0.5 size-4 shrink-0', iconColor[variant])}
                                />
                                <div className="space-y-0.5">
                                    {title && (
                                        <h3
                                            className={cn(
                                                'text-xs leading-none font-medium',
                                                titleColor[variant],
                                                highlightTitle &&
                                                    variant === 'success' &&
                                                    'text-primary',
                                            )}
                                        >
                                            {title}
                                        </h3>
                                    )}
                                    <p className="text-muted-foreground text-xs">{message}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {actions?.label && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            actions.onClick();
                                            sonnerToast.dismiss(toastId);
                                        }}
                                        className={cn(
                                            'focus-visible:ring-ring cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline',
                                            variant === 'success' &&
                                                'bg-primary text-primary-foreground border border-transparent hover:opacity-90',
                                            variant === 'error' &&
                                                'border-destructive text-destructive hover:bg-destructive/10 border',
                                            variant === 'warning' &&
                                                'border-warning text-warning hover:bg-warning/10 border',
                                            variant === 'default' &&
                                                'border-border text-foreground hover:bg-muted border',
                                        )}
                                    >
                                        {actions.label}
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        sonnerToast.dismiss(toastId);
                                        onDismiss?.();
                                    }}
                                    className="hover:bg-muted/50 focus:ring-ring rounded-full p-1 transition-colors focus:ring-2 focus:outline-none"
                                    aria-label="Fechar notificação"
                                >
                                    <X className="text-muted-foreground size-3" />
                                </button>
                            </div>
                        </motion.div>
                    ),
                    { duration, position },
                );
            },
        }));

        return (
            <SonnerToaster
                position={defaultPosition}
                toastOptions={{ unstyled: true, className: 'flex justify-end' }}
            />
        );
    },
);

CustomToaster.displayName = 'CustomToaster';

export function ToastProvider() {
    const toasterRef = useRef<ToasterRef>(null);

    useEffect(() => {
        setToastShow((opts: ToastOptions) => toasterRef.current?.show(opts));
        setToastDismiss(() => sonnerToast.dismiss());
        return () => {
            setToastShow(null);
            setToastDismiss(null);
        };
    }, []);

    return <CustomToaster ref={toasterRef} defaultPosition="bottom-right" />;
}
