"use client";

import { useState } from "react";
import Image from "next/image";
import { GripVertical, X, FileText, Loader2 } from "lucide-react";
import { PdfFileState } from "@/types/pdf-merger";
import { formatFileSize } from "@/lib/pdf-merger";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PdfFileItemProps {
  pdfFile: PdfFileState;
  index: number;
  onRemove: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
  disabled?: boolean;
}

export function PdfFileItem({
  pdfFile,
  index,
  onRemove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  disabled = false,
}: PdfFileItemProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      draggable={!disabled}
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      className={cn(
        "flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all duration-200",
        isDragging && "opacity-50",
        !disabled && "cursor-move hover:border-primary/50 hover:bg-accent/20",
        disabled && "opacity-60 cursor-not-allowed",
        pdfFile.error && "border-destructive/50 bg-destructive/5"
      )}
      role="listitem"
    >
      {/* Drag Handle */}
      {!disabled && (
        <div
          className="flex-shrink-0 cursor-grab active:cursor-grabbing"
          aria-label={`Drag to reorder ${pdfFile.name}`}
        >
          <GripVertical className="size-5 text-muted-foreground" />
        </div>
      )}

      {/* Preview or Icon */}
      <div className="flex-shrink-0">
        {pdfFile.preview && !imageError ? (
          <Image
            src={pdfFile.preview}
            alt={`Preview of ${pdfFile.name}`}
            width={64}
            height={64}
            className="size-16 rounded object-cover border border-border"
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded bg-muted border border-border">
            {pdfFile.preview === null && pdfFile.pageCount === null ? (
              <Loader2 className="size-8 text-muted-foreground animate-spin" />
            ) : (
              <FileText className="size-8 text-muted-foreground" />
            )}
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {pdfFile.name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{formatFileSize(pdfFile.size)}</span>
              {pdfFile.pageCount !== null && (
                <>
                  <span>•</span>
                  <span>
                    {pdfFile.pageCount} {pdfFile.pageCount === 1 ? "page" : "pages"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(pdfFile.id)}
            disabled={disabled}
            className="flex-shrink-0 size-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Remove ${pdfFile.name}`}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Error Message */}
        {pdfFile.error && (
          <p className="text-xs text-destructive mt-2">{pdfFile.error}</p>
        )}
      </div>
    </div>
  );
}
