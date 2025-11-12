"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "@/components/file-upload-zone";
import { ThemeToggle } from "@/components/theme-toggle";
import { ResizeOptionsPanel } from "@/components/resize-options-panel";
import {
  FileResizeState,
  ResizeStatus,
  ResizeOptions,
  ResizeMode,
  MAX_TOTAL_SIZE,
} from "@/types/image-resizer";
import {
  uploadAndResizeImages,
  base64ToBlob,
  validateImageFile,
  createPreviewUrl,
  generateResizedFilename,
  detectImageDimensions,
} from "@/lib/image-resizer";
import { createZipFromFiles, downloadBlob } from "@/lib/zip-utils";

export default function ImageResizer() {
  const [files, setFiles] = useState<FileResizeState[]>([]);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeOptions, setResizeOptions] = useState<ResizeOptions>({
    mode: ResizeMode.FIT,
    quality: 90,
    maintainAspectRatio: true,
  });
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleFilesSelected = useCallback(
    async (selectedFiles: File[]) => {
      // Initialize file states with dimension detection
      const initialStates: FileResizeState[] = await Promise.all(
        selectedFiles.map(async (file) => {
          try {
            const dimensions = await detectImageDimensions(file);
            return {
              file,
              status: ResizeStatus.PENDING,
              progress: 0,
              originalSize: file.size,
              originalDimensions: dimensions,
            };
          } catch {
            return {
              file,
              status: ResizeStatus.PENDING,
              progress: 0,
              originalSize: file.size,
            };
          }
        })
      );

      setFiles(initialStates);
    },
    []
  );

  const handleResize = useCallback(async () => {
    if (files.length === 0) return;

    setIsResizing(true);

    try {
      // Update status to resizing
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: ResizeStatus.RESIZING,
          progress: 50,
        }))
      );

      // Upload and resize on server
      const resizedImages = await uploadAndResizeImages(
        files.map((f) => f.file),
        resizeOptions
      );

      // Process results and update state
      const updatedStates: FileResizeState[] = files.map((fileState) => {
        const resized = resizedImages.find(
          (img) => img.originalName === fileState.file.name
        );

        if (resized) {
          // Convert base64 to blob
          const mimeType = `image/${resized.format}`;
          const resizedBlob = base64ToBlob(resized.data, mimeType);
          const preview = createPreviewUrl(resizedBlob);

          return {
            ...fileState,
            status: ResizeStatus.SUCCESS,
            progress: 100,
            resizedBlob,
            preview,
            resizedDimensions: { width: resized.width, height: resized.height },
            resizedSize: resized.size,
          };
        } else {
          // File failed to resize
          return {
            ...fileState,
            status: ResizeStatus.ERROR,
            progress: 0,
            error: "Failed to resize image",
          };
        }
      });

      setFiles(updatedStates);
    } catch (error) {
      // Update all files to error state
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: ResizeStatus.ERROR,
          progress: 0,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        }))
      );
    } finally {
      setIsResizing(false);
    }
  }, [files, resizeOptions]);

  const handleDownload = useCallback(async () => {
    const successfulResizes = files.filter(
      (f) => f.status === ResizeStatus.SUCCESS && f.resizedBlob
    );

    if (successfulResizes.length === 0) return;

    if (successfulResizes.length === 1) {
      // Single file - direct download
      const fileState = successfulResizes[0];
      const filename = generateResizedFilename(
        fileState.file.name,
        fileState.resizedDimensions?.width,
        fileState.resizedDimensions?.height,
        resizeOptions.format
      );
      downloadBlob(fileState.resizedBlob!, filename);
    } else {
      // Multiple files - create ZIP
      const filesToZip = successfulResizes.map((fileState) => ({
        name: generateResizedFilename(
          fileState.file.name,
          fileState.resizedDimensions?.width,
          fileState.resizedDimensions?.height,
          resizeOptions.format
        ),
        blob: fileState.resizedBlob!,
      }));

      const zipBlob = await createZipFromFiles(filesToZip);
      downloadBlob(zipBlob, "resized-images.zip");
    }
  }, [files, resizeOptions.format]);

  const handleReset = useCallback(() => {
    // Revoke all preview URLs to free memory
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });

    setFiles([]);
    setIsResizing(false);
  }, [files]);

  const successfulCount = files.filter(
    (f) => f.status === ResizeStatus.SUCCESS
  ).length;
  const hasSuccessfulResizes = successfulCount > 0;
  const canResize =
    files.length > 0 &&
    !isResizing &&
    files.every((f) => f.status === ResizeStatus.PENDING);

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
              Image Resizer
            </h1>
            <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent"></div>
            <p className="mt-6 text-lg text-muted-foreground">
              Resize images to custom dimensions or predefined presets with
              high-quality server-side processing
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        {files.length === 0 && (
          <FileUploadZone
            onFilesSelected={handleFilesSelected}
            disabled={isResizing}
            accept="image/*"
            maxTotalSize={MAX_TOTAL_SIZE}
            multiple={true}
            validationFn={validateImageFile}
            title="Drop images here"
            description="or click the button below to select images from your device. You can upload multiple images at once."
            maxSizeLabel="Maximum file size: 10MB per file, 100MB total"
          />
        )}

        {/* Resize Options and Preview */}
        {files.length > 0 && (
          <div className="space-y-6">
            {/* Resize Options (only show before resizing) */}
            {canResize && (
              <ResizeOptionsPanel
                options={resizeOptions}
                selectedPreset={selectedPreset}
                onOptionsChange={setResizeOptions}
                onPresetSelected={setSelectedPreset}
                disabled={isResizing}
              />
            )}

            {/* Files Preview */}
            <div className="space-y-4">
              {files.map((fileState, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Preview thumbnail */}
                    {fileState.preview && (
                      <div className="flex-shrink-0">
                        <img
                          src={fileState.preview}
                          alt={fileState.file.name}
                          className="h-20 w-20 rounded object-cover"
                        />
                      </div>
                    )}

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {fileState.file.name}
                      </h4>

                      {/* Status */}
                      <div className="mt-1 text-sm text-muted-foreground">
                        {fileState.status === ResizeStatus.PENDING && "Ready"}
                        {fileState.status === ResizeStatus.RESIZING &&
                          "Resizing..."}
                        {fileState.status === ResizeStatus.SUCCESS && (
                          <span className="text-green-600">✓ Resized</span>
                        )}
                        {fileState.status === ResizeStatus.ERROR && (
                          <span className="text-red-600">
                            ✗ {fileState.error}
                          </span>
                        )}
                      </div>

                      {/* Dimensions */}
                      {fileState.originalDimensions && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Original: {fileState.originalDimensions.width}×
                          {fileState.originalDimensions.height}
                          {fileState.resizedDimensions && (
                            <> → {fileState.resizedDimensions.width}×
                              {fileState.resizedDimensions.height}
                            </>
                          )}
                        </div>
                      )}

                      {/* File sizes */}
                      <div className="mt-1 text-xs text-muted-foreground">
                        Original:{" "}
                        {(fileState.originalSize / 1024 / 1024).toFixed(2)}MB
                        {fileState.resizedSize && (
                          <>
                            {" "}
                            → {(fileState.resizedSize / 1024 / 1024).toFixed(2)}
                            MB (
                            {(
                              ((fileState.originalSize - fileState.resizedSize) /
                                fileState.originalSize) *
                              100
                            ).toFixed(0)}
                            % smaller)
                          </>
                        )}
                      </div>

                      {/* Progress bar */}
                      {fileState.status === ResizeStatus.RESIZING && (
                        <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${fileState.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {canResize && (
                <Button size="lg" onClick={handleResize} className="gap-2">
                  Resize {files.length === 1 ? "Image" : `${files.length} Images`}
                </Button>
              )}

              {hasSuccessfulResizes && !isResizing && (
                <Button size="lg" onClick={handleDownload} className="gap-2">
                  <Download className="size-4" />
                  Download{" "}
                  {successfulCount === 1
                    ? "Image"
                    : `ZIP Archive (${successfulCount} files)`}
                </Button>
              )}

              {!isResizing && (
                <Button variant="outline" size="lg" onClick={handleReset}>
                  Resize More Images
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            About Image Resizing
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Server-Side Processing:</strong>{" "}
              Uses Sharp, the fastest Node.js image processing library, for
              high-quality results. Files are processed in memory and deleted
              immediately after.
            </p>
            <p>
              <strong className="text-foreground">Resize Modes:</strong> Choose
              from Fit (preserve aspect ratio), Fill (crop to exact size), Cover,
              Contain (with padding), Inside, or Outside to control how images
              are resized.
            </p>
            <p>
              <strong className="text-foreground">Supported Formats:</strong>{" "}
              JPEG, PNG, WebP, GIF, AVIF, and TIFF. Convert between formats and
              adjust quality for lossy formats.
            </p>
            <p>
              <strong className="text-foreground">File Limits:</strong> Maximum
              10MB per file, 100MB total, up to 20 images at once.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
