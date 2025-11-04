/**
 * Theme system type definitions for Pyramid Tools
 */

/**
 * Theme options available to the user
 * - 'light': Light color theme
 * - 'dark': Dark color theme
 * - 'system': Follow system preference
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Effective theme applied to the UI (excludes 'system')
 */
export type EffectiveTheme = 'light' | 'dark';

/**
 * Theme context type providing theme state and controls
 */
export interface ThemeContextType {
  /** Current effective theme applied to the UI */
  theme: EffectiveTheme;
  /** User's theme preference (can include 'system') */
  themePreference: Theme;
  /** Set the theme preference */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark themes */
  toggleTheme: () => void;
}

/**
 * localStorage key for persisting theme preference
 */
export const THEME_STORAGE_KEY = 'pyramid-tools-theme';

/**
 * Default theme when no preference is set
 */
export const DEFAULT_THEME: Theme = 'system';
