import { NextRequest, NextResponse } from "next/server";
import convert from "heic-convert";
import {
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
  SUPPORTED_EXTENSIONS,
  ERROR_MESSAGES,
  CONVERSION_QUALITY,
} from "@/types/heic-converter";

const MAX_FILES = 20;

/**
 * Validates a HEIC file before conversion
 */
function validateHeicFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const isValidExtension = SUPPORTED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!isValidExtension) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE };
  }

  return { valid: true };
}

/**
 * Converts a HEIC file to JPEG format
 */
async function convertHeicToJpeg(
  file: File
): Promise<{ filename: string; data: string; size: number }> {
  try {
    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Convert HEIC to JPEG
    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: "JPEG",
      quality: CONVERSION_QUALITY,
    });

    // Convert buffer to base64
    const base64Data = Buffer.from(outputBuffer).toString("base64");

    // Generate output filename
    const filename = file.name.replace(/\.(heic|heif)$/i, ".jpg");

    return {
      filename,
      data: base64Data,
      size: outputBuffer.length,
    };
  } catch (error) {
    console.error("Conversion error:", error);
    throw new Error(
      error instanceof Error ? error.message : ERROR_MESSAGES.CONVERSION_FAILED
    );
  }
}

/**
 * POST endpoint for converting HEIC files to JPEG
 */
export async function POST(request: NextRequest) {
  try {
    // Extract form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

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

    // Validate each file
    for (const file of files) {
      const validation = validateHeicFile(file);
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

    // Convert all files
    const conversions = [];
    const errors = [];

    for (const file of files) {
      try {
        const converted = await convertHeicToJpeg(file);
        conversions.push({
          filename: converted.filename,
          data: converted.data,
          size: converted.size,
          originalName: file.name,
        });
      } catch (error) {
        console.error(`Failed to convert ${file.name}:`, error);
        errors.push({
          filename: file.name,
          error:
            error instanceof Error
              ? error.message
              : ERROR_MESSAGES.CONVERSION_FAILED,
        });
      }
    }

    // Return results
    return NextResponse.json(
      {
        success: true,
        conversions,
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
