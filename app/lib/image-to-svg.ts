/**
 * Image to SVG conversion utilities
 */

import ImageTracer from 'imagetracerjs';
import {
  SVGConversionOptions,
  ConversionResult,
  ValidationError,
  ColorMode,
  SUPPORTED_IMAGE_FORMATS,
  MAX_FILE_SIZE,
  MAX_IMAGE_DIMENSIONS,
  ERROR_MESSAGES,
  PRESET_OPTIONS,
} from '@/types/image-to-svg';

/**
 * Validates an image file for conversion
 * @param file - File to validate
 * @returns ValidationError if invalid, null if valid
 */
export function validateImageFile(file: File): ValidationError | null {
  // Check file format
  if (!SUPPORTED_IMAGE_FORMATS.includes(file.type)) {
    return {
      code: 'UNSUPPORTED_FORMAT',
      message: ERROR_MESSAGES.UNSUPPORTED_FORMAT,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      code: 'FILE_TOO_LARGE',
      message: ERROR_MESSAGES.FILE_TOO_LARGE,
    };
  }

  return null;
}

/**
 * Loads an image file into an HTML canvas
 * @param file - Image file to load
 * @returns Promise resolving to canvas with loaded image
 */
export function loadImageToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const image = new Image();

    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error(ERROR_MESSAGES.INVALID_IMAGE));
        return;
      }

      image.onload = () => {
        // Validate dimensions
        if (
          image.width > MAX_IMAGE_DIMENSIONS.width ||
          image.height > MAX_IMAGE_DIMENSIONS.height
        ) {
          reject(new Error(ERROR_MESSAGES.DIMENSIONS_TOO_LARGE));
          return;
        }

        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(image, 0, 0);
        resolve(canvas);
      };

      image.onerror = () => {
        reject(new Error(ERROR_MESSAGES.INVALID_IMAGE));
      };

      image.src = e.target.result as string;
    };

    reader.onerror = () => {
      reject(new Error(ERROR_MESSAGES.INVALID_IMAGE));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Optimizes SVG string by removing unnecessary whitespace and rounding numbers
 * @param svgString - Raw SVG string
 * @returns Optimized SVG string
 */
export function optimizeSVG(svgString: string): string {
  return (
    svgString
      // Remove XML declaration if present
      .replace(/<\?xml[^>]*\?>/g, '')
      // Remove comments
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove unnecessary whitespace between tags
      .replace(/>\s+</g, '><')
      // Round decimal numbers to 2 places
      .replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(2))
      .trim()
  );
}

/**
 * Converts an image file to SVG format
 * @param file - Image file to convert
 * @param options - Conversion options
 * @param onProgress - Optional progress callback (0-100)
 * @returns Promise resolving to conversion result
 */
export async function convertImageToSVG(
  file: File,
  options: SVGConversionOptions,
  onProgress?: (progress: number) => void
): Promise<ConversionResult> {
  const startTime = Date.now();

  try {
    // Validate file
    onProgress?.(5);
    const validationError = validateImageFile(file);
    if (validationError) {
      throw new Error(validationError.message);
    }

    // Load image to canvas
    onProgress?.(20);
    const canvas = await loadImageToCanvas(file);
    const dimensions = { width: canvas.width, height: canvas.height };

    // Convert options to ImageTracer format
    onProgress?.(40);
    const tracerOptions = convertOptionsToTracerFormat(options);

    // Get ImageData from canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Trace image to SVG
    onProgress?.(60);
    const svgString = ImageTracer.imagedataToSVG(imageData, tracerOptions);

    // Optimize SVG
    onProgress?.(85);
    const optimizedSvg = optimizeSVG(svgString);

    // Create blob and data URL
    onProgress?.(95);
    const svgBlob = new Blob([optimizedSvg], { type: 'image/svg+xml' });
    const svgDataUrl = URL.createObjectURL(svgBlob);

    // Calculate metrics
    const processingTime = Date.now() - startTime;
    const originalSize = file.size;
    const svgSize = svgBlob.size;
    const compressionRatio = calculateCompressionRatio(originalSize, svgSize);

    onProgress?.(100);

    return {
      svgBlob,
      svgDataUrl,
      svgString: optimizedSvg,
      originalSize,
      svgSize,
      compressionRatio,
      processingTime,
      dimensions,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(ERROR_MESSAGES.CONVERSION_FAILED);
  }
}

/**
 * Converts our options format to ImageTracer format
 * @param options - Our conversion options
 * @returns ImageTracer options object
 */
function convertOptionsToTracerFormat(
  options: SVGConversionOptions
): Record<string, unknown> {
  const tracerOptions: Record<string, unknown> = {
    ltres: options.pathPrecision,
    qtres: options.pathPrecision,
    pathomit: options.simplificationTolerance,
    numberofcolors: options.numberOfColors,
  };

  // Set color mode
  if (options.colorMode === ColorMode.GRAYSCALE) {
    tracerOptions.colorsampling = 0; // Grayscale
  } else if (options.colorMode === ColorMode.BLACKWHITE) {
    tracerOptions.numberofcolors = 2;
    tracerOptions.colorsampling = 0;
  }

  return tracerOptions;
}

/**
 * Gets preset options for common use cases
 * @param preset - Preset name
 * @returns Conversion options for the preset
 */
export function getOptionsForPreset(
  preset: 'logo' | 'photo' | 'icon' | 'illustration'
): SVGConversionOptions {
  return { ...PRESET_OPTIONS[preset] };
}

/**
 * Calculates compression ratio as percentage
 * @param originalSize - Original file size in bytes
 * @param svgSize - SVG file size in bytes
 * @returns Compression ratio as percentage
 */
export function calculateCompressionRatio(
  originalSize: number,
  svgSize: number
): number {
  return Math.round((svgSize / originalSize) * 1000) / 10;
}

/**
 * Formats byte size to human-readable string
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
