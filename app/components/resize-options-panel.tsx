"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ResizeOptions,
  ResizeMode,
  ImageFormat,
  ResizePreset,
} from "@/types/image-resizer";
import { RESIZE_PRESETS } from "@/lib/image-resizer";

interface ResizeOptionsPanelProps {
  options: ResizeOptions;
  selectedPreset: string | null;
  onOptionsChange: (options: ResizeOptions) => void;
  onPresetSelected: (presetId: string | null) => void;
  disabled?: boolean;
}

export function ResizeOptionsPanel({
  options,
  selectedPreset,
  onOptionsChange,
  onPresetSelected,
  disabled = false,
}: ResizeOptionsPanelProps) {
  // Group presets by category
  const presetsByCategory = RESIZE_PRESETS.reduce(
    (acc, preset) => {
      if (!acc[preset.category]) {
        acc[preset.category] = [];
      }
      acc[preset.category].push(preset);
      return acc;
    },
    {} as Record<string, ResizePreset[]>
  );

  const handlePresetChange = (value: string) => {
    if (value === "custom") {
      onPresetSelected(null);
    } else {
      const preset = RESIZE_PRESETS.find((p) => p.id === value);
      if (preset) {
        onPresetSelected(preset.id);
        onOptionsChange({
          ...options,
          width: preset.width,
          height: preset.height,
        });
      }
    }
  };

  const handleWidthChange = (value: string) => {
    const width = value ? parseInt(value, 10) : undefined;
    onOptionsChange({ ...options, width });
    onPresetSelected(null);
  };

  const handleHeightChange = (value: string) => {
    const height = value ? parseInt(value, 10) : undefined;
    onOptionsChange({ ...options, height });
    onPresetSelected(null);
  };

  const handleModeChange = (value: ResizeMode) => {
    onOptionsChange({ ...options, mode: value });
  };

  const handleQualityChange = (value: number[]) => {
    onOptionsChange({ ...options, quality: value[0] });
  };

  const handleFormatChange = (value: string) => {
    const format = value === "original" ? undefined : (value as ImageFormat);
    onOptionsChange({ ...options, format });
  };

  const handleAspectRatioChange = (checked: boolean) => {
    onOptionsChange({ ...options, maintainAspectRatio: checked });
  };

  const showQualitySlider =
    options.format === ImageFormat.JPEG ||
    options.format === ImageFormat.WEBP ||
    options.format === ImageFormat.AVIF;

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground">Resize Options</h3>

      {/* Preset Selector */}
      <div className="space-y-2">
        <Label htmlFor="preset">Preset</Label>
        <Select
          value={selectedPreset || "custom"}
          onValueChange={handlePresetChange}
          disabled={disabled}
        >
          <SelectTrigger id="preset">
            <SelectValue placeholder="Select a preset or custom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom Dimensions</SelectItem>
            {Object.entries(presetsByCategory).map(([category, presets]) => (
              <SelectGroup key={category}>
                <SelectLabel>{category}</SelectLabel>
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name} ({preset.width}×{preset.height})
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Dimensions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Width (px)</Label>
          <Input
            id="width"
            type="number"
            min="1"
            value={options.width || ""}
            onChange={(e) => handleWidthChange(e.target.value)}
            placeholder="Auto"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (px)</Label>
          <Input
            id="height"
            type="number"
            min="1"
            value={options.height || ""}
            onChange={(e) => handleHeightChange(e.target.value)}
            placeholder="Auto"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Aspect Ratio Lock */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="aspectRatio"
          checked={options.maintainAspectRatio}
          onCheckedChange={handleAspectRatioChange}
          disabled={disabled}
        />
        <Label
          htmlFor="aspectRatio"
          className="text-sm font-normal cursor-pointer"
        >
          Maintain aspect ratio
        </Label>
      </div>

      {/* Resize Mode */}
      <div className="space-y-2">
        <Label htmlFor="mode">Resize Mode</Label>
        <Select
          value={options.mode}
          onValueChange={handleModeChange}
          disabled={disabled}
        >
          <SelectTrigger id="mode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ResizeMode.FIT}>
              Fit - Preserve aspect ratio, fit within dimensions
            </SelectItem>
            <SelectItem value={ResizeMode.FILL}>
              Fill - Crop to exact dimensions
            </SelectItem>
            <SelectItem value={ResizeMode.COVER}>
              Cover - Cover dimensions, may overflow
            </SelectItem>
            <SelectItem value={ResizeMode.CONTAIN}>
              Contain - Fit with background padding
            </SelectItem>
            <SelectItem value={ResizeMode.INSIDE}>
              Inside - Fit inside dimensions
            </SelectItem>
            <SelectItem value={ResizeMode.OUTSIDE}>
              Outside - Fit outside dimensions
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Output Format */}
      <div className="space-y-2">
        <Label htmlFor="format">Output Format</Label>
        <Select
          value={options.format || "original"}
          onValueChange={handleFormatChange}
          disabled={disabled}
        >
          <SelectTrigger id="format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="original">Keep Original</SelectItem>
            <SelectItem value={ImageFormat.JPEG}>JPEG</SelectItem>
            <SelectItem value={ImageFormat.PNG}>PNG</SelectItem>
            <SelectItem value={ImageFormat.WEBP}>WebP</SelectItem>
            <SelectItem value={ImageFormat.GIF}>GIF</SelectItem>
            <SelectItem value={ImageFormat.AVIF}>AVIF</SelectItem>
            <SelectItem value={ImageFormat.TIFF}>TIFF</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quality Slider (for JPEG/WebP/AVIF) */}
      {showQualitySlider && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="quality">Quality</Label>
            <span className="text-sm text-muted-foreground">
              {options.quality || 90}%
            </span>
          </div>
          <Slider
            id="quality"
            min={1}
            max={100}
            step={1}
            value={[options.quality || 90]}
            onValueChange={handleQualityChange}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Maximum</span>
          </div>
        </div>
      )}
    </div>
  );
}
