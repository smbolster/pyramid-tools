'use client';

import { Check, X } from 'lucide-react';
import { RGB } from '@/types/color-picker';
import { checkContrast, rgbToHex } from '@/lib/color-picker';

interface ContrastCheckerProps {
  foregroundColor: RGB;
  backgroundColor: RGB;
  onForegroundChange: (color: string) => void;
  onBackgroundChange: (color: string) => void;
}

function PassFailBadge({ passes }: { passes: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
        passes
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}
    >
      {passes ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {passes ? 'Pass' : 'Fail'}
    </span>
  );
}

export function ContrastChecker({
  foregroundColor,
  backgroundColor,
  onForegroundChange,
  onBackgroundChange,
}: ContrastCheckerProps) {
  const contrastResult = checkContrast(foregroundColor, backgroundColor);
  const foregroundHex = rgbToHex(foregroundColor);
  const backgroundHex = rgbToHex(backgroundColor);

  return (
    <div className="space-y-6">
      {/* Color Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fg-color" className="block text-sm font-medium text-foreground mb-2">
            Foreground (Text)
          </label>
          <div className="flex items-center gap-3">
            <input
              id="fg-color"
              type="color"
              value={foregroundHex}
              onChange={(e) => onForegroundChange(e.target.value)}
              className="w-16 h-16 rounded-lg border-2 border-border cursor-pointer"
            />
            <div className="flex-1">
              <input
                type="text"
                value={foregroundHex}
                onChange={(e) => onForegroundChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="bg-color" className="block text-sm font-medium text-foreground mb-2">
            Background
          </label>
          <div className="flex items-center gap-3">
            <input
              id="bg-color"
              type="color"
              value={backgroundHex}
              onChange={(e) => onBackgroundChange(e.target.value)}
              className="w-16 h-16 rounded-lg border-2 border-border cursor-pointer"
            />
            <div className="flex-1">
              <input
                type="text"
                value={backgroundHex}
                onChange={(e) => onBackgroundChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="#FFFFFF"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contrast Ratio Display */}
      <div className="rounded-lg border-2 border-border bg-card p-6 text-center">
        <div className="text-sm text-muted-foreground mb-2">Contrast Ratio</div>
        <div className="text-4xl font-bold text-foreground mb-4">
          {contrastResult.ratio.toFixed(2)}:1
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">AA Normal</div>
            <PassFailBadge passes={contrastResult.passesAA} />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">AA Large</div>
            <PassFailBadge passes={contrastResult.passesAALarge} />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">AAA Normal</div>
            <PassFailBadge passes={contrastResult.passesAAA} />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">AAA Large</div>
            <PassFailBadge passes={contrastResult.passesAAALarge} />
          </div>
        </div>
      </div>

      {/* Example Text Preview */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div
          className="p-6"
          style={{
            backgroundColor: backgroundHex,
            color: foregroundHex,
          }}
        >
          <p className="text-base mb-3">
            Normal text example. This demonstrates how readable your text will be at standard size.
            WCAG requires a contrast ratio of at least 4.5:1 for normal text (AA) or 7.0:1 for enhanced (AAA).
          </p>
          <p className="text-2xl font-bold">
            Large text example. This is considered large text (18pt+ or 14pt+ bold).
          </p>
        </div>
      </div>

      {/* WCAG Guidelines Info */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">WCAG Guidelines</h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>AA Normal Text:</span>
            <span className="font-medium">4.5:1 minimum</span>
          </div>
          <div className="flex justify-between">
            <span>AA Large Text:</span>
            <span className="font-medium">3.0:1 minimum</span>
          </div>
          <div className="flex justify-between">
            <span>AAA Normal Text:</span>
            <span className="font-medium">7.0:1 minimum</span>
          </div>
          <div className="flex justify-between">
            <span>AAA Large Text:</span>
            <span className="font-medium">4.5:1 minimum</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Large text is defined as 18pt (24px) or larger, or 14pt (18.5px) or larger if bold.
        </p>
      </div>
    </div>
  );
}
