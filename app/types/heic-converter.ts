export enum ConversionStatus {
  PENDING = "pending",
  CONVERTING = "converting",
  SUCCESS = "success",
  ERROR = "error",
}

export interface FileConversionState {
  file: File;
  status: ConversionStatus;
  progress: number;
  error?: string;
  preview?: string;
  convertedBlob?: Blob;
}

export interface ConversionError {
  code: string;
  message: string;
}

export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: "File must be in HEIC format",
  FILE_TOO_LARGE: "File size exceeds the maximum limit (50MB)",
  CONVERSION_FAILED: "Failed to convert file",
  BROWSER_NOT_SUPPORTED: "Your browser does not support HEIC conversion",
  OUT_OF_MEMORY: "Not enough memory to process this file",
  CORRUPTED_FILE: "File appears to be corrupted",
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB
export const SUPPORTED_EXTENSIONS = [".heic", ".heif"];
export const CONVERSION_QUALITY = 0.9;
