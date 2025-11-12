export enum ResizeMode {
  FIT = "fit",
  FILL = "fill",
  COVER = "cover",
  CONTAIN = "contain",
  INSIDE = "inside",
  OUTSIDE = "outside",
}

export enum ImageFormat {
  JPEG = "jpeg",
  PNG = "png",
  WEBP = "webp",
  GIF = "gif",
  AVIF = "avif",
  TIFF = "tiff",
}

export enum ResizeStatus {
  PENDING = "pending",
  RESIZING = "resizing",
  SUCCESS = "success",
  ERROR = "error",
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  mode: ResizeMode;
  quality?: number; // 1-100
  format?: ImageFormat;
  maintainAspectRatio: boolean;
}

export interface ResizePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  category: string;
}

export interface FileResizeState {
  file: File;
  status: ResizeStatus;
  progress: number;
  error?: string;
  preview?: string;
  resizedBlob?: Blob;
  originalDimensions?: { width: number; height: number };
  resizedDimensions?: { width: number; height: number };
  originalSize: number;
  resizedSize?: number;
}

// API Types
export interface ResizedImage {
  filename: string;
  data: string; // base64
  size: number;
  originalName: string;
  width: number;
  height: number;
  format: string;
}

export interface ResizeImageResponse {
  success: boolean;
  images: ResizedImage[];
  errors: Array<{
    filename: string;
    error: string;
  }>;
}

export interface ResizeImageError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: "File must be an image (JPEG, PNG, WebP, GIF, AVIF, TIFF)",
  FILE_TOO_LARGE: "File size exceeds the maximum limit (10MB)",
  TOTAL_SIZE_TOO_LARGE: "Total upload size exceeds limit (100MB)",
  TOO_MANY_FILES: "Too many files. Maximum 20 files per request",
  INVALID_DIMENSIONS: "Width and height must be positive numbers",
  RESIZE_FAILED: "Failed to resize image",
  UPLOAD_FAILED: "Failed to upload image to server",
  SERVER_ERROR: "Server error occurred during resize",
  NETWORK_ERROR: "Network error occurred",
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_FILES = 20;

export const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/tiff",
] as const;
