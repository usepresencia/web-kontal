import { LoadingOverlay } from '@/lib/_components/ui/loading-overlay';

/** Mostrado pelo Next enquanto uma página do app carrega no servidor. */
export default function Loading() {
    return <LoadingOverlay isLoading />;
}
