"use client";

import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Download, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PdfFileList } from "@/components/pdf-file-list";
import {
  PdfFileState,
  MergeStatus,
  MAX_TOTAL_SIZE,
  ERROR_MESSAGES,
} from "@/types/pdf-merger";
import {
  validatePdfFile,
  generatePdfPreview,
  getPdfPageCount,
} from "@/lib/pdf-preview";
import { mergePdfs, generateMergedFilename, formatFileSize } from "@/lib/pdf-merger";
import { downloadBlob } from "@/lib/zip-utils";

export default function PdfMergerPage() {
  const [pdfFiles, setPdfFiles] = useState<PdfFileState[]>([]);
  const [mergeStatus, setMergeStatus] = useState<MergeStatus>(MergeStatus.IDLE);
  const [mergedPdf, setMergedPdf] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      pdfFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [pdfFiles]);

  const handleFilesSelected = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError(null);
      const fileArray = Array.from(files);

      // Validate total size
      const currentTotalSize = pdfFiles.reduce((sum, f) => sum + f.size, 0);
      const newTotalSize =
        currentTotalSize + fileArray.reduce((sum, f) => sum + f.size, 0);

      if (newTotalSize > MAX_TOTAL_SIZE) {
        setError(ERROR_MESSAGES.TOTAL_SIZE_TOO_LARGE);
        return;
      }

      // Validate and process each file
      const newPdfFiles: PdfFileState[] = [];

      for (const file of fileArray) {
        const validationError = validatePdfFile(file);

        const pdfFileState: PdfFileState = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          name: file.name,
          size: file.size,
          pageCount: null,
          preview: null,
          error: validationError ? validationError.message : null,
        };

        newPdfFiles.push(pdfFileState);
      }

      // Add files to state
      setPdfFiles((prev) => [...prev, ...newPdfFiles]);

      // Generate previews and page counts asynchronously
      newPdfFiles.forEach(async (pdfFileState, index) => {
        if (pdfFileState.error) return;

        // Generate preview
        const preview = await generatePdfPreview(pdfFileState.file);

        // Get page count
        const pageCount = await getPdfPageCount(pdfFileState.file);

        // Update the state with preview and page count
        setPdfFiles((prev) =>
          prev.map((f) =>
            f.id === pdfFileState.id
              ? { ...f, preview, pageCount }
              : f
          )
        );
      });
    },
    [pdfFiles]
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

      if (mergeStatus === MergeStatus.MERGING) return;

      handleFilesSelected(e.dataTransfer.files);
    },
    [mergeStatus, handleFilesSelected]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFilesSelected(e.target.files);
      // Reset input value so the same file can be selected again
      e.target.value = "";
    },
    [handleFilesSelected]
  );

  const handleReorder = useCallback((newFiles: PdfFileState[]) => {
    setPdfFiles(newFiles);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setPdfFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleMerge = useCallback(async () => {
    if (pdfFiles.length === 0) {
      setError(ERROR_MESSAGES.NO_FILES);
      return;
    }

    // Filter out files with errors
    const validFiles = pdfFiles.filter((f) => !f.error);

    if (validFiles.length === 0) {
      setError("No valid PDF files to merge");
      return;
    }

    setMergeStatus(MergeStatus.MERGING);
    setError(null);

    try {
      const files = validFiles.map((f) => f.file);
      const merged = await mergePdfs(files);
      setMergedPdf(merged);
      setMergeStatus(MergeStatus.SUCCESS);
    } catch (err) {
      console.error("Merge error:", err);
      setError(
        err instanceof Error ? err.message : ERROR_MESSAGES.MERGE_FAILED
      );
      setMergeStatus(MergeStatus.ERROR);
    }
  }, [pdfFiles]);

  const handleDownload = useCallback(() => {
    if (!mergedPdf) return;

    const filename = generateMergedFilename();
    downloadBlob(mergedPdf, filename);
  }, [mergedPdf]);

  const handleReset = useCallback(() => {
    // Revoke all preview URLs
    pdfFiles.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });

    setPdfFiles([]);
    setMergeStatus(MergeStatus.IDLE);
    setMergedPdf(null);
    setError(null);
  }, [pdfFiles]);

  const validFileCount = pdfFiles.filter((f) => !f.error).length;
  const isProcessing = mergeStatus === MergeStatus.MERGING;
  const canMerge = validFileCount > 0 && !isProcessing;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
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
              PDF Merger
            </h1>
            <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent"></div>
            <p className="mt-6 text-lg text-muted-foreground">
              Combine multiple PDF files into one document. All processing happens
              in your browser - your files never leave your device.
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        {pdfFiles.length === 0 && mergeStatus === MergeStatus.IDLE && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 transition-all duration-200 ${
              isDragging
                ? "border-primary bg-primary/5 scale-105"
                : "border-border bg-card hover:border-primary/50 hover:bg-accent/20"
            }`}
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText className="size-8" aria-hidden="true" />
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <h3 className="text-lg font-semibold text-foreground">
                Drop PDF files here
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                or click the button below to select files from your device. You
                can upload multiple files at once.
              </p>
            </div>

            <Button asChild>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept=".pdf,application/pdf"
                  onChange={handleFileInputChange}
                  className="sr-only"
                  aria-label="Select PDF files to merge"
                />
                Select PDF Files
              </label>
            </Button>

            <p className="text-xs text-muted-foreground">
              Maximum file size: 100MB per file, 500MB total
            </p>
          </div>
        )}

        {/* File List */}
        {pdfFiles.length > 0 && (
          <div className="space-y-6">
            <PdfFileList
              files={pdfFiles}
              onReorder={handleReorder}
              onRemove={handleRemove}
              disabled={isProcessing}
            />

            {/* Add More Files */}
            {mergeStatus === MergeStatus.IDLE && (
              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,application/pdf"
                      onChange={handleFileInputChange}
                      className="sr-only"
                      aria-label="Add more PDF files"
                    />
                    Add More Files
                  </label>
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {mergeStatus === MergeStatus.IDLE && (
                <>
                  <Button
                    size="lg"
                    onClick={handleMerge}
                    disabled={!canMerge}
                    className="gap-2"
                  >
                    <FileText className="size-4" />
                    Merge {validFileCount} PDF{validFileCount !== 1 ? "s" : ""}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleReset}
                  >
                    Clear All
                  </Button>
                </>
              )}

              {mergeStatus === MergeStatus.MERGING && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                  <span>Merging PDFs...</span>
                </div>
              )}

              {mergeStatus === MergeStatus.SUCCESS && mergedPdf && (
                <>
                  <Button
                    size="lg"
                    onClick={handleDownload}
                    className="gap-2"
                  >
                    <Download className="size-4" />
                    Download Merged PDF
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleReset}
                  >
                    Merge More Files
                  </Button>
                </>
              )}

              {mergeStatus === MergeStatus.ERROR && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setMergeStatus(MergeStatus.IDLE)}
                >
                  Try Again
                </Button>
              )}
            </div>

            {/* Success Message */}
            {mergeStatus === MergeStatus.SUCCESS && mergedPdf && (
              <div className="rounded-lg border border-primary/50 bg-primary/5 p-4 text-center">
                <p className="text-sm text-foreground">
                  Successfully merged {validFileCount} PDF
                  {validFileCount !== 1 ? "s" : ""} into one document (
                  {formatFileSize(mergedPdf.size)})
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            About PDF Merger
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Privacy First:</strong> All
              merging happens in your browser. Your PDFs are never uploaded to
              any server.
            </p>
            <p>
              <strong className="text-foreground">How It Works:</strong> Upload
              your PDF files, arrange them in your preferred order by dragging
              and dropping, then merge them into a single document.
            </p>
            <p>
              <strong className="text-foreground">File Limits:</strong> Maximum
              100MB per file, 500MB total. Works with multiple files.
            </p>
            <p>
              <strong className="text-foreground">Browser Compatibility:</strong>{" "}
              Works in all modern browsers with JavaScript enabled.
            </p>
            <p>
              <strong className="text-foreground">Tips:</strong> Drag and drop
              files to reorder them before merging. Remove unwanted files with
              the X button.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
