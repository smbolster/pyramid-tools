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
  ERROR_MESSAGES,
} from '@/types/handwriting-ocr';
import {
  uploadAndExtractText,
  downloadTextFile,
  validateImageFile,
} from '@/lib/handwriting-ocr';

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
    selectedFiles.forEach((file) => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    });

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
          progress: 50,
        }))
      );

      // Call API
      const response = await uploadAndExtractText(files.map((f) => f.file));

      // Update states with results
      setFiles((prev) =>
        prev.map((fileState) => {
          const result = response.results.find(
            (r) => r.filename === fileState.file.name
          );

          if (result?.error) {
            return {
              ...fileState,
              status: ProcessingStatus.ERROR,
              progress: 100,
              error: result.error,
            };
          }

          return {
            ...fileState,
            status: ProcessingStatus.COMPLETED,
            progress: 100,
            extractedText: result?.text || '',
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
              accept="image/*"
              title="Drop handwritten document images here"
              description="or click the button below to select up to 5 images (JPEG, PNG, WebP, HEIC)"
              maxSizeLabel="Maximum 10MB per image"
            />
          )}

          {/* Process button */}
          {files.length > 0 && !isProcessing && (
            <div className="flex gap-4">
              <Button onClick={handleExtractText} size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Extract Text from {files.length}{' '}
                {files.length === 1 ? 'Image' : 'Images'}
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
                This tool uses Claude AI&apos;s advanced vision capabilities to
                accurately recognize and extract text from handwritten
                documents. Upload an image of your handwritten notes, and the
                AI will transcribe the text for you.
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
                <li>Process one page at a time for better accuracy</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Privacy & Security
              </h3>
              <p>
                Images are processed securely through the Anthropic API and are
                not stored permanently. The AI analyzes your handwriting to
                extract text, and the results are returned directly to you.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Limitations
              </h3>
              <ul className="list-disc list-inside">
                <li>Maximum file size: 10MB per image</li>
                <li>Maximum 5 images per batch</li>
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
