'use client';

/**
 * PDF Page Grid Component
 * Displays PDF pages as a grid of thumbnails with selection capabilities
 */

import React, { useState } from 'react';
import { Check, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PdfPageState } from '@/types/pdf-splitter';

export interface PdfPageGridProps {
  pages: PdfPageState[];
  selectedPages: Set<number>;
  onPageSelect: (pageNumber: number) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  disabled?: boolean;
}

export function PdfPageGrid({
  pages,
  selectedPages,
  onPageSelect,
  onSelectAll,
  onSelectNone,
  disabled = false,
}: PdfPageGridProps) {
  const [lastClickedPage, setLastClickedPage] = useState<number | null>(null);

  const handlePageClick = (pageNumber: number, shiftKey: boolean) => {
    if (disabled) return;

    if (shiftKey && lastClickedPage !== null) {
      // Range selection with shift-click
      const start = Math.min(lastClickedPage, pageNumber);
      const end = Math.max(lastClickedPage, pageNumber);
      for (let i = start; i <= end; i++) {
        if (!selectedPages.has(i)) {
          onPageSelect(i);
        }
      }
    } else {
      // Single page toggle
      onPageSelect(pageNumber);
    }

    setLastClickedPage(pageNumber);
  };

  const selectedCount = selectedPages.size;
  const totalCount = pages.length;

  return (
    <div className="space-y-4">
      {/* Selection controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-sm text-muted-foreground">
          {selectedCount > 0 ? (
            <span className="font-medium text-foreground">
              {selectedCount} of {totalCount} pages selected
            </span>
          ) : (
            <span>
              {totalCount} {totalCount === 1 ? 'page' : 'pages'}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            disabled={disabled || selectedCount === totalCount}
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectNone}
            disabled={disabled || selectedCount === 0}
          >
            Select None
          </Button>
        </div>
      </div>

      {/* Page grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pages.map(page => {
          const isSelected = selectedPages.has(page.pageNumber);

          return (
            <div
              key={page.pageNumber}
              className={`
                relative group cursor-pointer rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
              `}
              onClick={e => handlePageClick(page.pageNumber, e.shiftKey)}
            >
              {/* Checkbox indicator */}
              <div className="absolute top-2 right-2 z-10">
                <div
                  className={`
                    w-6 h-6 rounded flex items-center justify-center transition-colors
                    ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border-2 border-border group-hover:border-primary/50'
                    }
                  `}
                >
                  {isSelected ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4 opacity-0 group-hover:opacity-50" />
                  )}
                </div>
              </div>

              {/* Thumbnail */}
              <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg bg-muted">
                {page.isLoading || !page.thumbnail ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-pulse bg-muted-foreground/20 w-full h-full" />
                  </div>
                ) : (
                  <img
                    src={page.thumbnail}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Page number */}
              <div className="p-2 text-center">
                <span className="text-sm font-medium">Page {page.pageNumber}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint text */}
      {!disabled && totalCount > 1 && (
        <div className="text-xs text-muted-foreground text-center">
          Tip: Hold Shift and click to select a range of pages
        </div>
      )}
    </div>
  );
}
