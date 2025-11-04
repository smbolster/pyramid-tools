"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/file-upload-zone";
import { ConversionProgress } from "@/components/conversion-progress";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  FileConversionState,
  ConversionStatus,
} from "@/types/heic-converter";
import {
  convertHeicToJpeg,
  createPreviewUrl,
  generateJpegFilename,
} from "@/lib/heic-converter";
import { createZipFromFiles, downloadBlob } from "@/lib/zip-utils";

export default function HeicToJpegConverter() {
  const [files, setFiles] = useState<FileConversionState[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    // Initialize file states
    const initialStates: FileConversionState[] = selectedFiles.map((file) => ({
      file,
      status: ConversionStatus.PENDING,
      progress: 0,
    }));

    setFiles(initialStates);
    setIsConverting(true);

    // Convert files with concurrency limit
    const concurrencyLimit = 3;
    const results: FileConversionState[] = [];

    for (let i = 0; i < initialStates.length; i += concurrencyLimit) {
      const batch = initialStates.slice(i, i + concurrencyLimit);

      const batchResults = await Promise.all(
        batch.map(async (fileState) => {
          try {
            // Update status to converting
            setFiles((prev) =>
              prev.map((f) =>
                f.file === fileState.file
                  ? { ...f, status: ConversionStatus.CONVERTING, progress: 0 }
                  : f
              )
            );

            // Simulate progress updates
            const progressInterval = setInterval(() => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.file === fileState.file && f.progress < 90
                    ? { ...f, progress: f.progress + 10 }
                    : f
                )
              );
            }, 200);

            // Perform conversion
            const convertedBlob = await convertHeicToJpeg(fileState.file);

            clearInterval(progressInterval);

            // Create preview
            const preview = createPreviewUrl(convertedBlob);

            // Update to success
            const successState: FileConversionState = {
              ...fileState,
              status: ConversionStatus.SUCCESS,
              progress: 100,
              convertedBlob,
              preview,
            };

            setFiles((prev) =>
              prev.map((f) =>
                f.file === fileState.file ? successState : f
              )
            );

            return successState;
          } catch (error) {
            // Update to error
            const errorState: FileConversionState = {
              ...fileState,
              status: ConversionStatus.ERROR,
              progress: 0,
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            };

            setFiles((prev) =>
              prev.map((f) =>
                f.file === fileState.file ? errorState : f
              )
            );

            return errorState;
          }
        })
      );

      results.push(...batchResults);
    }

    setIsConverting(false);
  }, []);

  const handleDownload = useCallback(async () => {
    const successfulConversions = files.filter(
      (f) => f.status === ConversionStatus.SUCCESS && f.convertedBlob
    );

    if (successfulConversions.length === 0) return;

    if (successfulConversions.length === 1) {
      // Single file - direct download
      const fileState = successfulConversions[0];
      const filename = generateJpegFilename(fileState.file.name);
      downloadBlob(fileState.convertedBlob!, filename);
    } else {
      // Multiple files - create ZIP
      const filesToZip = successfulConversions.map((fileState) => ({
        name: generateJpegFilename(fileState.file.name),
        blob: fileState.convertedBlob!,
      }));

      const zipBlob = await createZipFromFiles(filesToZip);
      downloadBlob(zipBlob, "converted-images.zip");
    }
  }, [files]);

  const handleReset = useCallback(() => {
    // Revoke all preview URLs to free memory
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });

    setFiles([]);
    setIsConverting(false);
  }, [files]);

  const successfulCount = files.filter(
    (f) => f.status === ConversionStatus.SUCCESS
  ).length;
  const hasSuccessfulConversions = successfulCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Theme toggle in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="size-4" />
            Back to Tools
          </Link>

          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              HEIC to JPEG Converter
            </h1>
            <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent"></div>
            <p className="mt-6 text-lg text-muted-foreground">
              Convert your HEIC photos to JPEG format. All processing happens
              in your browser - your photos never leave your device.
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        {files.length === 0 && (
          <FileUploadZone
            onFilesSelected={handleFilesSelected}
            disabled={isConverting}
          />
        )}

        {/* Conversion Progress */}
        {files.length > 0 && (
          <div className="space-y-6">
            <ConversionProgress files={files} />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasSuccessfulConversions && !isConverting && (
                <Button
                  size="lg"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="size-4" />
                  Download {successfulCount === 1 ? "JPEG" : "ZIP Archive"} (
                  {successfulCount} {successfulCount === 1 ? "file" : "files"})
                </Button>
              )}

              {!isConverting && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleReset}
                >
                  Convert More Files
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            About HEIC to JPEG Conversion
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Privacy First:</strong> All
              conversions happen in your browser using WebAssembly. Your photos
              are never uploaded to any server.
            </p>
            <p>
              <strong className="text-foreground">HEIC Format:</strong> HEIC
              (High Efficiency Image Container) is Apple&apos;s image format that
              offers better compression than JPEG while maintaining quality.
            </p>
            <p>
              <strong className="text-foreground">Compatibility:</strong>{" "}
              Converting to JPEG ensures your photos work on all devices and
              platforms.
            </p>
            <p>
              <strong className="text-foreground">File Limits:</strong> Maximum
              50MB per file, 500MB total. Works with single or multiple files.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
