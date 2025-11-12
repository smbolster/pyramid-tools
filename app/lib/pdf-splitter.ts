/**
 * PDF Splitter utility functions
 * Provides functionality to split PDFs using various methods
 */

import { PDFDocument } from 'pdf-lib';
import type {
  SplitMethod,
  SplitConfig,
  SplitResult,
  SplitRange,
} from '@/types/pdf-splitter';
import {
  MAX_FILE_SIZE,
  MIN_PAGES_PER_FILE,
  MAX_PAGES_PER_FILE,
  ERROR_MESSAGES,
} from '@/types/pdf-splitter';

/**
 * Validates a PDF file for size and type
 * @param file - The file to validate
 * @returns Error object if invalid, null if valid
 */
export function validatePdfFile(file: File): Error | null {
  if (!file) {
    return new Error(ERROR_MESSAGES.NO_FILE);
  }

  if (file.size > MAX_FILE_SIZE) {
    return new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
  }

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return new Error(ERROR_MESSAGES.INVALID_FILE_TYPE);
  }

  return null;
}

/**
 * Parses a PDF file and returns a PDFDocument
 * @param file - The PDF file to parse
 * @returns Promise resolving to PDFDocument
 * @throws Error if parsing fails
 */
export async function parsePdfFile(file: File): Promise<PDFDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });
    return pdfDoc;
  } catch (error) {
    console.error('Failed to parse PDF:', error);
    throw new Error(ERROR_MESSAGES.PDF_PARSE_FAILED);
  }
}

/**
 * Removes the .pdf extension from a filename
 * @param filename - The filename to clean
 * @returns Filename without .pdf extension
 */
function cleanFilename(filename: string): string {
  return filename.replace(/\.pdf$/i, '');
}

/**
 * Sanitizes a filename by removing/replacing invalid characters
 * @param filename - The filename to sanitize
 * @returns Sanitized filename
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9_\-\.]/gi, '_')
    .replace(/_+/g, '_')
    .substring(0, 200);
}

/**
 * Generates a filename for a split PDF
 * @param originalName - Original filename (without extension)
 * @param part - Part number (1-indexed)
 * @param total - Total number of parts
 * @param pageRange - Optional page range string (e.g., "1-5")
 * @returns Generated filename with .pdf extension
 */
export function generateSplitFilename(
  originalName: string,
  part: number,
  total: number,
  pageRange?: string
): string {
  const cleanName = sanitizeFilename(cleanFilename(originalName));

  if (pageRange) {
    return `${cleanName}-pages-${pageRange}.pdf`;
  }

  if (total === 1) {
    return `${cleanName}-extracted.pdf`;
  }

  return `${cleanName}-part-${part}-of-${total}.pdf`;
}

/**
 * Generates a filename for a single page extraction
 * @param originalName - Original filename (without extension)
 * @param pageNumber - Page number (1-indexed)
 * @returns Generated filename
 */
function generateSinglePageFilename(originalName: string, pageNumber: number): string {
  const cleanName = sanitizeFilename(cleanFilename(originalName));
  return `${cleanName}-page-${pageNumber}.pdf`;
}

/**
 * Generates a filename for a custom range
 * @param originalName - Original filename (without extension)
 * @param range - The split range
 * @param index - Index of this range
 * @returns Generated filename
 */
function generateRangeFilename(
  originalName: string,
  range: SplitRange,
  index: number
): string {
  const cleanName = sanitizeFilename(cleanFilename(originalName));

  if (range.name) {
    const cleanRangeName = sanitizeFilename(range.name);
    return `${cleanName}-${cleanRangeName}.pdf`;
  }

  if (range.start === range.end) {
    return `${cleanName}-page-${range.start}.pdf`;
  }

  return `${cleanName}-pages-${range.start}-${range.end}.pdf`;
}

/**
 * Splits a PDF by extracting selected pages into a single new PDF
 * @param pdfDoc - The source PDF document
 * @param pageNumbers - Array of page numbers to extract (1-indexed)
 * @param originalFilename - Original filename for naming output
 * @returns Promise resolving to SplitResult
 */
export async function splitBySelectedPages(
  pdfDoc: PDFDocument,
  pageNumbers: number[],
  originalFilename: string
): Promise<SplitResult> {
  try {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(
      pdfDoc,
      pageNumbers.map(p => p - 1) // Convert to 0-indexed
    );

    copiedPages.forEach(page => {
      newPdf.addPage(page);
    });

    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

    // Generate page range string for filename
    const pageRangeStr = pageNumbers.join('-');
    const filename = generateSplitFilename(
      originalFilename,
      1,
      1,
      pageRangeStr
    );

    return {
      blob,
      filename,
      pageCount: pageNumbers.length,
      pageNumbers: [...pageNumbers],
      size: blob.size,
    };
  } catch (error) {
    console.error('Failed to split by selected pages:', error);
    throw new Error(ERROR_MESSAGES.PDF_SPLIT_FAILED);
  }
}

/**
 * Splits a PDF into individual pages (one PDF per page)
 * @param pdfDoc - The source PDF document
 * @param originalFilename - Original filename for naming outputs
 * @returns Promise resolving to array of SplitResults
 */
export async function splitIntoIndividualPages(
  pdfDoc: PDFDocument,
  originalFilename: string
): Promise<SplitResult[]> {
  try {
    const totalPages = pdfDoc.getPageCount();
    const results: SplitResult[] = [];

    for (let i = 0; i < totalPages; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const filename = generateSinglePageFilename(originalFilename, i + 1);

      results.push({
        blob,
        filename,
        pageCount: 1,
        pageNumbers: [i + 1],
        size: blob.size,
      });
    }

    return results;
  } catch (error) {
    console.error('Failed to split into individual pages:', error);
    throw new Error(ERROR_MESSAGES.PDF_SPLIT_FAILED);
  }
}

/**
 * Splits a PDF by custom page ranges
 * @param pdfDoc - The source PDF document
 * @param ranges - Array of page ranges to split by
 * @param originalFilename - Original filename for naming outputs
 * @returns Promise resolving to array of SplitResults
 */
export async function splitByRanges(
  pdfDoc: PDFDocument,
  ranges: SplitRange[],
  originalFilename: string
): Promise<SplitResult[]> {
  try {
    const results: SplitResult[] = [];

    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      const newPdf = await PDFDocument.create();

      // Build array of page indices for this range
      const pageIndices: number[] = [];
      const pageNumbers: number[] = [];
      for (let p = range.start; p <= range.end; p++) {
        pageIndices.push(p - 1); // 0-indexed for pdf-lib
        pageNumbers.push(p); // 1-indexed for display
      }

      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach(page => {
        newPdf.addPage(page);
      });

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const filename = generateRangeFilename(originalFilename, range, i);

      results.push({
        blob,
        filename,
        pageCount: pageNumbers.length,
        pageNumbers,
        size: blob.size,
      });
    }

    return results;
  } catch (error) {
    console.error('Failed to split by ranges:', error);
    throw new Error(ERROR_MESSAGES.PDF_SPLIT_FAILED);
  }
}

/**
 * Splits a PDF by fixed page count per file
 * @param pdfDoc - The source PDF document
 * @param pagesPerFile - Number of pages per output file
 * @param originalFilename - Original filename for naming outputs
 * @returns Promise resolving to array of SplitResults
 */
export async function splitByPageCount(
  pdfDoc: PDFDocument,
  pagesPerFile: number,
  originalFilename: string
): Promise<SplitResult[]> {
  try {
    const totalPages = pdfDoc.getPageCount();
    const totalFiles = Math.ceil(totalPages / pagesPerFile);
    const results: SplitResult[] = [];

    for (let fileIndex = 0; fileIndex < totalFiles; fileIndex++) {
      const startPage = fileIndex * pagesPerFile;
      const endPage = Math.min(startPage + pagesPerFile, totalPages);

      const newPdf = await PDFDocument.create();
      const pageIndices: number[] = [];
      const pageNumbers: number[] = [];

      for (let p = startPage; p < endPage; p++) {
        pageIndices.push(p); // 0-indexed
        pageNumbers.push(p + 1); // 1-indexed
      }

      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach(page => {
        newPdf.addPage(page);
      });

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const pageRangeStr = `${pageNumbers[0]}-${pageNumbers[pageNumbers.length - 1]}`;
      const filename = generateSplitFilename(
        originalFilename,
        fileIndex + 1,
        totalFiles,
        pageRangeStr
      );

      results.push({
        blob,
        filename,
        pageCount: pageNumbers.length,
        pageNumbers,
        size: blob.size,
      });
    }

    return results;
  } catch (error) {
    console.error('Failed to split by page count:', error);
    throw new Error(ERROR_MESSAGES.PDF_SPLIT_FAILED);
  }
}

/**
 * Validates a split configuration
 * @param config - The split configuration to validate
 * @param totalPages - Total number of pages in the PDF
 * @returns Error object if invalid, null if valid
 */
export function validateSplitConfig(
  config: SplitConfig,
  totalPages: number
): Error | null {
  switch (config.method) {
    case 'extract':
      if (!config.selectedPages || config.selectedPages.length === 0) {
        return new Error(ERROR_MESSAGES.NO_PAGES_SELECTED);
      }
      // Check all selected pages are within bounds
      for (const page of config.selectedPages) {
        if (page < 1 || page > totalPages) {
          return new Error(ERROR_MESSAGES.RANGE_OUT_OF_BOUNDS);
        }
      }
      break;

    case 'individual':
      // No additional validation needed
      break;

    case 'ranges':
      if (!config.ranges || config.ranges.length === 0) {
        return new Error(ERROR_MESSAGES.INVALID_RANGES);
      }
      // Validate each range
      for (const range of config.ranges) {
        if (range.start > range.end) {
          return new Error(ERROR_MESSAGES.RANGE_INVALID);
        }
        if (range.start < 1 || range.end > totalPages) {
          return new Error(ERROR_MESSAGES.RANGE_OUT_OF_BOUNDS);
        }
      }
      break;

    case 'page-count':
      if (!config.pagesPerFile) {
        return new Error(ERROR_MESSAGES.INVALID_PAGE_COUNT);
      }
      if (
        config.pagesPerFile < MIN_PAGES_PER_FILE ||
        config.pagesPerFile > MAX_PAGES_PER_FILE
      ) {
        return new Error(ERROR_MESSAGES.INVALID_PAGE_COUNT);
      }
      break;

    default:
      return new Error('Invalid split method');
  }

  return null;
}

/**
 * Estimates the number of resulting files from a split configuration
 * @param config - The split configuration
 * @param totalPages - Total number of pages in the PDF
 * @returns Estimated number of files
 */
export function estimateResultCount(config: SplitConfig, totalPages: number): number {
  switch (config.method) {
    case 'extract':
      return 1;

    case 'individual':
      return totalPages;

    case 'ranges':
      return config.ranges?.length || 0;

    case 'page-count':
      if (!config.pagesPerFile) return 0;
      return Math.ceil(totalPages / config.pagesPerFile);

    default:
      return 0;
  }
}

/**
 * Main function to split a PDF according to configuration
 * @param file - The PDF file to split
 * @param config - Split configuration
 * @returns Promise resolving to array of SplitResults
 */
export async function splitPdf(
  file: File,
  config: SplitConfig
): Promise<SplitResult[]> {
  // Validate file
  const fileError = validatePdfFile(file);
  if (fileError) {
    throw fileError;
  }

  // Parse PDF
  const pdfDoc = await parsePdfFile(file);
  const totalPages = pdfDoc.getPageCount();

  // Validate config
  const configError = validateSplitConfig(config, totalPages);
  if (configError) {
    throw configError;
  }

  const originalFilename = file.name;

  // Execute appropriate split method
  switch (config.method) {
    case 'extract':
      if (!config.selectedPages) {
        throw new Error(ERROR_MESSAGES.NO_PAGES_SELECTED);
      }
      return [await splitBySelectedPages(pdfDoc, config.selectedPages, originalFilename)];

    case 'individual':
      return await splitIntoIndividualPages(pdfDoc, originalFilename);

    case 'ranges':
      if (!config.ranges) {
        throw new Error(ERROR_MESSAGES.INVALID_RANGES);
      }
      return await splitByRanges(pdfDoc, config.ranges, originalFilename);

    case 'page-count':
      if (!config.pagesPerFile) {
        throw new Error(ERROR_MESSAGES.INVALID_PAGE_COUNT);
      }
      return await splitByPageCount(pdfDoc, config.pagesPerFile, originalFilename);

    default:
      throw new Error('Invalid split method');
  }
}
