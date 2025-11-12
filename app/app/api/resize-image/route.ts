import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import {
  ResizeMode,
  ImageFormat,
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
  MAX_FILES,
  SUPPORTED_FORMATS,
  ERROR_MESSAGES,
} from "@/types/image-resizer";

/**
 * Validates an image file before resizing
 */
function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
  }

  // Check file type
  const supportedFormats: readonly string[] = SUPPORTED_FORMATS;
  if (!supportedFormats.includes(file.type)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE };
  }

  return { valid: true };
}

/**
 * Resizes an image using Sharp
 */
async function resizeImage(
  file: File,
  width?: number,
  height?: number,
  mode: ResizeMode = ResizeMode.FIT,
  quality?: number,
  format?: ImageFormat
): Promise<{
  filename: string;
  data: string;
  size: number;
  width: number;
  height: number;
  format: string;
}> {
  try {
    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Create Sharp instance
    let image = sharp(inputBuffer);

    // Get metadata for original dimensions
    const metadata = await image.metadata();

    // Apply resize based on mode
    const resizeOptions: sharp.ResizeOptions = {};

    switch (mode) {
      case ResizeMode.FIT:
        resizeOptions.fit = "inside";
        resizeOptions.withoutEnlargement = false;
        break;
      case ResizeMode.FILL:
        resizeOptions.fit = "cover";
        break;
      case ResizeMode.COVER:
        resizeOptions.fit = "cover";
        break;
      case ResizeMode.CONTAIN:
        resizeOptions.fit = "contain";
        resizeOptions.background = { r: 255, g: 255, b: 255, alpha: 1 };
        break;
      case ResizeMode.INSIDE:
        resizeOptions.fit = "inside";
        break;
      case ResizeMode.OUTSIDE:
        resizeOptions.fit = "outside";
        break;
    }

    // Apply resize if dimensions provided
    if (width || height) {
      image = image.resize(width, height, resizeOptions);
    }

    // Determine output format
    const outputFormat = format || (metadata.format as ImageFormat);

    // Apply format-specific options
    switch (outputFormat) {
      case ImageFormat.JPEG:
        image = image.jpeg({ quality: quality || 90 });
        break;
      case ImageFormat.PNG:
        image = image.png();
        break;
      case ImageFormat.WEBP:
        image = image.webp({ quality: quality || 90 });
        break;
      case ImageFormat.GIF:
        image = image.gif();
        break;
      case ImageFormat.AVIF:
        image = image.avif({ quality: quality || 90 });
        break;
      case ImageFormat.TIFF:
        image = image.tiff();
        break;
      default:
        // Keep original format
        break;
    }

    // Convert to buffer
    const outputBuffer = await image.toBuffer();

    // Get output metadata
    const outputMetadata = await sharp(outputBuffer).metadata();

    // Convert to base64
    const base64Data = outputBuffer.toString("base64");

    // Generate filename
    const filename = file.name.replace(
      /\.[^.]+$/,
      `_${outputMetadata.width}x${outputMetadata.height}.${outputFormat || metadata.format}`
    );

    return {
      filename,
      data: base64Data,
      size: outputBuffer.length,
      width: outputMetadata.width || 0,
      height: outputMetadata.height || 0,
      format: outputFormat || metadata.format || "jpeg",
    };
  } catch (error) {
    console.error("Resize error:", error);
    throw new Error(
      error instanceof Error ? error.message : ERROR_MESSAGES.RESIZE_FAILED
    );
  }
}

/**
 * POST endpoint for resizing images
 */
export async function POST(request: NextRequest) {
  try {
    // Extract form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    // Parse resize options
    const widthStr = formData.get("width") as string | null;
    const heightStr = formData.get("height") as string | null;
    const mode = (formData.get("mode") as ResizeMode) || ResizeMode.FIT;
    const qualityStr = formData.get("quality") as string | null;
    const format = formData.get("format") as ImageFormat | null;

    const width = widthStr ? parseInt(widthStr, 10) : undefined;
    const height = heightStr ? parseInt(heightStr, 10) : undefined;
    const quality = qualityStr ? parseInt(qualityStr, 10) : undefined;

    // Validate that files were provided
    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_FILES",
            message: "No files were uploaded",
          },
        },
        { status: 400 }
      );
    }

    // Check file count
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOO_MANY_FILES",
            message: ERROR_MESSAGES.TOO_MANY_FILES,
          },
        },
        { status: 400 }
      );
    }

    // Check total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOTAL_SIZE_EXCEEDED",
            message: ERROR_MESSAGES.TOTAL_SIZE_TOO_LARGE,
          },
        },
        { status: 400 }
      );
    }

    // Validate dimensions
    if ((width && width <= 0) || (height && height <= 0)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_DIMENSIONS",
            message: ERROR_MESSAGES.INVALID_DIMENSIONS,
          },
        },
        { status: 400 }
      );
    }

    // Validate each file
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_FILE",
              message: validation.error || ERROR_MESSAGES.INVALID_FILE_TYPE,
              details: `File: ${file.name}`,
            },
          },
          { status: 400 }
        );
      }
    }

    // Resize all files
    const images = [];
    const errors = [];

    for (const file of files) {
      try {
        const resized = await resizeImage(
          file,
          width,
          height,
          mode,
          quality,
          format || undefined
        );
        images.push({
          filename: resized.filename,
          data: resized.data,
          size: resized.size,
          originalName: file.name,
          width: resized.width,
          height: resized.height,
          format: resized.format,
        });
      } catch (error) {
        console.error(`Failed to resize ${file.name}:`, error);
        errors.push({
          filename: file.name,
          error:
            error instanceof Error
              ? error.message
              : ERROR_MESSAGES.RESIZE_FAILED,
        });
      }
    }

    // Return results
    return NextResponse.json(
      {
        success: true,
        images,
        errors,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: ERROR_MESSAGES.SERVER_ERROR,
          details:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      },
      { status: 500 }
    );
  }
}
