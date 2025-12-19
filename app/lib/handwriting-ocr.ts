import {
  MAX_FILE_SIZE,
  SUPPORTED_FORMATS,
  ERROR_MESSAGES,
  ExtractTextRequest,
  ExtractTextResponse,
} from '@/types/handwriting-ocr';

/**
 * Checks if a file is a PDF
 * @param file - The file to check
 * @returns True if file is a PDF
 */
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Validates an image or PDF file for OCR processing
 * @param file - The file to validate
 * @returns Validation result with success status and optional error message
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
  }

  // Check if it's a supported format (images or PDF)
  const isSupported = SUPPORTED_FORMATS.includes(file.type as typeof SUPPORTED_FORMATS[number])
    || file.name.toLowerCase().endsWith('.pdf');

  if (!isSupported) {
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

  // Convert files to base64
  const images = await Promise.all(
    files.map(async (file) => ({
      filename: file.name,
      data: await fileToBase64(file),
      mimeType: file.type,
    }))
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
 * Sends pre-converted images to the API for text extraction
 * Used for PDF pages that have been converted to images
 * @param images - Array of image data with filename, data (base64), and mimeType
 * @returns Promise resolving to extraction results
 */
export async function extractTextFromImages(
  images: Array<{ filename: string; data: string; mimeType: string }>
): Promise<ExtractTextResponse> {
  const response = await fetch('/api/extract-handwriting', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images }),
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
