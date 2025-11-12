// Color conversion and utility functions for Color Picker

import {
  RGB,
  HSL,
  HSV,
  CMYK,
  ContrastResult,
  PaletteType,
  WCAG_AA_NORMAL,
  WCAG_AA_LARGE,
  WCAG_AAA_NORMAL,
  WCAG_AAA_LARGE,
} from '@/types/color-picker';

/**
 * Convert HEX color to RGB
 * Supports both #RGB and #RRGGBB formats
 */
export function hexToRgb(hex: string): RGB | null {
  // Remove # if present
  const cleanHex = hex.replace(/^#/, '');

  // Validate hex
  if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    return null;
  }

  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map((char) => char + char)
          .join('')
      : cleanHex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;

  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

/**
 * Convert HSV to RGB
 */
export function hsvToRgb(hsv: HSV): RGB {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r, g, b;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      r = 0;
      g = 0;
      b = 0;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to CMYK
 */
export function rgbToCmyk(rgb: RGB): CMYK {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

/**
 * Validate HEX color string
 */
export function isValidHex(hex: string): boolean {
  return /^#?[0-9A-Fa-f]{3}$|^#?[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Validate RGB values
 */
export function isValidRgb(rgb: RGB): boolean {
  return (
    rgb.r >= 0 &&
    rgb.r <= 255 &&
    rgb.g >= 0 &&
    rgb.g <= 255 &&
    rgb.b >= 0 &&
    rgb.b <= 255
  );
}

/**
 * Normalize HEX string (add # if missing, convert to uppercase)
 */
export function normalizeHex(hex: string): string {
  const cleaned = hex.replace(/^#/, '');
  return '#' + cleaned.toUpperCase();
}

/**
 * Format RGB as CSS string
 */
export function formatRgbString(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/**
 * Format HSL as CSS string
 */
export function formatHslString(hsl: HSL): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

/**
 * Format HSV as string
 */
export function formatHsvString(hsv: HSV): string {
  return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
}

/**
 * Format CMYK as string
 */
export function formatCmykString(cmyk: CMYK): string {
  return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
}

/**
 * Calculate relative luminance for contrast ratio
 * Uses WCAG formula
 */
export function getRelativeLuminance(rgb: RGB): number {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Returns ratio from 1 to 21
 */
export function calculateContrastRatio(color1: RGB, color2: RGB): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check contrast against WCAG standards
 */
export function checkContrast(foreground: RGB, background: RGB): ContrastResult {
  const ratio = calculateContrastRatio(foreground, background);

  return {
    ratio,
    passesAA: ratio >= WCAG_AA_NORMAL,
    passesAAA: ratio >= WCAG_AAA_NORMAL,
    passesAALarge: ratio >= WCAG_AA_LARGE,
    passesAAALarge: ratio >= WCAG_AAA_LARGE,
  };
}

/**
 * Check if two colors have low contrast (might be hard to distinguish)
 */
export function hasLowContrast(hex1: string, hex2: string): boolean {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return false;

  const ratio = calculateContrastRatio(rgb1, rgb2);
  return ratio < 3.0;
}

/**
 * Generate complementary color palette (2 colors, 180° apart)
 */
export function generateComplementary(hsl: HSL): HSL[] {
  return [
    { ...hsl },
    { ...hsl, h: (hsl.h + 180) % 360 },
  ];
}

/**
 * Generate analogous color palette (3 colors, ±30° from base)
 */
export function generateAnalogous(hsl: HSL): HSL[] {
  return [
    { ...hsl, h: (hsl.h - 30 + 360) % 360 },
    { ...hsl },
    { ...hsl, h: (hsl.h + 30) % 360 },
  ];
}

/**
 * Generate triadic color palette (3 colors, 120° apart)
 */
export function generateTriadic(hsl: HSL): HSL[] {
  return [
    { ...hsl },
    { ...hsl, h: (hsl.h + 120) % 360 },
    { ...hsl, h: (hsl.h + 240) % 360 },
  ];
}

/**
 * Generate tetradic color palette (4 colors, 90° apart)
 */
export function generateTetradic(hsl: HSL): HSL[] {
  return [
    { ...hsl },
    { ...hsl, h: (hsl.h + 90) % 360 },
    { ...hsl, h: (hsl.h + 180) % 360 },
    { ...hsl, h: (hsl.h + 270) % 360 },
  ];
}

/**
 * Generate monochromatic color palette (5 variations with different lightness)
 */
export function generateMonochromatic(hsl: HSL): HSL[] {
  const lightnessValues = [20, 40, 60, 80, 90];
  return lightnessValues.map((l) => ({ ...hsl, l }));
}

/**
 * Generate color palette based on type
 */
export function generatePalette(hsl: HSL, type: PaletteType): HSL[] {
  switch (type) {
    case 'complementary':
      return generateComplementary(hsl);
    case 'analogous':
      return generateAnalogous(hsl);
    case 'triadic':
      return generateTriadic(hsl);
    case 'tetradic':
      return generateTetradic(hsl);
    case 'monochromatic':
      return generateMonochromatic(hsl);
    default:
      return [hsl];
  }
}
