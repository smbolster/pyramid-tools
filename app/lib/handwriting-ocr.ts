import {
  MAX_FILE_SIZE,
  SUPPORTED_IMAGE_FORMATS,
  ERROR_MESSAGES,
  ExtractTextRequest,
  ExtractTextResponse,
} from '@/types/handwriting-ocr';
import { compressImage, needsCompression } from './image-compression';

/**
 * Validates an image file for OCR processing
 * @param file - The file to validate
 * @returns Validation result with success status and optional error message
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
  }
  if (!SUPPORTED_IMAGE_FORMATS.includes(file.type as typeof SUPPORTED_IMAGE_FORMATS[number])) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE };
  }
  return { valid: true };
}

/**
 * Converts a file to base64 string
 * @param file - The file to convert
 * @returns Promise resolving to base64 string (without data URL prefix)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads files to the API and extracts text from them
 * @param files - Array of files to process
 * @returns Promise resolving to extraction results
 */
export async function uploadAndExtractText(
  files: File[]
): Promise<ExtractTextResponse> {
  // Validate all files
  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
  }

  // Claude API has a 5MB limit for base64-encoded images
  // We target 3.5MB compressed size to ensure base64 stays under 5MB with safety margin
  const CLAUDE_API_LIMIT = 5 * 1024 * 1024; // 5MB
  const TARGET_COMPRESSED_SIZE = 3.5 * 1024 * 1024; // 3.5MB

  // Process files: compress if needed, then convert to base64
  const images = await Promise.all(
    files.map(async (file) => {
      let processedFile = file;

      // Check if compression is needed
      if (needsCompression(file, CLAUDE_API_LIMIT)) {
        try {
          processedFile = await compressImage(file, TARGET_COMPRESSED_SIZE);
        } catch (error) {
          throw new Error(
            `Failed to compress ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      return {
        filename: file.name,
        data: await fileToBase64(processedFile),
        mimeType: processedFile.type,
      };
    })
  );

  // Upload to API
  const response = await fetch('/api/extract-handwriting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images } as ExtractTextRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || ERROR_MESSAGES.UPLOAD_FAILED);
  }

  return response.json();
}

/**
 * Downloads extracted text as a .txt file
 * @param text - The text content to download
 * @param filename - The original filename (extension will be replaced with .txt)
 */
export function downloadTextFile(text: string, filename: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.replace(/\.[^/.]+$/, '.txt');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
