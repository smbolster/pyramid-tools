"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Validation error returned by custom validation functions
 */
export interface ValidationError {
  code: string;
  message: string;
}

interface FileUploadZoneProps {
  /** Callback when valid files are selected */
  onFilesSelected: (files: File[]) => void;
  /** Whether the upload zone is disabled */
  disabled?: boolean;
  /** File types to accept (e.g., "image/png,image/jpeg" or ".heic,.heif") */
  accept?: string;
  /** Maximum total size for all files in bytes */
  maxTotalSize?: number;
  /** Whether to allow multiple file selection */
  multiple?: boolean;
  /** Custom validation function for each file (should validate file size, type, etc.) */
  validationFn?: (file: File) => ValidationError | null;
  /** Upload zone title */
  title?: string;
  /** Upload zone description */
  description?: string;
  /** Text to display for max size information */
  maxSizeLabel?: string;
}

export function FileUploadZone({
  onFilesSelected,
  disabled = false,
  accept = "*/*",
  maxTotalSize,
  multiple = true,
  validationFn,
  title = "Drop files here",
  description = "or click the button below to select files from your device.",
  maxSizeLabel,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError(null);

      const fileArray = Array.from(files);

      // Validate total size if maxTotalSize is provided
      if (maxTotalSize) {
        const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > maxTotalSize) {
          setError(
            `Total file size (${(totalSize / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit (${(maxTotalSize / 1024 / 1024).toFixed(0)}MB)`
          );
          return;
        }
      }

      // Validate individual files
      const validFiles: File[] = [];
      const errors: string[] = [];

      fileArray.forEach((file) => {
        // Use custom validation function if provided
        if (validationFn) {
          const validationError = validationFn(file);
          if (validationError) {
            errors.push(`${file.name}: ${validationError.message}`);
          } else {
            validFiles.push(file);
          }
        } else {
          // No validation function provided, accept all files
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        setError(errors.join("; "));
      }

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [onFilesSelected, maxTotalSize, validationFn]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input value so the same file can be selected again
      e.target.value = "";
    },
    [handleFiles]
  );

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-105"
            : "border-border bg-card hover:border-primary/50 hover:bg-accent/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload className="size-8" aria-hidden="true" />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {description}
          </p>
        </div>

        <Button disabled={disabled} asChild>
          <label className="cursor-pointer">
            <input
              type="file"
              multiple={multiple}
              accept={accept}
              onChange={handleFileInputChange}
              disabled={disabled}
              className="sr-only"
              aria-label="Select files to upload"
            />
            Select Files
          </label>
        </Button>

        {maxSizeLabel && (
          <p className="text-xs text-muted-foreground">
            {maxSizeLabel}
          </p>
        )}
      </div>

      {error && (
        <div
          className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
