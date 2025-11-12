export enum ConversionStatus {
  PENDING = "pending",
  UPLOADING = "uploading",
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

// API Response Types
export interface ConvertedFile {
  filename: string;
  data: string; // base64 encoded JPEG data
  size: number;
  originalName: string;
}

export interface ConvertHeicResponse {
  success: boolean;
  conversions: ConvertedFile[];
  errors: Array<{
    filename: string;
    error: string;
  }>;
}

export interface ConvertHeicError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: "File must be in HEIC format",
  FILE_TOO_LARGE: "File size exceeds the maximum limit (50MB)",
  TOTAL_SIZE_TOO_LARGE: "Total upload size exceeds limit (500MB)",
  TOO_MANY_FILES: "Too many files. Maximum 20 files per request",
  CONVERSION_FAILED: "Failed to convert file",
  UPLOAD_FAILED: "Failed to upload file to server",
  SERVER_ERROR: "Server error occurred during conversion",
  NETWORK_ERROR: "Network error occurred",
  OUT_OF_MEMORY: "Not enough memory to process this file",
  CORRUPTED_FILE: "File appears to be corrupted",
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB
export const SUPPORTED_EXTENSIONS = [".heic", ".heif"];
export const CONVERSION_QUALITY = 0.9;
