'use client';

import { useRef, useEffect, useState } from 'react';
import { HSL } from '@/types/color-picker';
import { hslToRgb, rgbToHex } from '@/lib/color-picker';

interface ColorPickerInterfaceProps {
  color: HSL;
  onChange: (color: HSL) => void;
}

export function ColorPickerInterface({ color, onChange }: ColorPickerInterfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Draw the saturation/lightness gradient
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Create gradient for the current hue
    // Horizontal: white to pure color (saturation)
    // Vertical: transparent to black (lightness)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const s = (x / width) * 100;
        const l = 100 - (y / height) * 100;
        const rgb = hslToRgb({ h: color.h, s, l });
        const hex = rgbToHex(rgb);
        ctx.fillStyle = hex;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [color.h]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const s = Math.round((x / rect.width) * 100);
    const l = Math.round(100 - (y / rect.height) * 100);

    onChange({ ...color, s: Math.max(0, Math.min(100, s)), l: Math.max(0, Math.min(100, l)) });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    handleCanvasClick(e);
  };

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...color, h: parseInt(e.target.value, 10) });
  };

  const handleSaturationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...color, s: parseInt(e.target.value, 10) });
  };

  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...color, l: parseInt(e.target.value, 10) });
  };

  // Calculate position of the indicator on the canvas
  const indicatorX = (color.s / 100) * 100; // percentage
  const indicatorY = (1 - color.l / 100) * 100; // percentage

  return (
    <div className="space-y-6">
      {/* Saturation/Lightness 2D Picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Saturation & Lightness
        </label>
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="w-full aspect-square rounded-lg border-2 border-border cursor-crosshair"
            onMouseDown={(e) => {
              setIsDragging(true);
              handleCanvasClick(e);
            }}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          />
          {/* Indicator circle */}
          <div
            className="absolute w-4 h-4 border-2 border-white rounded-full pointer-events-none shadow-lg"
            style={{
              left: `calc(${indicatorX}% - 8px)`,
              top: `calc(${indicatorY}% - 8px)`,
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
            }}
          />
        </div>
      </div>

      {/* Hue Slider */}
      <div className="space-y-2">
        <label htmlFor="hue-slider" className="block text-sm font-medium text-foreground">
          Hue: {color.h}°
        </label>
        <input
          id="hue-slider"
          type="range"
          min="0"
          max="360"
          value={color.h}
          onChange={handleHueChange}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer"
          style={{
            background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
          }}
        />
      </div>

      {/* Saturation Slider */}
      <div className="space-y-2">
        <label htmlFor="saturation-slider" className="block text-sm font-medium text-foreground">
          Saturation: {color.s}%
        </label>
        <input
          id="saturation-slider"
          type="range"
          min="0"
          max="100"
          value={color.s}
          onChange={handleSaturationChange}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      {/* Lightness Slider */}
      <div className="space-y-2">
        <label htmlFor="lightness-slider" className="block text-sm font-medium text-foreground">
          Lightness: {color.l}%
        </label>
        <input
          id="lightness-slider"
          type="range"
          min="0"
          max="100"
          value={color.l}
          onChange={handleLightnessChange}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>

      {/* Manual Input Fields */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor="h-input" className="block text-xs font-medium text-muted-foreground mb-1">
            H (0-360)
          </label>
          <input
            id="h-input"
            type="number"
            min="0"
            max="360"
            value={color.h}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10) || 0;
              onChange({ ...color, h: Math.max(0, Math.min(360, val)) });
            }}
            className="w-full px-2 py-1 text-sm rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="s-input" className="block text-xs font-medium text-muted-foreground mb-1">
            S (0-100)
          </label>
          <input
            id="s-input"
            type="number"
            min="0"
            max="100"
            value={color.s}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10) || 0;
              onChange({ ...color, s: Math.max(0, Math.min(100, val)) });
            }}
            className="w-full px-2 py-1 text-sm rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label htmlFor="l-input" className="block text-xs font-medium text-muted-foreground mb-1">
            L (0-100)
          </label>
          <input
            id="l-input"
            type="number"
            min="0"
            max="100"
            value={color.l}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10) || 0;
              onChange({ ...color, l: Math.max(0, Math.min(100, val)) });
            }}
            className="w-full px-2 py-1 text-sm rounded border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
}
