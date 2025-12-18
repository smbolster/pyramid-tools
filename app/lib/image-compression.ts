/**
 * Client-side image compression utility for reducing file sizes before upload
 * Implements progressive quality reduction and dimension scaling to meet API limits
 */

const MIN_QUALITY = 0.5; // Minimum quality to maintain OCR readability
const INITIAL_QUALITY = 0.9; // Starting quality for compression
const QUALITY_STEP = 0.1; // Quality reduction per iteration
const DIMENSION_SCALE_STEP = 0.9; // Scale factor for dimension reduction (10% reduction)
const BASE64_OVERHEAD = 4 / 3; // Base64 encoding increases size by 33%

/**
 * Estimates the size of a file after base64 encoding
 * @param sizeInBytes - Original file size in bytes
 * @returns Estimated base64-encoded size in bytes
 */
export function estimateBase64Size(sizeInBytes: number): number {
  return Math.ceil(sizeInBytes * BASE64_OVERHEAD);
}

/**
 * Loads an image file into an HTML canvas element
 * @param file - The image file to load
 * @returns Promise resolving to HTMLCanvasElement with the image drawn on it
 */
export function loadImageToCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas 2D context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      resolve(canvas);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Converts a canvas to a Blob with specified quality
 * @param canvas - The canvas to convert
 * @param mimeType - The output MIME type (e.g., 'image/jpeg', 'image/webp')
 * @param quality - Compression quality (0.0 to 1.0)
 * @returns Promise resolving to a Blob
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Scales down canvas dimensions while maintaining aspect ratio
 * @param canvas - The canvas to scale
 * @param scaleFactor - Scale factor (e.g., 0.9 for 10% reduction)
 * @returns New canvas with scaled dimensions
 */
function scaleCanvas(canvas: HTMLCanvasElement, scaleFactor: number): HTMLCanvasElement {
  const newWidth = Math.floor(canvas.width * scaleFactor);
  const newHeight = Math.floor(canvas.height * scaleFactor);

  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = newWidth;
  scaledCanvas.height = newHeight;

  const ctx = scaledCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context for scaling');
  }

  ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
  return scaledCanvas;
}

/**
 * Compresses an image file to meet a target maximum size
 * Uses progressive quality reduction and dimension scaling as needed
 *
 * @param file - The image file to compress
 * @param targetMaxSize - Maximum size in bytes for the compressed file (before base64 encoding)
 * @returns Promise resolving to compressed File object
 * @throws Error if compression cannot reduce file size enough
 */
export async function compressImage(
  file: File,
  targetMaxSize: number
): Promise<File> {
  // Load image into canvas
  let canvas = await loadImageToCanvas(file);

  // Determine output format - prefer JPEG for better compression
  // PNG doesn't support quality parameter, so convert to JPEG
  const outputMimeType = file.type === 'image/png' ? 'image/jpeg' : file.type;
  const supportsQuality = outputMimeType === 'image/jpeg' || outputMimeType === 'image/webp';

  let currentQuality = INITIAL_QUALITY;
  let compressedBlob: Blob | null = null;

  // Strategy 1: Try quality reduction first (if format supports it)
  if (supportsQuality) {
    while (currentQuality >= MIN_QUALITY) {
      compressedBlob = await canvasToBlob(canvas, outputMimeType, currentQuality);

      if (compressedBlob.size <= targetMaxSize) {
        // Successfully compressed to target size
        return new File([compressedBlob], file.name, { type: outputMimeType });
      }

      currentQuality -= QUALITY_STEP;
    }
  }

  // Strategy 2: Quality reduction wasn't enough, try dimension scaling
  // Reset quality to minimum for dimension scaling attempts
  currentQuality = MIN_QUALITY;
  let scaleFactor = DIMENSION_SCALE_STEP;
  const minDimension = 800; // Don't scale below 800px on smallest side to maintain OCR quality

  while (Math.min(canvas.width, canvas.height) * scaleFactor >= minDimension) {
    canvas = scaleCanvas(canvas, scaleFactor);

    if (supportsQuality) {
      compressedBlob = await canvasToBlob(canvas, outputMimeType, currentQuality);
    } else {
      compressedBlob = await canvasToBlob(canvas, outputMimeType, 1.0);
    }

    if (compressedBlob.size <= targetMaxSize) {
      // Successfully compressed to target size
      return new File([compressedBlob], file.name, { type: outputMimeType });
    }

    scaleFactor = DIMENSION_SCALE_STEP; // Scale by 10% each iteration
  }

  // If we got here, we couldn't compress enough
  // Return the best we could achieve
  if (compressedBlob) {
    return new File([compressedBlob], file.name, { type: outputMimeType });
  }

  throw new Error(
    'Image could not be compressed enough for processing. Please reduce image size or quality manually.'
  );
}

/**
 * Checks if a file needs compression based on target size constraints
 * @param file - The file to check
 * @param maxBase64Size - Maximum allowed base64-encoded size
 * @returns True if compression is needed, false otherwise
 */
export function needsCompression(file: File, maxBase64Size: number): boolean {
  const estimatedBase64Size = estimateBase64Size(file.size);
  return estimatedBase64Size > maxBase64Size;
}
