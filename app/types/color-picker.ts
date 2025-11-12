// Type definitions for Color Picker tool

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a?: number; // 0-1 (optional alpha)
}

export interface HSL {
  h: number; // 0-360 (hue in degrees)
  s: number; // 0-100 (saturation percentage)
  l: number; // 0-100 (lightness percentage)
  a?: number; // 0-1 (optional alpha)
}

export interface HSV {
  h: number; // 0-360 (hue in degrees)
  s: number; // 0-100 (saturation percentage)
  v: number; // 0-100 (value/brightness percentage)
  a?: number; // 0-1 (optional alpha)
}

export interface CMYK {
  c: number; // 0-100 (cyan percentage)
  m: number; // 0-100 (magenta percentage)
  y: number; // 0-100 (yellow percentage)
  k: number; // 0-100 (key/black percentage)
}

export interface ColorFormats {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
  cmyk: CMYK;
}

export type PaletteType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'monochromatic';

export type WCAGLevel = 'AA' | 'AAA';

export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
  passesAAALarge: boolean;
}

// Constants
export const DEFAULT_COLOR = '#3b82f6'; // A nice blue

// WCAG Contrast Standards
export const WCAG_AA_NORMAL = 4.5;
export const WCAG_AA_LARGE = 3.0;
export const WCAG_AAA_NORMAL = 7.0;
export const WCAG_AAA_LARGE = 4.5;

// Recent colors limit
export const MAX_RECENT_COLORS = 10;

// Palette type descriptions
export const PALETTE_DESCRIPTIONS: Record<PaletteType, string> = {
  complementary: 'Opposite colors on the color wheel - high contrast',
  analogous: 'Adjacent colors - harmonious and pleasing',
  triadic: 'Three evenly spaced colors - balanced and vibrant',
  tetradic: 'Four colors forming a rectangle - rich combinations',
  monochromatic: 'Variations of a single hue - cohesive and elegant',
};
