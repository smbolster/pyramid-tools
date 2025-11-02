import {
  ConversionError,
  ERROR_MESSAGES,
  MAX_FILE_SIZE,
  SUPPORTED_EXTENSIONS,
  CONVERSION_QUALITY,
} from "@/types/heic-converter";

/**
 * Validates if a file is a valid HEIC file
 */
export function validateHeicFile(file: File): ConversionError | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      code: "FILE_TOO_LARGE",
      message: ERROR_MESSAGES.FILE_TOO_LARGE,
    };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const isValidExtension = SUPPORTED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!isValidExtension) {
    return {
      code: "INVALID_FILE_TYPE",
      message: ERROR_MESSAGES.INVALID_FILE_TYPE,
    };
  }

  return null;
}

/**
 * Converts a HEIC file to JPEG format
 */
export async function convertHeicToJpeg(
  file: File,
  quality: number = CONVERSION_QUALITY
): Promise<Blob> {
  try {
    // Validate file first
    const validationError = validateHeicFile(file);
    if (validationError) {
      throw new Error(validationError.message);
    }

    // Dynamically import heic2any only on the client
    const heic2any = (await import("heic2any")).default;

    // Convert HEIC to JPEG
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: quality,
    });

    // heic2any might return an array of blobs for multi-image HEIC files
    // We'll take the first one
    if (Array.isArray(convertedBlob)) {
      return convertedBlob[0];
    }

    return convertedBlob as Blob;
  } catch (error) {
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("memory")) {
        throw new Error(ERROR_MESSAGES.OUT_OF_MEMORY);
      }
      if (error.message.includes("not supported")) {
        throw new Error(ERROR_MESSAGES.BROWSER_NOT_SUPPORTED);
      }
      if (error.message.includes("corrupt")) {
        throw new Error(ERROR_MESSAGES.CORRUPTED_FILE);
      }
      // Re-throw validation errors
      const errorMessages = Object.values(ERROR_MESSAGES) as string[];
      if (errorMessages.includes(error.message)) {
        throw error;
      }
    }
    // Generic conversion failure
    throw new Error(ERROR_MESSAGES.CONVERSION_FAILED);
  }
}

/**
 * Creates a preview URL from a blob
 */
export function createPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revokes a preview URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Generates a JPEG filename from a HEIC filename
 */
export function generateJpegFilename(heicFilename: string): string {
  return heicFilename.replace(/\.(heic|heif)$/i, ".jpg");
}
