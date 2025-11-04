/**
 * Type definitions for QR Code Generator
 */

/**
 * Error correction levels for QR codes
 * - L (Low): 7% error recovery
 * - M (Medium): 15% error recovery
 * - Q (Quartile): 25% error recovery
 * - H (High): 30% error recovery
 */
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * QR code size presets
 */
export type QRCodeSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Configuration for QR code generation
 */
export interface QRCodeConfig {
  /** The text/URL to encode */
  data: string;
  /** Pixel dimensions of the QR code */
  size: number;
  /** Error correction level */
  errorCorrectionLevel: ErrorCorrectionLevel;
  /** Foreground color (hex format) */
  foregroundColor: string;
  /** Background color (hex format) */
  backgroundColor: string;
  /** Quiet zone size (margin around QR code) */
  margin: number;
}

/**
 * State management for QR generator component
 */
export interface QRGeneratorState {
  /** User input text */
  inputText: string;
  /** QR code configuration */
  config: QRCodeConfig;
  /** Generated QR code data URL */
  qrCodeDataUrl: string | null;
  /** Generation in progress */
  isGenerating: boolean;
  /** Error message if any */
  error: string | null;
}

/**
 * Constants
 */

/** Maximum text length for QR code input */
export const MAX_TEXT_LENGTH = 2000;

/** Size presets mapped to pixel dimensions */
export const SIZE_PRESETS: Record<QRCodeSize, number> = {
  small: 200,
  medium: 300,
  large: 400,
  xlarge: 600,
};

/** Default size preset */
export const DEFAULT_SIZE: QRCodeSize = 'medium';

/** Default error correction level */
export const DEFAULT_ERROR_CORRECTION: ErrorCorrectionLevel = 'M';

/** Default foreground color */
export const DEFAULT_FG_COLOR = '#000000';

/** Default background color */
export const DEFAULT_BG_COLOR = '#ffffff';

/** Default margin size */
export const DEFAULT_MARGIN = 4;

/**
 * Error messages for various validation scenarios
 */
export const ERROR_MESSAGES = {
  EMPTY_INPUT: 'Please enter text or a URL to generate a QR code',
  TEXT_TOO_LONG: (length: number) =>
    `Text is too long (${length} characters). Maximum length is ${MAX_TEXT_LENGTH} characters.`,
  INVALID_COLOR: 'Invalid color format. Please use a valid hex color.',
  LOW_CONTRAST: 'Warning: Foreground and background colors are too similar. QR code may be difficult to scan.',
  GENERATION_FAILED: 'Failed to generate QR code. Please try again.',
  INVALID_CONFIG: 'Invalid configuration. Please check your settings.',
};

/**
 * Error correction level descriptions for user education
 */
export const ERROR_CORRECTION_DESCRIPTIONS: Record<ErrorCorrectionLevel, string> = {
  L: 'Low (7% recovery) - Use for clean digital displays',
  M: 'Medium (15% recovery) - General purpose, recommended',
  Q: 'Quartile (25% recovery) - For printed materials',
  H: 'High (30% recovery) - Critical data or small codes',
};

/**
 * Size preset descriptions
 */
export const SIZE_DESCRIPTIONS: Record<QRCodeSize, string> = {
  small: '200×200px - Digital use only',
  medium: '300×300px - General purpose',
  large: '400×400px - Print or distant scanning',
  xlarge: '600×600px - Large print or posters',
};
