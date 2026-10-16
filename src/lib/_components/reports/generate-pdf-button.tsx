'use client';

import { useBusyRun } from '@/lib/_components/busy-provider';
import type { ReportDocument } from '@/lib/_components/reports/report-types';
import { Button } from '@/lib/_components/ui/button';
import { notify } from '@/lib/_utils/notify';
import { FileDown } from 'lucide-react';

/** Botão "Gerar PDF": monta o PDF do relatório no navegador e o baixa. */
export function GeneratePdfButton({ report }: { report: ReportDocument }) {
    const run = useBusyRun();

    const generate = async () => {
        try {
            await run(async () => {
                const { buildReportPdf } = await import('@/lib/_utils/report-pdf');
                buildReportPdf(report).save(`${report.filename}.pdf`);
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
