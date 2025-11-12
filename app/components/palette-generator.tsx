'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HSL, PaletteType, PALETTE_DESCRIPTIONS } from '@/types/color-picker';
import { generatePalette, hslToRgb, rgbToHex } from '@/lib/color-picker';

interface PaletteGeneratorProps {
  baseColor: HSL;
  onColorSelect: (color: HSL) => void;
}

export function PaletteGenerator({ baseColor, onColorSelect }: PaletteGeneratorProps) {
  const [selectedType, setSelectedType] = useState<PaletteType>('complementary');
  const [copiedPalette, setCopiedPalette] = useState(false);

  const palette = generatePalette(baseColor, selectedType);
  const paletteHexColors = palette.map((hsl) => rgbToHex(hslToRgb(hsl)));

  const copyPalette = async () => {
    try {
      await navigator.clipboard.writeText(paletteHexColors.join(', '));
      setCopiedPalette(true);
      setTimeout(() => setCopiedPalette(false), 2000);
    } catch (err) {
      console.error('Failed to copy palette:', err);
    }
  };

  const paletteTypes: PaletteType[] = [
    'complementary',
    'analogous',
    'triadic',
    'tetradic',
    'monochromatic',
  ];

  return (
    <div className="space-y-6">
      {/* Palette Type Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">Palette Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {paletteTypes.map((type) => (
            <label
              key={type}
              className="flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="paletteType"
                value={type}
                checked={selectedType === type}
                onChange={(e) => setSelectedType(e.target.value as PaletteType)}
                className="mt-1 w-4 h-4 focus:ring-2 focus:ring-primary"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground capitalize mb-1">
                  {type}
                </div>
                <div className="text-xs text-muted-foreground">
                  {PALETTE_DESCRIPTIONS[type]}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Generated Palette Display */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Generated Palette</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={copyPalette}
            className="gap-2"
          >
            {copiedPalette ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy All
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {palette.map((hsl, index) => {
            const rgb = hslToRgb(hsl);
            const hex = rgbToHex(rgb);
            return (
              <button
                key={index}
                onClick={() => onColorSelect(hsl)}
                className="group relative rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={`Select color ${hex}`}
              >
                <div
                  className="aspect-square"
                  style={{ backgroundColor: hex }}
                />
                <div className="p-2 bg-card">
                  <div className="text-xs font-mono text-foreground text-center">
                    {hex}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Click on any color to use it as your main color
        </p>
      </div>
    </div>
  );
}
