"use client";

import { useState } from "react";
import { PdfFileState } from "@/types/pdf-merger";
import { PdfFileItem } from "@/components/pdf-file-item";
import { formatFileSize } from "@/lib/pdf-merger";

interface PdfFileListProps {
  files: PdfFileState[];
  onReorder: (newFiles: PdfFileState[]) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function PdfFileList({
  files,
  onReorder,
  onRemove,
  disabled = false,
}: PdfFileListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Create a copy of the files array
    const newFiles = [...files];

    // Remove the dragged item
    const [draggedItem] = newFiles.splice(draggedIndex, 1);

    // Insert it at the new position
    newFiles.splice(dropIndex, 0, draggedItem);

    // Update the parent component
    onReorder(newFiles);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalPages = files.reduce(
    (sum, file) => sum + (file.pageCount || 0),
    0
  );

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {/* File Count and Size Info */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          PDF Files ({files.length})
        </h3>
        <div className="text-sm text-muted-foreground">
          <span>Total: {formatFileSize(totalSize)}</span>
          {totalPages > 0 && (
            <>
              <span className="mx-2">•</span>
              <span>
                {totalPages} {totalPages === 1 ? "page" : "pages"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* File List */}
      <div
        className="space-y-3"
        role="list"
        aria-label="PDF files to merge"
      >
        {files.map((file, index) => (
          <div
            key={file.id}
            className={
              dragOverIndex === index && draggedIndex !== index
                ? "border-t-2 border-primary pt-3"
                : ""
            }
          >
            <PdfFileItem
              pdfFile={file}
              index={index}
              onRemove={onRemove}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              isDragging={draggedIndex === index}
              disabled={disabled}
            />
          </div>
        ))}
      </div>

      {/* ARIA Live Region for Announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {files.length} PDF{files.length !== 1 ? "s" : ""} ready to merge
      </div>
    </div>
  );
}
