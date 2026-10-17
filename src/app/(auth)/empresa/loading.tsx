import { LoadingOverlay } from '@/lib/_components/ui/loading-overlay';

/** Mostrado pelo Next enquanto a lista de empresas carrega no servidor. */
export default function Loading() {
    return <LoadingOverlay isLoading message="Carregando empresas…" />;
}
