'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  formatRgbString,
  formatHslString,
  formatHsvString,
  formatCmykString,
} from '@/lib/color-picker';
import { RGB, HSL, HSV, CMYK } from '@/types/color-picker';

interface ColorDisplayGridProps {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  hsv: HSV;
  cmyk: CMYK;
}

export function ColorDisplayGrid({ hex, rgb, hsl, hsv, cmyk }: ColorDisplayGridProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formats = [
    { name: 'HEX', value: hex, displayValue: hex },
    { name: 'RGB', value: formatRgbString(rgb), displayValue: `${rgb.r}, ${rgb.g}, ${rgb.b}` },
    { name: 'HSL', value: formatHslString(hsl), displayValue: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%` },
    { name: 'HSV', value: formatHsvString(hsv), displayValue: `${hsv.h}°, ${hsv.s}%, ${hsv.v}%` },
    { name: 'CMYK', value: formatCmykString(cmyk), displayValue: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%` },
  ];

  return (
    <div className="space-y-6">
      {/* Large color preview */}
      <div
        className="w-full aspect-square rounded-lg border-2 border-border shadow-lg"
        style={{ backgroundColor: hex }}
        aria-label={`Color preview: ${hex}`}
      />

      {/* Format cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {formats.map((format) => (
          <div
            key={format.name}
            className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-muted-foreground mb-1">
                  {format.name}
                </div>
                <div className="text-sm font-mono text-foreground break-all">
                  {format.displayValue}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(format.value, format.name)}
                className="shrink-0"
                aria-label={`Copy ${format.name} value`}
              >
                {copiedFormat === format.name ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
