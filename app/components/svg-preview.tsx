'use client';

import { useState } from 'react';
import { Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/image-to-svg';
import { cn } from '@/lib/utils';

export interface SVGPreviewProps {
  originalImageUrl: string | null;
  svgDataUrl: string | null;
  originalSize: number;
  svgSize: number;
  compressionRatio: number;
  isProcessing: boolean;
  error: string | null;
}

type ViewMode = 'split' | 'original' | 'svg';

export function SVGPreview({
  originalImageUrl,
  svgDataUrl,
  originalSize,
  svgSize,
  compressionRatio,
  isProcessing,
  error,
}: SVGPreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.25));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  if (!originalImageUrl && !isProcessing) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">
          Upload an image to see the preview
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* View Mode Selector */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'original' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('original')}
          >
            Original
          </Button>
          <Button
            variant={viewMode === 'split' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('split')}
          >
            Split
          </Button>
          <Button
            variant={viewMode === 'svg' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('svg')}
            disabled={!svgDataUrl}
          >
            SVG
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.25}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[4rem] text-center text-sm">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 4}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleResetZoom}
            disabled={zoomLevel === 1}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div
        className={cn(
          'grid gap-4 rounded-lg border border-border bg-card p-4',
          viewMode === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'
        )}
      >
        {/* Original Image */}
        {(viewMode === 'original' || viewMode === 'split') &&
          originalImageUrl && (
            <div className="relative overflow-hidden rounded-lg border border-border bg-secondary/20">
              <div className="absolute left-2 top-2 z-10 rounded bg-background/80 px-2 py-1 text-xs font-medium">
                Original
              </div>
              <div className="flex min-h-[300px] items-center justify-center overflow-auto p-4">
                <img
                  src={originalImageUrl}
                  alt="Original"
                  className="max-h-[500px] transition-transform"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              </div>
            </div>
          )}

        {/* SVG Preview */}
        {(viewMode === 'svg' || viewMode === 'split') && (
          <div className="relative overflow-hidden rounded-lg border border-border bg-secondary/20">
            <div className="absolute left-2 top-2 z-10 rounded bg-background/80 px-2 py-1 text-xs font-medium">
              SVG
            </div>
            <div className="flex min-h-[300px] items-center justify-center overflow-auto p-4">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Converting to SVG...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              ) : svgDataUrl ? (
                <img
                  src={svgDataUrl}
                  alt="SVG"
                  className="max-h-[500px] transition-transform"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  SVG will appear here
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* File Size Comparison */}
      {originalSize > 0 && svgSize > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Original Size</p>
              <p className="text-lg font-semibold">
                {formatFileSize(originalSize)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SVG Size</p>
              <p className="text-lg font-semibold">
                {formatFileSize(svgSize)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ratio</p>
              <p
                className={cn(
                  'text-lg font-semibold',
                  compressionRatio < 100
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {compressionRatio.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
