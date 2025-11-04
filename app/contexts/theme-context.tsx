'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, EffectiveTheme, ThemeContextType, THEME_STORAGE_KEY, DEFAULT_THEME } from '@/types/theme';

/**
 * Theme context for managing dark mode state across the application
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Props for ThemeProvider component
 */
interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider component that manages theme state and persistence
 *
 * Features:
 * - Detects system color scheme preference
 * - Persists theme choice to localStorage
 * - Applies 'dark' class to HTML element
 * - Listens for system preference changes when theme is 'system'
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themePreference, setThemePreference] = useState<Theme>(DEFAULT_THEME);
  const [theme, setTheme] = useState<EffectiveTheme>('light');

  /**
   * Get the effective theme based on preference and system settings
   */
  const getEffectiveTheme = (preference: Theme): EffectiveTheme => {
    if (preference === 'system') {
      // Check system preference
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return preference;
  };

  /**
   * Apply theme to the DOM
   */
  const applyTheme = (effectiveTheme: EffectiveTheme) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  /**
   * Initialize theme on mount
   */
  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initialPreference = savedTheme || DEFAULT_THEME;

    setThemePreference(initialPreference);
    const effectiveTheme = getEffectiveTheme(initialPreference);
    setTheme(effectiveTheme);
    applyTheme(effectiveTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Listen for system preference changes when theme is 'system'
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (themePreference === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [themePreference]);

  /**
   * Update theme preference
   */
  const updateTheme = (newPreference: Theme) => {
    setThemePreference(newPreference);
    const effectiveTheme = getEffectiveTheme(newPreference);
    setTheme(effectiveTheme);
    applyTheme(effectiveTheme);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newPreference);
      } catch (error) {
        // localStorage might be disabled, fail gracefully
        console.warn('Failed to save theme preference:', error);
      }
    }
  };

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    const currentEffective = getEffectiveTheme(themePreference);
    const newTheme = currentEffective === 'dark' ? 'light' : 'dark';
    updateTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    themePreference,
    setTheme: updateTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
