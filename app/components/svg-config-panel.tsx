'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  SVGConversionOptions,
  ColorMode,
  DEFAULT_OPTIONS,
  PRESET_OPTIONS,
} from '@/types/image-to-svg';

export interface SVGConfigPanelProps {
  options: SVGConversionOptions;
  onOptionsChange: (options: SVGConversionOptions) => void;
  disabled?: boolean;
}

export function SVGConfigPanel({
  options,
  onOptionsChange,
  disabled = false,
}: SVGConfigPanelProps) {
  const handlePresetClick = (
    preset: 'logo' | 'photo' | 'icon' | 'illustration'
  ) => {
    onOptionsChange({ ...PRESET_OPTIONS[preset] });
  };

  const handleColorModeChange = (mode: ColorMode) => {
    onOptionsChange({ ...options, colorMode: mode });
  };

  const handleNumberOfColorsChange = (value: number) => {
    onOptionsChange({ ...options, numberOfColors: value });
  };

  const handlePathPrecisionChange = (value: number) => {
    onOptionsChange({ ...options, pathPrecision: value });
  };

  const handleThresholdChange = (value: number) => {
    onOptionsChange({ ...options, threshold: value });
  };

  const handleSimplificationChange = (value: number) => {
    onOptionsChange({ ...options, simplificationTolerance: value });
  };

  const handleReset = () => {
    onOptionsChange({ ...DEFAULT_OPTIONS });
  };

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      {/* Presets */}
      <div>
        <Label className="mb-3 block text-base font-semibold">Presets</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick('logo')}
            disabled={disabled}
          >
            Logo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick('photo')}
            disabled={disabled}
          >
            Photo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick('icon')}
            disabled={disabled}
          >
            Icon
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick('illustration')}
            disabled={disabled}
          >
            Illustration
          </Button>
        </div>
      </div>

      {/* Color Mode */}
      <div>
        <Label className="mb-3 block text-base font-semibold">
          Color Mode
        </Label>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleColorModeChange(ColorMode.COLOR)}
            disabled={disabled}
            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
              options.colorMode === ColorMode.COLOR
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-secondary/50'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <div
              className={`h-4 w-4 rounded-full border-2 ${
                options.colorMode === ColorMode.COLOR
                  ? 'border-primary bg-primary'
                  : 'border-border'
              }`}
            />
            <span className="font-medium">Full Color</span>
          </button>
          <button
            type="button"
            onClick={() => handleColorModeChange(ColorMode.GRAYSCALE)}
            disabled={disabled}
            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
              options.colorMode === ColorMode.GRAYSCALE
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-secondary/50'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <div
              className={`h-4 w-4 rounded-full border-2 ${
                options.colorMode === ColorMode.GRAYSCALE
                  ? 'border-primary bg-primary'
                  : 'border-border'
              }`}
            />
            <span className="font-medium">Grayscale</span>
          </button>
          <button
            type="button"
            onClick={() => handleColorModeChange(ColorMode.BLACKWHITE)}
            disabled={disabled}
            className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
              options.colorMode === ColorMode.BLACKWHITE
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-secondary/50'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <div
              className={`h-4 w-4 rounded-full border-2 ${
                options.colorMode === ColorMode.BLACKWHITE
                  ? 'border-primary bg-primary'
                  : 'border-border'
              }`}
            />
            <span className="font-medium">Black & White</span>
          </button>
        </div>
      </div>

      {/* Color Precision */}
      {(options.colorMode === ColorMode.COLOR ||
        options.colorMode === ColorMode.GRAYSCALE) && (
        <div>
          <Label className="mb-2 block">
            Color Precision:{' '}
            <span className="font-semibold">{options.numberOfColors}</span>{' '}
            colors
          </Label>
          <input
            type="range"
            min="2"
            max="64"
            step="1"
            value={options.numberOfColors}
            onChange={(e) => handleNumberOfColorsChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Simple (2)</span>
            <span>Detailed (64)</span>
          </div>
        </div>
      )}

      {/* Threshold (Black & White only) */}
      {options.colorMode === ColorMode.BLACKWHITE && (
        <div>
          <Label className="mb-2 block">
            Threshold:{' '}
            <span className="font-semibold">{options.threshold}</span>
          </Label>
          <input
            type="range"
            min="0"
            max="255"
            step="1"
            value={options.threshold}
            onChange={(e) => handleThresholdChange(Number(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Dark (0)</span>
            <span>Light (255)</span>
          </div>
        </div>
      )}

      {/* Path Precision */}
      <div>
        <Label className="mb-2 block">
          Path Detail:{' '}
          <span className="font-semibold">
            {options.pathPrecision <= 0.8
              ? 'High'
              : options.pathPrecision <= 1.5
                ? 'Medium'
                : 'Low'}
          </span>
        </Label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={options.pathPrecision}
          onChange={(e) => handlePathPrecisionChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>High detail</span>
          <span>Low detail</span>
        </div>
      </div>

      {/* Simplification */}
      <div>
        <Label className="mb-2 block">
          Path Smoothing:{' '}
          <span className="font-semibold">{options.simplificationTolerance}</span>
        </Label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={options.simplificationTolerance}
          onChange={(e) => handleSimplificationChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>Detailed (0)</span>
          <span>Smooth (10)</span>
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-2">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={disabled}
          className="w-full"
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
