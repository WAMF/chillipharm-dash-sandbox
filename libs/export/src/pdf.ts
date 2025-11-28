import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
    filename: string;
    title?: string;
    orientation?: 'portrait' | 'landscape';
    format?: 'a4' | 'letter';
    margin?: number;
}

const PDF_DEFAULTS = {
    margin: 20,
    titleFontSize: 18,
    headerFontSize: 12,
    bodyFontSize: 10,
    lineHeight: 7,
};

export async function exportToPdf(
    element: HTMLElement,
    options: PdfExportOptions
): Promise<void> {
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: options.orientation || 'landscape',
        unit: 'mm',
        format: options.format || 'a4',
    });

    const margin = options.margin ?? PDF_DEFAULTS.margin;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    let yOffset = margin;

    if (options.title) {
        pdf.setFontSize(PDF_DEFAULTS.titleFontSize);
        pdf.text(options.title, pageWidth / 2, yOffset, { align: 'center' });
        yOffset += 15;
    }

    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= contentHeight - (yOffset - margin)) {
        pdf.addImage(imgData, 'PNG', margin, yOffset, imgWidth, imgHeight);
    } else {
        let remainingHeight = imgHeight;
        let sourceY = 0;
        const sourceWidth = canvas.width;

        while (remainingHeight > 0) {
            const availableHeight = contentHeight - (yOffset - margin);
            const sliceHeight = Math.min(availableHeight, remainingHeight);
            const sourceSliceHeight = (sliceHeight / imgWidth) * sourceWidth;

            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = sourceWidth;
            sliceCanvas.height = sourceSliceHeight;

            const ctx = sliceCanvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(
                    canvas,
                    0,
                    sourceY,
                    sourceWidth,
                    sourceSliceHeight,
                    0,
                    0,
                    sourceWidth,
                    sourceSliceHeight
                );
            }

            const sliceImgData = sliceCanvas.toDataURL('image/png');
            pdf.addImage(
                sliceImgData,
                'PNG',
                margin,
                yOffset,
                imgWidth,
                sliceHeight
            );

            remainingHeight -= sliceHeight;
            sourceY += sourceSliceHeight;

            if (remainingHeight > 0) {
                pdf.addPage();
                yOffset = margin;
            }
        }
    }

    const filename = options.filename.endsWith('.pdf')
        ? options.filename
        : `${options.filename}.pdf`;

    pdf.save(filename);
}

export function createPdfFromData<T extends Record<string, unknown>>(
    data: T[],
    columns: Array<{ key: keyof T; header: string }>,
    options: PdfExportOptions
): void {
    const pdf = new jsPDF({
        orientation: options.orientation || 'landscape',
        unit: 'mm',
        format: options.format || 'a4',
    });

    const margin = options.margin ?? PDF_DEFAULTS.margin;
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yOffset = margin;

    if (options.title) {
        pdf.setFontSize(PDF_DEFAULTS.titleFontSize);
        pdf.text(options.title, pageWidth / 2, yOffset, { align: 'center' });
        yOffset += 15;
    }

    pdf.setFontSize(PDF_DEFAULTS.headerFontSize);
    const colWidth = (pageWidth - margin * 2) / columns.length;

    columns.forEach((col, index) => {
        pdf.text(col.header, margin + index * colWidth, yOffset);
    });

    yOffset += PDF_DEFAULTS.lineHeight;
    pdf.setFontSize(PDF_DEFAULTS.bodyFontSize);

    data.forEach(row => {
        if (yOffset > pdf.internal.pageSize.getHeight() - margin) {
            pdf.addPage();
            yOffset = margin;
        }

        columns.forEach((col, index) => {
            const value = String(row[col.key] ?? '');
            const truncated =
                value.length > 30 ? value.substring(0, 27) + '...' : value;
            pdf.text(truncated, margin + index * colWidth, yOffset);
        });

        yOffset += PDF_DEFAULTS.lineHeight;
    });

    const filename = options.filename.endsWith('.pdf')
        ? options.filename
        : `${options.filename}.pdf`;

    pdf.save(filename);
}
