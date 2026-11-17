import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export interface PdfDownloadOptions {
  filename: string;
  orientation?: 'portrait' | 'landscape';
  marginMm?: number;
  fitSinglePage?: boolean;
}

/**
 * Captures any HTML element (including Bengali Unicode text & Tailwind v4 styles)
 * into a crisp A4 PDF and triggers an instant browser file download.
 */
export async function downloadElementAsPdf(
  element: HTMLElement | null,
  options: PdfDownloadOptions
): Promise<boolean> {
  if (!element) return false;

  const { filename, orientation = 'portrait', marginMm = 10, fitSinglePage = false } = options;
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  try {
    let dataUrl: string;
    try {
      dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
    } catch {
      // Fallback if external stylesheet CORS blocks font rule reading
      dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
        cacheBust: true,
      });
    }

    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (err) => reject(err);
    });

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const printableWidth = pageWidth - marginMm * 2;
    const printableHeight = pageHeight - marginMm * 2;

    let imgWidthMm = printableWidth;
    let imgHeightMm = (img.height * imgWidthMm) / img.width;

    if (fitSinglePage && imgHeightMm > printableHeight) {
      const scale = printableHeight / imgHeightMm;
      imgWidthMm = imgWidthMm * scale;
      imgHeightMm = printableHeight;
      const xOffset = marginMm + (printableWidth - imgWidthMm) / 2;
      pdf.addImage(dataUrl, 'PNG', xOffset, marginMm, imgWidthMm, imgHeightMm, undefined, 'FAST');
    } else if (imgHeightMm <= printableHeight) {
      // Fits cleanly on a single A4 page
      pdf.addImage(dataUrl, 'PNG', marginMm, marginMm, imgWidthMm, imgHeightMm, undefined, 'FAST');
    } else {
      // Multi-page pagination
      let heightLeft = imgHeightMm;
      let position = marginMm;

      pdf.addImage(dataUrl, 'PNG', marginMm, position, imgWidthMm, imgHeightMm, undefined, 'FAST');
      heightLeft -= printableHeight;

      while (heightLeft > 0) {
        position = position - pageHeight + marginMm * 2;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', marginMm, position, imgWidthMm, imgHeightMm, undefined, 'FAST');
        heightLeft -= printableHeight;
      }
    }

    pdf.save(safeFilename);
    return true;
  } catch (err) {
    console.error('PDF generation error:', err);
    return false;
  }
}
