'use client';

/**
 * Split Method Selector Component
 * Allows user to choose and configure PDF split method
 */

import React from 'react';
import { Scissors, FileStack, ListOrdered, LayoutGrid, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SplitMethod, SplitConfig, SplitRange } from '@/types/pdf-splitter';
import {
  MIN_PAGES_PER_FILE,
  MAX_PAGES_PER_FILE,
  DEFAULT_PAGES_PER_FILE,
} from '@/types/pdf-splitter';

export interface SplitMethodSelectorProps {
  selectedMethod: SplitMethod;
  onMethodChange: (method: SplitMethod) => void;
  config: SplitConfig;
  onConfigChange: (config: Partial<SplitConfig>) => void;
  totalPages: number;
  selectedPageCount: number;
}

export function SplitMethodSelector({
  selectedMethod,
  onMethodChange,
  config,
  onConfigChange,
  totalPages,
  selectedPageCount,
}: SplitMethodSelectorProps) {
  const methods = [
    {
      id: 'extract' as const,
      icon: Scissors,
      name: 'Extract Selected Pages',
      description: 'Create a new PDF from selected pages',
      disabled: selectedPageCount === 0,
      disabledReason: 'Select at least one page to use this method',
    },
    {
      id: 'individual' as const,
      icon: FileStack,
      name: 'Split into Individual Pages',
      description: 'Create separate PDFs for each page',
      disabled: false,
      warning: totalPages > 50 ? `This will create ${totalPages} files` : undefined,
    },
    {
      id: 'ranges' as const,
      icon: ListOrdered,
      name: 'Split by Custom Ranges',
      description: 'Define custom page ranges',
      disabled: false,
    },
    {
      id: 'page-count' as const,
      icon: LayoutGrid,
      name: 'Split by Page Count',
      description: 'Split into files with fixed page count',
      disabled: false,
    },
  ];

  const handleAddRange = () => {
    const currentRanges = config.ranges || [];
    const lastRange = currentRanges[currentRanges.length - 1];
    const newStart = lastRange ? lastRange.end + 1 : 1;
    const newEnd = Math.min(newStart + 4, totalPages);

    onConfigChange({
      ranges: [
        ...currentRanges,
        { start: newStart, end: newEnd },
      ],
    });
  };

  const handleRemoveRange = (index: number) => {
    const currentRanges = config.ranges || [];
    onConfigChange({
      ranges: currentRanges.filter((_, i) => i !== index),
    });
  };

  const handleUpdateRange = (
    index: number,
    field: keyof SplitRange,
    value: string | number
  ) => {
    const currentRanges = config.ranges || [];
    const updatedRanges = [...currentRanges];
    updatedRanges[index] = {
      ...updatedRanges[index],
      [field]: value,
    };
    onConfigChange({ ranges: updatedRanges });
  };

  const validateRange = (range: SplitRange): string | null => {
    if (range.start < 1 || range.start > totalPages) {
      return 'Start page out of bounds';
    }
    if (range.end < 1 || range.end > totalPages) {
      return 'End page out of bounds';
    }
    if (range.start > range.end) {
      return 'Start must be ≤ end';
    }
    return null;
  };

  const estimateFileCount = (): number => {
    switch (selectedMethod) {
      case 'extract':
        return 1;
      case 'individual':
        return totalPages;
      case 'ranges':
        return config.ranges?.length || 0;
      case 'page-count':
        return config.pagesPerFile ? Math.ceil(totalPages / config.pagesPerFile) : 0;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Method selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {methods.map(method => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <button
              key={method.id}
              onClick={() => !method.disabled && onMethodChange(method.id)}
              disabled={method.disabled}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : method.disabled
                      ? 'border-border bg-muted/50 cursor-not-allowed opacity-60'
                      : 'border-border hover:border-primary/50 hover:bg-accent/50'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                    p-2 rounded-lg
                    ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1">{method.name}</h3>
                  <p className="text-xs text-muted-foreground">{method.description}</p>

                  {method.disabled && method.disabledReason && (
                    <p className="text-xs text-destructive mt-2">{method.disabledReason}</p>
                  )}

                  {method.warning && !method.disabled && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                      ⚠️ {method.warning}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Method-specific configuration */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="font-semibold mb-3 text-sm">Configuration</h3>

        {selectedMethod === 'extract' && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Selected pages will be extracted into a single PDF file.
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                {selectedPageCount} {selectedPageCount === 1 ? 'page' : 'pages'} selected
              </p>
            </div>
          </div>
        )}

        {selectedMethod === 'individual' && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Each page will be saved as a separate PDF file.
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                {totalPages} {totalPages === 1 ? 'file' : 'files'} will be created
              </p>
            </div>
          </div>
        )}

        {selectedMethod === 'ranges' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              Define page ranges. Each range will become a separate PDF.
            </p>

            {config.ranges && config.ranges.length > 0 ? (
              <div className="space-y-3">
                {config.ranges.map((range, index) => {
                  const error = validateRange(range);

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        error ? 'border-destructive bg-destructive/5' : 'border-border bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">
                              Start Page
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={totalPages}
                              value={range.start}
                              onChange={e =>
                                handleUpdateRange(index, 'start', parseInt(e.target.value, 10))
                              }
                              className="w-full px-2 py-1 text-sm rounded border border-border bg-background"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">
                              End Page
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={totalPages}
                              value={range.end}
                              onChange={e =>
                                handleUpdateRange(index, 'end', parseInt(e.target.value, 10))
                              }
                              className="w-full px-2 py-1 text-sm rounded border border-border bg-background"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground block mb-1">
                              Name (optional)
                            </label>
                            <input
                              type="text"
                              value={range.name || ''}
                              onChange={e => handleUpdateRange(index, 'name', e.target.value)}
                              placeholder="e.g., Chapter 1"
                              className="w-full px-2 py-1 text-sm rounded border border-border bg-background"
                            />
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRange(index)}
                          className="mt-5"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
                    </div>
                  );
                })}
              </div>
            ) : null}

            <Button variant="outline" size="sm" onClick={handleAddRange} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Range
            </Button>
          </div>
        )}

        {selectedMethod === 'page-count' && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-2">
                Pages per file
              </label>
              <input
                type="number"
                min={MIN_PAGES_PER_FILE}
                max={MAX_PAGES_PER_FILE}
                value={config.pagesPerFile || DEFAULT_PAGES_PER_FILE}
                onChange={e =>
                  onConfigChange({ pagesPerFile: parseInt(e.target.value, 10) })
                }
                className="w-full px-3 py-2 rounded border border-border bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Range: {MIN_PAGES_PER_FILE} - {MAX_PAGES_PER_FILE} pages
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                {estimateFileCount()} {estimateFileCount() === 1 ? 'file' : 'files'} will be
                created
              </p>
            </div>
          </div>
        )}

        {/* Estimated file count */}
        {estimateFileCount() > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated output:</span>
              <span className="font-semibold">
                {estimateFileCount()} {estimateFileCount() === 1 ? 'file' : 'files'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
