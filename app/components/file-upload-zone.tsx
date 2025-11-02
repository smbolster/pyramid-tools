"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { validateHeicFile } from "@/lib/heic-converter";
import { MAX_TOTAL_SIZE } from "@/types/heic-converter";

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function FileUploadZone({
  onFilesSelected,
  disabled = false,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError(null);

      const fileArray = Array.from(files);

      // Validate total size
      const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > MAX_TOTAL_SIZE) {
        setError(
          `Total file size (${(totalSize / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit (${MAX_TOTAL_SIZE / 1024 / 1024}MB)`
        );
        return;
      }

      // Validate individual files
      const validFiles: File[] = [];
      const errors: string[] = [];

      fileArray.forEach((file) => {
        const validationError = validateHeicFile(file);
        if (validationError) {
          errors.push(`${file.name}: ${validationError.message}`);
        } else {
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
    [onFilesSelected]
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
            Drop HEIC files here
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            or click the button below to select files from your device. You can
            upload multiple files at once.
          </p>
        </div>

        <Button disabled={disabled} asChild>
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept=".heic,.heif,image/heic,image/heif"
              onChange={handleFileInputChange}
              disabled={disabled}
              className="sr-only"
              aria-label="Select HEIC files to convert"
            />
            Select Files
          </label>
        </Button>

        <p className="text-xs text-muted-foreground">
          Maximum file size: 50MB per file, 500MB total
        </p>
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
