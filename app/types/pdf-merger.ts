export enum MergeStatus {
  IDLE = "idle",
  MERGING = "merging",
  SUCCESS = "success",
  ERROR = "error",
}

export interface PdfFileState {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number | null;
  preview: string | null;
  error: string | null;
}

export interface PdfMergerError {
  code: string;
  message: string;
}

export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: "File must be a PDF document",
  FILE_TOO_LARGE: "File size exceeds the maximum limit (100MB)",
  TOTAL_SIZE_TOO_LARGE: "Total file size exceeds the maximum limit (500MB)",
  MERGE_FAILED: "Failed to merge PDFs",
  CORRUPTED_FILE: "File appears to be corrupted or invalid",
  OUT_OF_MEMORY: "Not enough memory to process these files",
  NO_FILES: "No files to merge",
} as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB
export const SUPPORTED_MIME_TYPES = ["application/pdf"];
export const SUPPORTED_EXTENSIONS = [".pdf"];
