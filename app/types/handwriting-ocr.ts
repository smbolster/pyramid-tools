export enum ProcessingStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface FileOCRState {
  file: File;
  status: ProcessingStatus;
  progress: number; // 0-100
  extractedText?: string;
  error?: string;
}

export interface OCRResponse {
  success: boolean;
  text?: string;
  error?: string;
}

export interface ExtractTextRequest {
  images: Array<{
    filename: string;
    data: string; // base64
    mimeType: string;
  }>;
}

export interface ExtractTextResponse {
  results: Array<{
    filename: string;
    text?: string;
    error?: string;
  }>;
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES = 5; // Process up to 5 images at once
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
] as const;

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'File size exceeds 10MB limit',
  INVALID_FILE_TYPE: 'Unsupported file format. Please use JPEG, PNG, WebP, or HEIC',
  TOO_MANY_FILES: 'Maximum 5 files can be processed at once',
  UPLOAD_FAILED: 'Failed to upload file',
  EXTRACTION_FAILED: 'Failed to extract text from image',
  NO_TEXT_FOUND: 'No handwritten text detected in image',
  API_ERROR: 'API service error. Please try again',
  API_KEY_MISSING: 'API key not configured',
} as const;
