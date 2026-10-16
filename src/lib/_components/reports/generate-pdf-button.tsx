'use client';

import { useBusyRun } from '@/lib/_components/busy-provider';
import type { ReportDocument } from '@/lib/_components/reports/report-types';
import { Button } from '@/lib/_components/ui/button';
import { notify } from '@/lib/_utils/notify';
import { FileDown } from 'lucide-react';

type GeneratePdfButtonProps = {
    report: ReportDocument;
    /** Busca o relatório completo (todas as páginas); sem ela, o PDF traz o que está na tela. */
    loadFullReport?: () => Promise<ReportDocument | null>;
};

/** Botão "Gerar PDF": monta o PDF do relatório no navegador e o baixa. */
export function GeneratePdfButton({ report, loadFullReport }: GeneratePdfButtonProps) {
    const run = useBusyRun();

    const generate = async () => {
        try {
            await run(async () => {
                const full = loadFullReport ? await loadFullReport() : report;
                if (!full) throw new Error('Relatório indisponível');
                const { buildReportPdf } = await import('@/lib/_utils/report-pdf');
                buildReportPdf(full).save(`${full.filename}.pdf`);
            }, 'Gerando PDF…');
            notify('success', 'O PDF do relatório foi gerado com sucesso.', 'PDF gerado');
        } catch {
            notify('error', 'Não foi possível gerar o PDF. Tente novamente.');
        }
    };

    return (
        <Button type="button" onClick={() => void generate()}>
            <FileDown aria-hidden="true" />
            Gerar PDF
        </Button>
    );
}
