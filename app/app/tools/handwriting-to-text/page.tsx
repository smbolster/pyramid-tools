'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileUploadZone } from '@/components/file-upload-zone';
import { ThemeToggle } from '@/components/theme-toggle';
import { FileProcessingCard } from '@/components/file-processing-card';
import {
  FileOCRState,
  ProcessingStatus,
  MAX_FILES,
  MAX_PDF_PAGES,
  ERROR_MESSAGES,
} from '@/types/handwriting-ocr';
import {
  extractTextFromImages,
  downloadTextFile,
  validateImageFile,
  isPdfFile,
  fileToBase64,
} from '@/lib/handwriting-ocr';
import {
  getPdfPageCount,
  convertPdfToImages,
} from '@/lib/pdf-to-images';

export default function HandwritingToText() {
  const [files, setFiles] = useState<FileOCRState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    // Validate file count
    if (selectedFiles.length > MAX_FILES) {
      alert(ERROR_MESSAGES.TOO_MANY_FILES);
      return;
    }

    // Validate each file
    const validationErrors: string[] = [];
    for (const file of selectedFiles) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      // Check PDF page count
      if (isPdfFile(file)) {
        try {
          const pageCount = await getPdfPageCount(file);
          if (pageCount > MAX_PDF_PAGES) {
            validationErrors.push(`${file.name}: ${ERROR_MESSAGES.TOO_MANY_PAGES}`);
          }
        } catch {
          validationErrors.push(`${file.name}: Failed to read PDF`);
        }
      }
    }

    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    // Initialize file states
    const initialStates: FileOCRState[] = selectedFiles.map((file) => ({
      file,
      status: ProcessingStatus.PENDING,
      progress: 0,
    }));

    setFiles(initialStates);
  }, []);

  const handleExtractText = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);

    try {
      // Update all files to processing status
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: ProcessingStatus.PROCESSING,
          progress: 25,
        }))
      );

      // Prepare images for API - convert PDFs to images, pass images through
      const allImages: Array<{
        filename: string;
        data: string;
        mimeType: string;
        originalFile: string;
      }> = [];

      for (const fileState of files) {
        const file = fileState.file;

        if (isPdfFile(file)) {
          // Convert PDF pages to images
          setFiles((prev) =>
            prev.map((f) =>
              f.file.name === file.name
                ? { ...f, progress: 40 }
                : f
            )
          );

          const pages = await convertPdfToImages(file);
          for (const page of pages) {
            allImages.push({
              filename: `${file.name}_page${page.pageNumber}`,
              data: page.imageData,
              mimeType: page.mimeType,
              originalFile: file.name,
            });
          }
        } else {
          // Regular image file
          const base64 = await fileToBase64(file);
          allImages.push({
            filename: file.name,
            data: base64,
            mimeType: file.type || 'image/jpeg',
            originalFile: file.name,
          });
        }
      }

      // Update progress
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          progress: 60,
        }))
      );

      // Call API with all images
      const response = await extractTextFromImages(
        allImages.map(({ filename, data, mimeType }) => ({
          filename,
          data,
          mimeType,
        }))
      );

      // Group results by original file (for PDFs with multiple pages)
      const resultsByFile = new Map<string, string[]>();

      for (const img of allImages) {
        const result = response.results.find((r) => r.filename === img.filename);
        const existingResults = resultsByFile.get(img.originalFile) || [];

        if (result?.text) {
          existingResults.push(result.text);
        } else if (result?.error) {
          existingResults.push(`[Error: ${result.error}]`);
        }

        resultsByFile.set(img.originalFile, existingResults);
      }

      // Update states with results
      setFiles((prev) =>
        prev.map((fileState) => {
          const texts = resultsByFile.get(fileState.file.name) || [];
          const combinedText = texts.join('\n\n--- Page Break ---\n\n');

          if (!combinedText || combinedText.includes('[Error:')) {
            return {
              ...fileState,
              status: ProcessingStatus.ERROR,
              progress: 100,
              error: texts.length === 0 ? 'No text extracted' : combinedText,
            };
          }

          return {
            ...fileState,
            status: ProcessingStatus.COMPLETED,
            progress: 100,
            extractedText: combinedText,
          };
        })
      );
    } catch (error) {
      // Handle errors
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGES.API_ERROR;

      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: ProcessingStatus.ERROR,
          progress: 100,
          error: errorMessage,
        }))
      );
    } finally {
      setIsProcessing(false);
    }
  }, [files]);

  const handleCopyText = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Success feedback handled by ExtractedTextDisplay component
      },
      (err) => {
        console.error('Failed to copy text:', err);
        alert('Failed to copy text to clipboard');
      }
    );
  }, []);

  const handleDownloadText = useCallback((text: string, filename: string) => {
    downloadTextFile(text, filename);
  }, []);

  const handleReset = useCallback(() => {
    setFiles([]);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tools
        </Link>

        <h1 className="text-4xl font-bold mb-2">Handwriting to Text</h1>
        <p className="text-muted-foreground mb-8">
          Extract text from handwritten documents using AI-powered OCR
        </p>

        {/* Main content */}
        <div className="space-y-8">
          {/* Upload zone */}
          {files.length === 0 && (
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              accept="image/*,application/pdf,.pdf"
              title="Drop handwritten documents here"
              description="or click the button below to select up to 5 files (JPEG, PNG, WebP, HEIC, PDF)"
              maxSizeLabel="Maximum 50MB per file, 10 pages per PDF"
            />
          )}

          {/* Process button */}
          {files.length > 0 && !isProcessing && (
            <div className="flex gap-4">
              <Button onClick={handleExtractText} size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Extract Text from {files.length}{' '}
                {files.length === 1 ? 'File' : 'Files'}
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                Clear All
              </Button>
            </div>
          )}

          {/* Results */}
          {files.length > 0 && (
            <div className="space-y-6">
              {files.map((fileState, index) => (
                <FileProcessingCard
                  key={index}
                  fileState={fileState}
                  onCopy={handleCopyText}
                  onDownload={handleDownloadText}
                />
              ))}
            </div>
          )}
        </div>

        {/* Informational content */}
        <div className="mt-12 p-6 border rounded-lg bg-card">
          <h2 className="text-2xl font-semibold mb-4">About This Tool</h2>

          <div className="space-y-4 text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                How It Works
              </h3>
              <p>
                This tool uses OpenAI&apos;s GPT-4o vision capabilities to
                accurately recognize and extract text from handwritten
                documents. Upload images or PDFs of your handwritten notes, and
                the AI will transcribe the text for you.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Supported Formats
              </h3>
              <ul className="list-disc list-inside">
                <li>JPEG and JPG images</li>
                <li>PNG images</li>
                <li>WebP images</li>
                <li>HEIC images (iPhone photos)</li>
                <li>PDF documents (scanned handwritten pages)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Tips for Best Results
              </h3>
              <ul className="list-disc list-inside">
                <li>Ensure good lighting and avoid shadows</li>
                <li>Take photos directly overhead, not at an angle</li>
                <li>Use high-resolution images when possible</li>
                <li>Make sure handwriting is clear and legible</li>
                <li>For PDFs, ensure pages are scanned at high quality</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Privacy & Security
              </h3>
              <p>
                Files are processed securely through the OpenAI API and are
                not stored permanently. PDFs are converted to images locally in
                your browser before processing. The AI analyzes your handwriting
                to extract text, and the results are returned directly to you.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Limitations
              </h3>
              <ul className="list-disc list-inside">
                <li>Maximum file size: 50MB per file</li>
                <li>Maximum 5 files per batch</li>
                <li>Maximum 10 pages per PDF</li>
                <li>
                  Very messy or illegible handwriting may not be accurately
                  recognized
                </li>
                <li>Non-Latin scripts may have varying accuracy</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
