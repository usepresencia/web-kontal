/**
 * Camada de vidro fosco com um indicador que gira alternando entre círculo e quadrado
 * arredondado (squircle), mostrada sobre qualquer ação que precise aguardar.
 * Portado do LoadingOverlay do admin-photo: a animação é CSS puro (`squircle-spin`).
 */
export function LoadingOverlay({
    isLoading,
    message = 'Carregando…',
}: {
    isLoading: boolean;
    message?: string;
}) {
    if (!isLoading) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className="bg-background/60 fixed inset-0 z-100 flex flex-col items-center justify-center backdrop-blur-md"
        >
            <div className="bg-sidebar flex size-20 items-center justify-center rounded-3xl shadow-xl">
                <div className="squircle-spin bg-accent size-9" />
            </div>
            <p className="text-foreground mt-5 text-sm font-semibold">{message}</p>
        </div>
    );
}
