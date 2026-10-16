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
    /** Rodapé da tela, como a paginação. */
    footer?: ReactNode;
};

/** Tela de relatório: título, subtítulo e "Gerar PDF" no cabeçalho, filtros e os blocos do relatório. */
export function ReportPage({ subtitle, report, filters, empty, footer }: ReportPageProps) {
    const hasContent = report.sections.length > 0;

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{report.title}</h1>
                    <p className="text-muted-foreground text-sm">{subtitle}</p>
                </div>
                {hasContent && <GeneratePdfButton report={report} />}
            </header>
            {filters}
            {hasContent ? <ReportSections sections={report.sections} /> : empty}
            {footer}
        </div>
    );
}
