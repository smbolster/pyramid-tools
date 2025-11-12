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
  MAX_TOTAL_SIZE,
} from "@/types/heic-converter";
import {
  uploadAndConvertHeic,
  base64ToBlob,
  createPreviewUrl,
  generateJpegFilename,
  validateHeicFile,
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

    try {
      // Update status to uploading/converting
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: ConversionStatus.CONVERTING,
          progress: 50,
        }))
      );

      // Upload and convert on server
      const convertedFiles = await uploadAndConvertHeic(selectedFiles);

      // Process results and update state
      const updatedStates: FileConversionState[] = initialStates.map(
        (fileState) => {
          const converted = convertedFiles.find(
            (cf) => cf.originalName === fileState.file.name
          );

          if (converted) {
            // Convert base64 to blob
            const convertedBlob = base64ToBlob(converted.data);
            const preview = createPreviewUrl(convertedBlob);

            return {
              ...fileState,
              status: ConversionStatus.SUCCESS,
              progress: 100,
              convertedBlob,
              preview,
            };
          } else {
            // File failed to convert
            return {
              ...fileState,
              status: ConversionStatus.ERROR,
              progress: 0,
              error: "Failed to convert file",
            };
          }
        }
      );

      setFiles(updatedStates);
    } catch (error) {
      // Update all files to error state
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: ConversionStatus.ERROR,
          progress: 0,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred",
        }))
      );
    } finally {
      setIsConverting(false);
    }
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
              Convert your HEIC photos to JPEG format quickly and efficiently
              with server-side processing.
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        {files.length === 0 && (
          <FileUploadZone
            onFilesSelected={handleFilesSelected}
            disabled={isConverting}
            accept=".heic,.heif,image/heic,image/heif"
            maxTotalSize={MAX_TOTAL_SIZE}
            multiple={true}
            validationFn={validateHeicFile}
            title="Drop HEIC files here"
            description="or click the button below to select files from your device. You can upload multiple files at once."
            maxSizeLabel="Maximum file size: 50MB per file, 500MB total"
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
              <strong className="text-foreground">Server-Side Processing:</strong>{" "}
              Files are uploaded to our server for conversion and deleted immediately
              after processing. Your photos are never stored permanently.
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
