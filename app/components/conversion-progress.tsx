"use client";

import Image from "next/image";
import { CheckCircle2, XCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { FileConversionState, ConversionStatus } from "@/types/heic-converter";
import { cn } from "@/lib/utils";

interface ConversionProgressProps {
  files: FileConversionState[];
}

export function ConversionProgress({ files }: ConversionProgressProps) {
  if (files.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Converting Files
        </h3>
        <p className="text-sm text-muted-foreground">
          {files.filter((f) => f.status === ConversionStatus.SUCCESS).length} /{" "}
          {files.length} complete
        </p>
      </div>

      <div className="space-y-3">
        {files.map((fileState, index) => (
          <FileProgressItem key={index} fileState={fileState} />
        ))}
      </div>
    </div>
  );
}

function FileProgressItem({ fileState }: { fileState: FileConversionState }) {
  const { file, status, progress, error, preview } = fileState;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all duration-200",
        status === ConversionStatus.SUCCESS && "border-primary/50 bg-primary/5",
        status === ConversionStatus.ERROR && "border-destructive/50 bg-destructive/5"
      )}
    >
      {/* Preview or Icon */}
      <div className="flex-shrink-0">
        {preview ? (
          <Image
            src={preview}
            alt={`Preview of ${file.name}`}
            width={64}
            height={64}
            className="size-16 rounded object-cover"
            unoptimized
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded bg-muted">
            <ImageIcon className="size-8 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {file.name}
          </p>
          <StatusIcon status={status} />
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          {formatFileSize(file.size)}
        </p>

        {/* Progress Bar */}
        {status === ConversionStatus.CONVERTING && (
          <div className="mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {progress}% complete
            </p>
          </div>
        )}

        {/* Error Message */}
        {status === ConversionStatus.ERROR && error && (
          <p className="text-xs text-destructive mt-2">{error}</p>
        )}

        {/* Success Message */}
        {status === ConversionStatus.SUCCESS && (
          <p className="text-xs text-primary mt-2">Converted successfully</p>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: ConversionStatus }) {
  switch (status) {
    case ConversionStatus.SUCCESS:
      return (
        <CheckCircle2
          className="size-5 text-primary flex-shrink-0"
          aria-label="Conversion successful"
        />
      );
    case ConversionStatus.ERROR:
      return (
        <XCircle
          className="size-5 text-destructive flex-shrink-0"
          aria-label="Conversion failed"
        />
      );
    case ConversionStatus.CONVERTING:
      return (
        <Loader2
          className="size-5 text-primary animate-spin flex-shrink-0"
          aria-label="Converting"
        />
      );
    default:
      return null;
  }
}
