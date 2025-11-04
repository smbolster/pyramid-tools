'use client';

/**
 * Split Results Preview Component
 * Displays results of PDF splitting with download options
 */

import React from 'react';
import { Download, FileText, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SplitResult } from '@/types/pdf-splitter';

export interface SplitResultsPreviewProps {
  results: SplitResult[] | null;
  isProcessing: boolean;
  onDownload: (index: number) => void;
  onDownloadAll: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SplitResultsPreview({
  results,
  isProcessing,
  onDownload,
  onDownloadAll,
}: SplitResultsPreviewProps) {
  if (isProcessing) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="text-center">
            <p className="font-semibold mb-1">Splitting PDF...</p>
            <p className="text-sm text-muted-foreground">
              This may take a moment for large files
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <FileText className="w-8 h-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Configure your split method and click &quot;Split PDF&quot; to begin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success message and download all button */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-green-600 dark:text-green-400 mb-1">
              ✓ Split complete!
            </p>
            <p className="text-sm text-muted-foreground">
              Created {results.length} {results.length === 1 ? 'file' : 'files'}
            </p>
          </div>

          {results.length > 1 && (
            <Button onClick={onDownloadAll} size="sm">
              <Package className="w-4 h-4 mr-2" />
              Download All as ZIP
            </Button>
          )}
        </div>
      </div>

      {/* Individual results */}
      <div className="space-y-2">
        {results.map((result, index) => {
          const pageRangeText =
            result.pageNumbers.length === 1
              ? `Page ${result.pageNumbers[0]}`
              : result.pageNumbers.length <= 5
                ? `Pages ${result.pageNumbers.join(', ')}`
                : `Pages ${result.pageNumbers[0]}-${result.pageNumbers[result.pageNumbers.length - 1]}`;

          return (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate mb-1">{result.filename}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{pageRangeText}</span>
                    <span>•</span>
                    <span>{result.pageCount} {result.pageCount === 1 ? 'page' : 'pages'}</span>
                    <span>•</span>
                    <span>{formatFileSize(result.size)}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(index)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help text */}
      {results.length > 1 && (
        <div className="text-xs text-muted-foreground text-center">
          Tip: Use &quot;Download All as ZIP&quot; to get all files in a single archive
        </div>
      )}
    </div>
  );
}
