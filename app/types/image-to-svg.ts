/**
 * Type definitions for Image to SVG converter
 */

/**
 * Status of the conversion process
 */
export enum ConversionStatus {
  IDLE = 'idle',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

/**
 * Color mode for SVG conversion
 */
export enum ColorMode {
  COLOR = 'color',
  GRAYSCALE = 'grayscale',
  BLACKWHITE = 'blackwhite',
}

/**
 * Path precision level
 */
export enum PathPrecision {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Options for SVG conversion
 */
export interface SVGConversionOptions {
  colorMode: ColorMode;
  numberOfColors: number; // 2-64
  pathPrecision: number; // 0.01-10, lower = more precise
  threshold: number; // 0-255, for black/white mode
  simplificationTolerance: number; // 0-10, path smoothing
  removeBackground?: boolean; // Optional feature
}

/**
 * Result of SVG conversion
 */
export interface ConversionResult {
  svgBlob: Blob;
  svgDataUrl: string;
  svgString: string;
  originalSize: number; // bytes
  svgSize: number; // bytes
  compressionRatio: number; // percentage
  processingTime: number; // milliseconds
  dimensions: { width: number; height: number };
}

/**
 * State of uploaded file and conversion
 */
export interface FileState {
  file: File | null;
  imageDataUrl: string | null;
  status: ConversionStatus;
  result: ConversionResult | null;
  error: string | null;
  progress: number; // 0-100
}

/**
 * Validation error details
 */
export interface ValidationError {
  code: string;
  message: string;
}

/**
 * Supported image formats
 */
export const SUPPORTED_IMAGE_FORMATS = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/bmp',
  'image/gif',
];

/**
 * Maximum file size (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Maximum image dimensions
 */
export const MAX_IMAGE_DIMENSIONS = {
  width: 4096,
  height: 4096,
};

/**
 * Default conversion options
 */
export const DEFAULT_OPTIONS: SVGConversionOptions = {
  colorMode: ColorMode.COLOR,
  numberOfColors: 16,
  pathPrecision: 1,
  threshold: 128,
  simplificationTolerance: 2,
  removeBackground: false,
};

/**
 * Preset conversion options for common use cases
 */
export const PRESET_OPTIONS: Record<
  'logo' | 'photo' | 'icon' | 'illustration',
  SVGConversionOptions
> = {
  logo: {
    colorMode: ColorMode.COLOR,
    numberOfColors: 8,
    pathPrecision: 0.5,
    threshold: 128,
    simplificationTolerance: 1,
    removeBackground: false,
  },
  photo: {
    colorMode: ColorMode.COLOR,
    numberOfColors: 64,
    pathPrecision: 0.5,
    threshold: 128,
    simplificationTolerance: 1,
    removeBackground: false,
  },
  icon: {
    colorMode: ColorMode.COLOR,
    numberOfColors: 16,
    pathPrecision: 2,
    threshold: 128,
    simplificationTolerance: 3,
    removeBackground: false,
  },
  illustration: {
    colorMode: ColorMode.COLOR,
    numberOfColors: 32,
    pathPrecision: 1,
    threshold: 128,
    simplificationTolerance: 2,
    removeBackground: false,
  },
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  UNSUPPORTED_FORMAT: 'Unsupported file format. Please upload PNG, JPEG, WebP, BMP, or GIF.',
  FILE_TOO_LARGE: 'File exceeds 10MB limit. Please upload a smaller image.',
  DIMENSIONS_TOO_LARGE: 'Image dimensions exceed 4096x4096 pixels. Please resize your image.',
  INVALID_IMAGE: 'Failed to load image. The file may be corrupted.',
  CONVERSION_FAILED: 'Conversion failed. Please try again or use different settings.',
  OUT_OF_MEMORY: 'Image is too complex. Try reducing the number of colors or image dimensions.',
};
