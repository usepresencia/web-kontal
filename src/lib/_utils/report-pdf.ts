import type { ReportDocument } from '@/lib/_components/reports/report-types';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const MARGIN = 14;
const INK: [number, number, number] = [32, 32, 32];
const MUTED: [number, number, number] = [110, 110, 110];
const POSITIVE: [number, number, number] = [22, 130, 70];
const NEGATIVE: [number, number, number] = [200, 50, 60];
const TOTAL_FILL: [number, number, number] = [236, 236, 230];
const INDENT_MM = 4;

/** Monta o PDF do relatório: título, período e uma tabela por bloco, com os mesmos números da tela. */
export function buildReportPdf(report: ReportDocument): jsPDF {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...INK);
    doc.text(report.title, MARGIN, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(report.period, MARGIN, 24);

    let y = 30;
    for (const section of report.sections) {
        if (section.title) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(...INK);
            doc.text(section.title, MARGIN, y + 4);
            y += 7;
        }
        if (section.note) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(...MUTED);
            const lines = doc.splitTextToSize(section.note, 182) as string[];
            doc.text(lines, MARGIN, y + 3);
            y += lines.length * 4 + 2;
        }
        autoTable(doc, {
            startY: y,
            margin: { left: MARGIN, right: MARGIN },
            head: [section.columns.map(column => column.label)],
            body: section.rows.map(row => row.cells),
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 1.8, textColor: INK },
            headStyles: { fontStyle: 'bold', textColor: MUTED, lineWidth: { bottom: 0.2 } },
            columnStyles: Object.fromEntries(
                section.columns.map((column, index) => [
                    index,
                    { halign: column.align === 'right' ? 'right' : 'left' },
                ]),
            ),
            didParseCell: data => {
                if (data.section === 'head') {
                    if (section.columns[data.column.index]?.align === 'right') {
                        data.cell.styles.halign = 'right';
                    }
                    return;
                }
                if (data.section !== 'body') return;
                const row = section.rows[data.row.index];
                if (row.kind === 'total') {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = TOTAL_FILL;
                }
                if (row.kind === 'group') data.cell.styles.fontStyle = 'bold';
                if (data.column.index === 0 && row.indent) {
                    data.cell.styles.cellPadding = {
                        top: 1.8,
                        bottom: 1.8,
                        right: 1.8,
                        left: 1.8 + row.indent * INDENT_MM,
                    };
                }
                if (row.tone && data.column.index === row.cells.length - 1) {
                    data.cell.styles.textColor = row.tone === 'positive' ? POSITIVE : NEGATIVE;
                }
            },
        });
        y =
            ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY ?? y) +
            8;
    }

    const pages = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    for (let page = 1; page <= pages; page += 1) {
        doc.setPage(page);
        doc.text(`Kontal · página ${page} de ${pages}`, MARGIN, 290);
    }
    return doc;
}
