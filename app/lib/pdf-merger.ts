import { PDFDocument } from "pdf-lib";
import { ERROR_MESSAGES } from "@/types/pdf-merger";

/**
 * Merges multiple PDF files into a single PDF
 */
export async function mergePdfs(files: File[]): Promise<Blob> {
  if (files.length === 0) {
    throw new Error(ERROR_MESSAGES.NO_FILES);
  }

  try {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each PDF file
    for (const file of files) {
      try {
        // Load the PDF file
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);

        // Copy all pages from the source PDF
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        // Add each page to the merged PDF
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        throw new Error(`${ERROR_MESSAGES.CORRUPTED_FILE}: ${file.name}`);
      }
    }

    // Serialize the merged PDF to bytes
    const mergedPdfBytes = await mergedPdf.save();

    // Convert to Blob
    return new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(ERROR_MESSAGES.MERGE_FAILED);
  }
}

/**
 * Generates a filename for the merged PDF
 */
export function generateMergedFilename(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  return `merged-pdfs-${timestamp}.pdf`;
}

/**
 * Formats file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
