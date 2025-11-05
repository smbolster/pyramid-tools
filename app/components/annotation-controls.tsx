'use client'

/**
 * Annotation Controls Component
 *
 * Provides controls for customizing annotation properties like color,
 * stroke width, opacity, font size, and fill options.
 */

import { ToolConfig, AnnotationTool } from '@/types/screenshot-annotator'

interface AnnotationControlsProps {
  config: ToolConfig
  onConfigChange: (updates: Partial<ToolConfig>) => void
  currentTool: AnnotationTool
  disabled?: boolean
}

export function AnnotationControls({
  config,
  onConfigChange,
  currentTool,
  disabled = false
}: AnnotationControlsProps) {
  const showFontSize = currentTool === 'text'
  const showFillToggle = currentTool === 'rectangle' || currentTool === 'circle'

  return (
    <div className="space-y-4">
      {/* Color Picker */}
      <div className="space-y-2">
        <label htmlFor="color" className="text-xs font-medium">Color</label>
        <div className="flex items-center gap-2">
          <input
            id="color"
            type="color"
            value={config.color}
            onChange={(e) => onConfigChange({ color: e.target.value })}
            disabled={disabled}
            className="h-10 w-full cursor-pointer rounded border border-border"
          />
        </div>
      </div>

      {/* Stroke Width */}
      <div className="space-y-2">
        <label htmlFor="strokeWidth" className="text-xs font-medium flex items-center justify-between">
          <span>Stroke Width</span>
          <span className="text-muted-foreground">{config.strokeWidth}px</span>
        </label>
        <input
          id="strokeWidth"
          type="range"
          min="1"
          max="20"
          step="1"
          value={config.strokeWidth}
          onChange={(e) => onConfigChange({ strokeWidth: parseInt(e.target.value) })}
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <label htmlFor="opacity" className="text-xs font-medium flex items-center justify-between">
          <span>Opacity</span>
          <span className="text-muted-foreground">{Math.round(config.opacity * 100)}%</span>
        </label>
        <input
          id="opacity"
          type="range"
          min="0"
          max="100"
          step="5"
          value={config.opacity * 100}
          onChange={(e) => onConfigChange({ opacity: parseInt(e.target.value) / 100 })}
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Font Size (Text tool only) */}
      {showFontSize && (
        <div className="space-y-2">
          <label htmlFor="fontSize" className="text-xs font-medium flex items-center justify-between">
            <span>Font Size</span>
            <span className="text-muted-foreground">{config.fontSize}px</span>
          </label>
          <input
            id="fontSize"
            type="range"
            min="12"
            max="72"
            step="2"
            value={config.fontSize}
            onChange={(e) => onConfigChange({ fontSize: parseInt(e.target.value) })}
            disabled={disabled}
            className="w-full"
          />
        </div>
      )}

      {/* Fill Toggle (Shapes only) */}
      {showFillToggle && (
        <div className="flex items-center space-x-2">
          <input
            id="filled"
            type="checkbox"
            checked={config.filled}
            onChange={(e) => onConfigChange({ filled: e.target.checked })}
            disabled={disabled}
            className="h-4 w-4 rounded border-primary cursor-pointer"
          />
          <label
            htmlFor="filled"
            className="text-xs font-normal cursor-pointer"
          >
            Fill Shape
          </label>
        </div>
      )}
    </div>
  )
}
