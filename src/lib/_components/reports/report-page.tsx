import type { ReactNode } from 'react';
import { GeneratePdfButton } from './generate-pdf-button';
import { ReportSections } from './report-sections';
import type { ReportDocument } from './report-types';

type ReportPageProps = {
    subtitle: string;
    report: ReportDocument;
    filters: ReactNode;
    /** Conteúdo exibido quando não há blocos (ex.: "Escolha uma conta"). */
    empty?: ReactNode;
    /** Busca o relatório completo para o PDF, quando a tela é paginada (Server Action já com os filtros). */
    loadFullReport?: () => Promise<ReportDocument | null>;
    /** Rodapé da tela, como a paginação. */
    footer?: ReactNode;
};

/** Tela de relatório: título, subtítulo e "Gerar PDF" no cabeçalho, filtros e os blocos do relatório. */
export function ReportPage({
    subtitle,
    report,
    filters,
    empty,
    loadFullReport,
    footer,
}: ReportPageProps) {
    const hasContent = report.sections.length > 0;

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{report.title}</h1>
                    <p className="text-muted-foreground text-sm">{subtitle}</p>
                </div>
                {hasContent && (
                    <GeneratePdfButton report={report} loadFullReport={loadFullReport} />
                )}
            </header>
            {filters}
            {hasContent ? <ReportSections sections={report.sections} /> : empty}
            {footer}
        </div>
    );
}
