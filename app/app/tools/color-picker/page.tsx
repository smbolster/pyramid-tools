'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Palette, Droplet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { ColorDisplayGrid } from '@/components/color-display-grid';
import { ColorPickerInterface } from '@/components/color-picker-interface';
import { ContrastChecker } from '@/components/contrast-checker';
import { PaletteGenerator } from '@/components/palette-generator';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  rgbToCmyk,
  isValidHex,
  normalizeHex,
} from '@/lib/color-picker';
import { HSL, DEFAULT_COLOR, MAX_RECENT_COLORS } from '@/types/color-picker';

const STORAGE_KEY = 'pyramid-tools-recent-colors';

export default function ColorPickerPage() {
  // Initialize with default color
  const [currentColor, setCurrentColor] = useState<HSL>(() => {
    const rgb = hexToRgb(DEFAULT_COLOR);
    return rgb ? rgbToHsl(rgb) : { h: 217, s: 91, l: 60 };
  });

  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [showContrast, setShowContrast] = useState(false);
  const [hexInput, setHexInput] = useState(DEFAULT_COLOR);
  const [contrastFg, setContrastFg] = useState('#000000');
  const [contrastBg, setContrastBg] = useState('#FFFFFF');

  // Load recent colors from localStorage
  useEffect(() => {
    const loadRecentColors = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setRecentColors(parsed);
          }
        }
      } catch (err) {
        console.error('Failed to load recent colors:', err);
      }
    };
    loadRecentColors();
  }, []);

  // Update hex input and save recent colors when current color changes
  useEffect(() => {
    const updateColorHistory = () => {
      const rgb = hslToRgb(currentColor);
      const hex = rgbToHex(rgb);
      setHexInput(hex);

      // Add to recent colors
      try {
        setRecentColors((prev) => {
          const newRecent = [hex, ...prev.filter((c) => c !== hex)].slice(
            0,
            MAX_RECENT_COLORS
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecent));
          return newRecent;
        });
      } catch (err) {
        console.error('Failed to save recent colors:', err);
      }
    };
    updateColorHistory();
  }, [currentColor]);

  const handleColorChange = (newColor: HSL) => {
    setCurrentColor(newColor);
  };

  const handleHexInputChange = (value: string) => {
    setHexInput(value);
    if (isValidHex(value)) {
      const rgb = hexToRgb(value);
      if (rgb) {
        setCurrentColor(rgbToHsl(rgb));
      }
    }
  };

  const handleRecentColorClick = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (rgb) {
      setCurrentColor(rgbToHsl(rgb));
    }
  };

  const handleReset = () => {
    const rgb = hexToRgb(DEFAULT_COLOR);
    if (rgb) {
      setCurrentColor(rgbToHsl(rgb));
    }
  };

  const handleClearHistory = () => {
    setRecentColors([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const handleContrastFgChange = (hex: string) => {
    if (isValidHex(hex)) {
      setContrastFg(normalizeHex(hex));
    }
  };

  const handleContrastBgChange = (hex: string) => {
    if (isValidHex(hex)) {
      setContrastBg(normalizeHex(hex));
    }
  };

  // Convert current color to all formats
  const rgb = hslToRgb(currentColor);
  const hex = rgbToHex(rgb);
  const hsv = rgbToHsv(rgb);
  const cmyk = rgbToCmyk(rgb);

  // Check if EyeDropper is supported
  const isEyeDropperSupported = typeof window !== 'undefined' && 'EyeDropper' in window;

  const handleEyeDropper = async () => {
    if (!isEyeDropperSupported) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eyeDropper = new (window as any).EyeDropper();
      const result = await eyeDropper.open();
      const selectedHex = result.sRGBHex;
      const rgb = hexToRgb(selectedHex);
      if (rgb) {
        setCurrentColor(rgbToHsl(rgb));
      }
    } catch (err) {
      // User cancelled or error occurred
      console.log('EyeDropper cancelled or failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Theme toggle in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            Back to Tools
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Color Picker
            </h1>
            <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent"></div>
            <p className="mt-6 text-lg text-muted-foreground">
              Pick colors, convert between formats, and check accessibility contrast ratios.
              All processing happens in your browser.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Color Picker */}
          <div className="space-y-6">
            {/* Color Picker Interface */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Pick a Color</h2>
              <ColorPickerInterface color={currentColor} onChange={handleColorChange} />
            </div>

            {/* HEX Input & Actions */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Color Input</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="hex-input" className="block text-sm font-medium text-foreground mb-2">
                    Enter HEX Color
                  </label>
                  <input
                    id="hex-input"
                    type="text"
                    value={hexInput}
                    onChange={(e) => handleHexInputChange(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="#3B82F6"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {isEyeDropperSupported && (
                    <Button
                      onClick={handleEyeDropper}
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <Droplet className="h-4 w-4" />
                      Pick from Screen
                    </Button>
                  )}
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>

                {!isEyeDropperSupported && (
                  <p className="text-xs text-muted-foreground">
                    EyeDropper is not supported in your browser. Try Chrome or Edge.
                  </p>
                )}
              </div>
            </div>

            {/* Recent Colors */}
            {recentColors.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Recent Colors</h2>
                  <Button
                    onClick={handleClearHistory}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {recentColors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentColorClick(color)}
                      className="aspect-square rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ backgroundColor: color }}
                      aria-label={`Recent color ${color}`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Color Display & Info */}
          <div className="space-y-6">
            {/* Color Display Grid */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Color Formats</h2>
              <ColorDisplayGrid hex={hex} rgb={rgb} hsl={currentColor} hsv={hsv} cmyk={cmyk} />
            </div>
          </div>
        </div>

        {/* Contrast Checker */}
        <div className="mb-8">
          <button
            onClick={() => setShowContrast(!showContrast)}
            className="w-full rounded-lg border-2 border-border bg-card p-4 hover:border-primary transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Contrast Checker</h2>
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-primary">
              {showContrast ? 'Hide' : 'Show'}
            </span>
          </button>
          {showContrast && (
            <div className="mt-4 rounded-lg border border-border bg-card p-6">
              <ContrastChecker
                foregroundColor={hexToRgb(contrastFg) || { r: 0, g: 0, b: 0 }}
                backgroundColor={hexToRgb(contrastBg) || { r: 255, g: 255, b: 255 }}
                onForegroundChange={handleContrastFgChange}
                onBackgroundChange={handleContrastBgChange}
              />
            </div>
          )}
        </div>

        {/* Palette Generator */}
        <div className="mb-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Color Palettes</h2>
            <PaletteGenerator baseColor={currentColor} onColorSelect={handleColorChange} />
          </div>
        </div>

        {/* Information Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">About This Tool</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Color Formats</h3>
              <ul className="space-y-2">
                <li><strong>HEX:</strong> Used in web design, CSS, HTML</li>
                <li><strong>RGB:</strong> Additive color model for displays</li>
                <li><strong>HSL:</strong> Intuitive for designers (Hue, Saturation, Lightness)</li>
                <li><strong>HSV:</strong> Similar to HSL, used in design software</li>
                <li><strong>CMYK:</strong> Subtractive model for printing</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Accessibility (WCAG)</h3>
              <ul className="space-y-2">
                <li><strong>AA Normal:</strong> 4.5:1 (minimum for body text)</li>
                <li><strong>AA Large:</strong> 3.0:1 (18pt+ or 14pt+ bold)</li>
                <li><strong>AAA Normal:</strong> 7.0:1 (enhanced)</li>
                <li><strong>AAA Large:</strong> 4.5:1 (enhanced)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Color Harmonies</h3>
              <ul className="space-y-2">
                <li><strong>Complementary:</strong> Opposite colors, high contrast</li>
                <li><strong>Analogous:</strong> Adjacent colors, harmonious</li>
                <li><strong>Triadic:</strong> Evenly spaced, balanced</li>
                <li><strong>Tetradic:</strong> Rectangle on wheel, rich</li>
                <li><strong>Monochromatic:</strong> Single hue variations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Tips</h3>
              <ul className="space-y-2">
                <li>Use high contrast for readability</li>
                <li>Test colors with actual users</li>
                <li>Consider color blindness</li>
                <li>Don&apos;t rely solely on color for information</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Privacy:</strong> All processing happens in your browser.
              Recent colors are stored locally only. No data is sent to any server.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
