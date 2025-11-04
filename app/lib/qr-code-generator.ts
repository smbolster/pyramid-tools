/**
 * QR Code generation utilities
 */

import QRCode from 'qrcode';
import {
  QRCodeConfig,
  QRCodeSize,
  MAX_TEXT_LENGTH,
  SIZE_PRESETS,
  ERROR_MESSAGES,
} from '@/types/qr-code-generator';

/**
 * Validates QR code input text
 * @param text - The text to validate
 * @returns Error message if invalid, null if valid
 */
export function validateQRInput(text: string): string | null {
  if (!text || text.trim().length === 0) {
    return ERROR_MESSAGES.EMPTY_INPUT;
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return ERROR_MESSAGES.TEXT_TOO_LONG(text.length);
  }

  return null;
}

/**
 * Validates hex color format
 * @param color - The color string to validate
 * @returns true if valid hex color, false otherwise
 */
export function validateHexColor(color: string): boolean {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
}

/**
 * Checks if two colors have low contrast (may be difficult to scan)
 * Simplified contrast check - not full WCAG calculation
 * @param fg - Foreground color (hex)
 * @param bg - Background color (hex)
 * @returns true if contrast is too low
 */
export function hasLowContrast(fg: string, bg: string): boolean {
  // Convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

  // Calculate relative luminance (simplified)
  const getLuminance = (rgb: [number, number, number]): number => {
    const [r, g, b] = rgb.map((val) => {
      const sRGB = val / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  const fgLum = getLuminance(fgRgb);
  const bgLum = getLuminance(bgRgb);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  const contrast = (lighter + 0.05) / (darker + 0.05);

  // Warn if contrast ratio is less than 3:1
  return contrast < 3;
}

/**
 * Maps size preset to pixel dimensions
 * @param size - Size preset name
 * @returns Pixel dimensions
 */
export function getSizeInPixels(size: QRCodeSize): number {
  return SIZE_PRESETS[size];
}

/**
 * Generates a QR code from the provided configuration
 * @param config - QR code configuration
 * @returns Promise resolving to data URL of the generated QR code
 * @throws Error if generation fails
 */
export async function generateQRCode(config: QRCodeConfig): Promise<string> {
  // Validate input
  const validationError = validateQRInput(config.data);
  if (validationError) {
    throw new Error(validationError);
  }

  // Validate colors
  if (!validateHexColor(config.foregroundColor)) {
    throw new Error(ERROR_MESSAGES.INVALID_COLOR);
  }
  if (!validateHexColor(config.backgroundColor)) {
    throw new Error(ERROR_MESSAGES.INVALID_COLOR);
  }

  try {
    // Configure QR code options
    const options = {
      errorCorrectionLevel: config.errorCorrectionLevel,
      margin: config.margin,
      width: config.size,
      color: {
        dark: config.foregroundColor,
        light: config.backgroundColor,
      },
    };

    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(config.data, options);
    return dataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    throw new Error(ERROR_MESSAGES.GENERATION_FAILED);
  }
}

/**
 * Converts a data URL to a Blob for downloading
 * @param dataUrl - The data URL to convert
 * @returns Blob object
 */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

/**
 * Generates a filename for the QR code download
 * @param prefix - Optional prefix for the filename
 * @returns Filename with timestamp
 */
export function generateFilename(prefix: string = 'qr-code'): string {
  const timestamp = Date.now();
  return `${prefix}-${timestamp}.png`;
}
