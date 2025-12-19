/**
 * PDF to Images Conversion Utility
 * Converts PDF pages to images for OCR processing
 */

import type { ConvertedPdfPage } from '@/types/handwriting-ocr';
import { MAX_PDF_PAGES, ERROR_MESSAGES } from '@/types/handwriting-ocr';

/**
 * Checks if a file is a PDF
 * @param file - The file to check
 * @returns True if file is a PDF
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Gets the page count from a PDF file
 * @param file - The PDF file
 * @returns Promise resolving to page count
 */
export async function getPdfPageCount(file: File): Promise<number> {
  if (typeof window === 'undefined') {
    throw new Error('PDF processing requires browser environment');
  }

  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  return pdf.numPages;
}

/**
 * Converts a single PDF page to an image
 * @param file - The PDF file
 * @param pageNumber - The page number (1-indexed)
 * @returns Promise resolving to ConvertedPdfPage
 */
export async function convertPdfPageToImage(
  file: File,
  pageNumber: number
): Promise<ConvertedPdfPage> {
  if (typeof window === 'undefined') {
    throw new Error('PDF processing requires browser environment');
  }

  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);

  // Use 2x scale for better OCR quality
  const scale = 2.0;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error(ERROR_MESSAGES.PDF_CONVERSION_FAILED);
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderContext: any = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;

  // Convert canvas to base64 PNG
  const dataUrl = canvas.toDataURL('image/png');
  const imageData = dataUrl.split(',')[1];

  return {
    pageNumber,
    imageData,
    mimeType: 'image/png',
  };
}

/**
 * Converts all pages of a PDF to images
 * @param file - The PDF file
 * @param maxPages - Maximum pages to convert (defaults to MAX_PDF_PAGES)
 * @returns Promise resolving to array of ConvertedPdfPage
 */
export async function convertPdfToImages(
  file: File,
  maxPages: number = MAX_PDF_PAGES
): Promise<ConvertedPdfPage[]> {
  const pageCount = await getPdfPageCount(file);

  if (pageCount > maxPages) {
    throw new Error(ERROR_MESSAGES.TOO_MANY_PAGES);
  }

  const pages: ConvertedPdfPage[] = [];

  for (let i = 1; i <= pageCount; i++) {
    try {
      const page = await convertPdfPageToImage(file, i);
      pages.push(page);
    } catch (error) {
      console.error(`Failed to convert page ${i}:`, error);
      throw new Error(`${ERROR_MESSAGES.PDF_CONVERSION_FAILED}: Page ${i}`);
    }
  }

  return pages;
}
