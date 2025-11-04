/**
 * Type definitions for PDF Splitter tool
 */

/**
 * Available split methods for dividing a PDF
 */
export type SplitMethod = 'extract' | 'individual' | 'ranges' | 'page-count';

/**
 * Status of the PDF splitting operation
 */
export enum SplitStatus {
  IDLE = 'IDLE',
  LOADING_PDF = 'LOADING_PDF',
  SPLITTING = 'SPLITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

/**
 * State for a single PDF page
 */
export interface PdfPageState {
  /** 1-indexed page number */
  pageNumber: number;
  /** Data URL of the thumbnail image, null if not yet generated */
  thumbnail: string | null;
  /** Whether this page is currently selected */
  selected: boolean;
  /** Width of the page in points */
  width: number;
  /** Height of the page in points */
  height: number;
  /** Whether the thumbnail is currently loading */
  isLoading: boolean;
}

/**
 * A page range for custom splitting
 */
export interface SplitRange {
  /** Start page number (1-indexed) */
  start: number;
  /** End page number (1-indexed, inclusive) */
  end: number;
  /** Optional custom name for the output file */
  name?: string;
}

/**
 * Result of a split operation - a single output PDF
 */
export interface SplitResult {
  /** The PDF file as a blob */
  blob: Blob;
  /** Generated filename for this PDF */
  filename: string;
  /** Number of pages in this PDF */
  pageCount: number;
  /** Array of page numbers (1-indexed) included in this PDF */
  pageNumbers: number[];
  /** Size of the file in bytes */
  size: number;
}

/**
 * Configuration for a split operation
 */
export interface SplitConfig {
  /** The split method to use */
  method: SplitMethod;
  /** Selected page numbers for 'extract' method (1-indexed) */
  selectedPages?: number[];
  /** Page ranges for 'ranges' method */
  ranges?: SplitRange[];
  /** Number of pages per file for 'page-count' method */
  pagesPerFile?: number;
}

/**
 * Complete state for the PDF Splitter component
 */
export interface PdfSplitterState {
  /** The uploaded PDF file */
  file: File | null;
  /** Original filename without extension */
  originalFilename: string | null;
  /** Total number of pages in the PDF */
  totalPages: number;
  /** Array of page states with thumbnails and selection */
  pages: PdfPageState[];
  /** Set of selected page numbers (1-indexed) */
  selectedPages: Set<number>;
  /** Currently selected split method */
  splitMethod: SplitMethod;
  /** Configuration for the current split method */
  config: SplitConfig;
  /** Results from the split operation */
  results: SplitResult[];
  /** Current status of the operation */
  status: SplitStatus;
  /** Error message if status is ERROR */
  error: string | null;
  /** Progress percentage (0-100) for long operations */
  progress: number;
}

// Constants

/** Maximum PDF file size: 100MB */
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

/** Thumbnail width in pixels */
export const THUMBNAIL_WIDTH = 150;

/** Thumbnail height in pixels */
export const THUMBNAIL_HEIGHT = 200;

/** Default split method */
export const DEFAULT_SPLIT_METHOD: SplitMethod = 'extract';

/** Default pages per file for page-count method */
export const DEFAULT_PAGES_PER_FILE = 5;

/** Maximum pages per file */
export const MAX_PAGES_PER_FILE = 100;

/** Minimum pages per file */
export const MIN_PAGES_PER_FILE = 1;

/** Error messages */
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
  INVALID_FILE_TYPE: 'Please upload a valid PDF file',
  NO_FILE: 'No file selected',
  NO_PAGES_SELECTED: 'Please select at least one page to extract',
  INVALID_RANGES: 'Please define at least one valid page range',
  RANGE_OUT_OF_BOUNDS: 'Page range exceeds total page count',
  RANGE_INVALID: 'End page must be greater than or equal to start page',
  INVALID_PAGE_COUNT: `Pages per file must be between ${MIN_PAGES_PER_FILE} and ${MAX_PAGES_PER_FILE}`,
  PDF_LOAD_FAILED: 'Failed to load PDF file. The file may be corrupted or password-protected.',
  PDF_SPLIT_FAILED: 'Failed to split PDF. Please try again.',
  PDF_PARSE_FAILED: 'Unable to parse PDF file',
} as const;
