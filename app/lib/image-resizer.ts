import {
  ResizePreset,
  ResizeOptions,
  ResizedImage,
  ResizeImageResponse,
  MAX_FILE_SIZE,
  SUPPORTED_FORMATS,
  ERROR_MESSAGES,
} from "@/types/image-resizer";

/**
 * Predefined resize presets organized by category
 */
export const RESIZE_PRESETS: ResizePreset[] = [
  // Social Media
  {
    id: "instagram-post",
    name: "Instagram Post",
    width: 1080,
    height: 1080,
    category: "Social Media",
  },
  {
    id: "instagram-story",
    name: "Instagram Story",
    width: 1080,
    height: 1920,
    category: "Social Media",
  },
  {
    id: "twitter",
    name: "Twitter",
    width: 1200,
    height: 675,
    category: "Social Media",
  },
  {
    id: "facebook",
    name: "Facebook",
    width: 1200,
    height: 630,
    category: "Social Media",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    width: 1200,
    height: 627,
    category: "Social Media",
  },

  // Web
  {
    id: "thumbnail",
    name: "Thumbnail",
    width: 150,
    height: 150,
    category: "Web",
  },
  {
    id: "small",
    name: "Small",
    width: 320,
    height: 240,
    category: "Web",
  },
  {
    id: "medium",
    name: "Medium",
    width: 640,
    height: 480,
    category: "Web",
  },
  {
    id: "large",
    name: "Large",
    width: 1280,
    height: 720,
    category: "Web",
  },
  {
    id: "hd",
    name: "HD",
    width: 1920,
    height: 1080,
    category: "Web",
  },

  // Common
  {
    id: "avatar",
    name: "Avatar",
    width: 256,
    height: 256,
    category: "Common",
  },
  {
    id: "icon",
    name: "Icon",
    width: 512,
    height: 512,
    category: "Common",
  },
  {
    id: "banner",
    name: "Banner",
    width: 1920,
    height: 480,
    category: "Common",
  },
];

/**
 * Validates an image file
 */
export function validateImageFile(file: File): { code: string; message: string } | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      code: "FILE_TOO_LARGE",
      message: ERROR_MESSAGES.FILE_TOO_LARGE,
    };
  }

  // Check file type
  const supportedFormats: readonly string[] = SUPPORTED_FORMATS;
  if (!supportedFormats.includes(file.type)) {
    return {
      code: "INVALID_FILE_TYPE",
      message: ERROR_MESSAGES.INVALID_FILE_TYPE,
    };
  }

  return null;
}

/**
 * Uploads images to the server and returns resized images
 */
export async function uploadAndResizeImages(
  files: File[],
  options: ResizeOptions
): Promise<ResizedImage[]> {
  try {
    // Create FormData
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    // Add resize options
    if (options.width) formData.append("width", options.width.toString());
    if (options.height) formData.append("height", options.height.toString());
    formData.append("mode", options.mode);
    if (options.quality) formData.append("quality", options.quality.toString());
    if (options.format) formData.append("format", options.format);

    // Upload to API endpoint
    const response = await fetch("/api/resize-image", {
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
    const data: ResizeImageResponse = await response.json();

    if (!data.success) {
      throw new Error(ERROR_MESSAGES.RESIZE_FAILED);
    }

    // Check if there were any errors
    if (data.errors && data.errors.length > 0) {
      console.warn("Some files failed to resize:", data.errors);
    }

    return data.images;
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
 * Generates a resized filename
 */
export function generateResizedFilename(
  originalName: string,
  width?: number,
  height?: number,
  format?: string
): string {
  const nameParts = originalName.split(".");
  const extension = nameParts.pop() || "";
  const baseName = nameParts.join(".");

  const dimensions = width && height ? `_${width}x${height}` : "";
  const newExtension = format || extension;

  return `${baseName}${dimensions}.${newExtension}`;
}

/**
 * Detects image dimensions from a File
 */
export function detectImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a preview URL from a blob
 */
export function createPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Calculates aspect ratio from dimensions
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Calculates new dimensions maintaining aspect ratio
 */
export function calculateDimensionsWithAspectRatio(
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } {
  const aspectRatio = calculateAspectRatio(originalWidth, originalHeight);

  if (targetWidth && !targetHeight) {
    return {
      width: targetWidth,
      height: Math.round(targetWidth / aspectRatio),
    };
  } else if (!targetWidth && targetHeight) {
    return {
      width: Math.round(targetHeight * aspectRatio),
      height: targetHeight,
    };
  } else if (targetWidth && targetHeight) {
    return {
      width: targetWidth,
      height: targetHeight,
    };
  }

  return { width: originalWidth, height: originalHeight };
}
