import {
  ConversionError,
  ERROR_MESSAGES,
  MAX_FILE_SIZE,
  SUPPORTED_EXTENSIONS,
  ConvertedFile,
  ConvertHeicResponse,
} from "@/types/heic-converter";

/**
 * Validates if a file is a valid HEIC file (client-side pre-validation)
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
 * Uploads HEIC files to the server and returns converted JPEG files
 */
export async function uploadAndConvertHeic(
  files: File[]
): Promise<ConvertedFile[]> {
  try {
    // Create FormData
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Upload to API endpoint
    const response = await fetch("/api/convert-heic", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      // Try to parse error response
      const errorData = await response.json().catch(() => null);
      if (errorData?.error) {
        throw new Error(errorData.error.message || ERROR_MESSAGES.SERVER_ERROR);
      }
      throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
    }

    // Parse response
    const data: ConvertHeicResponse = await response.json();

    if (!data.success) {
      throw new Error(ERROR_MESSAGES.CONVERSION_FAILED);
    }

    // Check if there were any conversion errors
    if (data.errors && data.errors.length > 0) {
      console.warn("Some files failed to convert:", data.errors);
    }

    return data.conversions;
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw known errors
      const errorMessages = Object.values(ERROR_MESSAGES) as string[];
      if (errorMessages.includes(error.message)) {
        throw error;
      }
      // Network errors
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
    }
    // Generic error
    throw new Error(ERROR_MESSAGES.UPLOAD_FAILED);
  }
}

/**
 * Converts base64 data to Blob
 */
export function base64ToBlob(base64: string, mimeType = "image/jpeg"): Blob {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
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
