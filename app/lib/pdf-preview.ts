import { PDFDocument } from "pdf-lib";
import {
  MAX_FILE_SIZE,
  SUPPORTED_MIME_TYPES,
  ERROR_MESSAGES,
  PdfMergerError,
} from "@/types/pdf-merger";

/**
 * Validates a PDF file
 */
export function validatePdfFile(file: File): PdfMergerError | null {
  // Check file type
  const isValidType =
    SUPPORTED_MIME_TYPES.includes(file.type) || file.name.endsWith(".pdf");

  if (!isValidType) {
    return {
      code: "INVALID_FILE_TYPE",
      message: ERROR_MESSAGES.INVALID_FILE_TYPE,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      code: "FILE_TOO_LARGE",
      message: ERROR_MESSAGES.FILE_TOO_LARGE,
    };
  }

  return null;
}

/**
 * Gets the page count from a PDF file
 */
export async function getPdfPageCount(file: File): Promise<number> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error("Error getting PDF page count:", error);
    throw new Error("Failed to get PDF page count");
  }
}

/**
 * Generates a preview image from a PDF file page
 * @param file - PDF file
 * @param pageNumber - Page number (1-indexed), defaults to 1
 */
export async function generatePdfPreview(
  file: File,
  pageNumber: number = 1
): Promise<string | null> {
  try {
    // Ensure we're on the client side
    if (typeof window === "undefined") {
      return null;
    }

    // Dynamically import pdfjs-dist
    const pdfjs = await import("pdfjs-dist");
    // Use unpkg CDN which has better version coverage
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Get the specified page (default to first page)
    const page = await pdf.getPage(pageNumber);

    // Set up canvas for rendering
    const scale = 1.5;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render the page
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderContext: any = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;

    // Convert canvas to data URL
    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error generating PDF preview:", error);
    return null;
  }
}
