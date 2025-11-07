'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Download, RefreshCw, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUploadZone } from '@/components/file-upload-zone';
import { ThemeToggle } from '@/components/theme-toggle';
import { SVGPreview } from '@/components/svg-preview';
import { SVGConfigPanel } from '@/components/svg-config-panel';
import {
  FileState,
  ConversionStatus,
  SVGConversionOptions,
  DEFAULT_OPTIONS,
  SUPPORTED_IMAGE_FORMATS,
} from '@/types/image-to-svg';
import { convertImageToSVG, validateImageFile } from '@/lib/image-to-svg';
import { downloadBlob } from '@/lib/zip-utils';

export default function ImageToSVGConverter() {
  const [fileState, setFileState] = useState<FileState>({
    file: null,
    imageDataUrl: null,
    status: ConversionStatus.IDLE,
    result: null,
    error: null,
    progress: 0,
  });
  const [conversionOptions, setConversionOptions] =
    useState<SVGConversionOptions>(DEFAULT_OPTIONS);
  const [isAutoConvert, setIsAutoConvert] = useState(true);
  const convertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle conversion
  const handleConvert = useCallback(
    async (file?: File, imageUrl?: string) => {
      const targetFile = file || fileState.file;
      const targetImageUrl = imageUrl || fileState.imageDataUrl;

      if (!targetFile || !targetImageUrl) return;

      const startTime = Date.now();
      let showedProcessing = false;

      // Delay showing processing state to avoid flash for fast conversions
      const processingTimeout = setTimeout(() => {
        showedProcessing = true;
        setFileState((prev) => ({
          ...prev,
          status: ConversionStatus.PROCESSING,
          progress: 0,
          error: null,
        }));
      }, 150);

      try {
        const result = await convertImageToSVG(
          targetFile,
          conversionOptions,
          (progress) => {
            if (showedProcessing) {
              setFileState((prev) => ({
                ...prev,
                progress,
              }));
            }
          }
        );

        clearTimeout(processingTimeout);

        // If we showed processing state, ensure it's visible for at least 300ms
        const elapsedTime = Date.now() - startTime;
        const minDisplayTime = 300;
        const remainingTime = showedProcessing ? Math.max(0, minDisplayTime - elapsedTime) : 0;

        setTimeout(() => {
          setFileState((prev) => ({
            ...prev,
            status: ConversionStatus.COMPLETED,
            result,
            progress: 100,
          }));
        }, remainingTime);
      } catch (error) {
        clearTimeout(processingTimeout);
        setFileState((prev) => ({
          ...prev,
          status: ConversionStatus.ERROR,
          error:
            error instanceof Error
              ? error.message
              : 'Conversion failed. Please try again.',
          progress: 0,
        }));
      }
    },
    [fileState.file, fileState.imageDataUrl, conversionOptions]
  );

  // Handle file upload
  const handleFileUpload = useCallback(async (selectedFiles: File[]) => {
    const file = selectedFiles[0];
    if (!file) return;

    // Validate file
    const validationError = validateImageFile(file);
    if (validationError) {
      setFileState({
        file: null,
        imageDataUrl: null,
        status: ConversionStatus.ERROR,
        result: null,
        error: validationError.message,
        progress: 0,
      });
      return;
    }

    // Create preview URL
    const imageDataUrl = URL.createObjectURL(file);

    setFileState({
      file,
      imageDataUrl,
      status: ConversionStatus.UPLOADING,
      result: null,
      error: null,
      progress: 0,
    });

    // Auto-convert if enabled (trigger after state update)
    if (isAutoConvert) {
      setTimeout(() => handleConvert(file, imageDataUrl), 100);
    }
  }, [isAutoConvert, handleConvert]);

  // Auto-convert when options change (debounced)
  useEffect(() => {
    if (
      !isAutoConvert ||
      !fileState.file ||
      fileState.status === ConversionStatus.IDLE
    ) {
      return;
    }

    // Clear previous timeout
    if (convertTimeoutRef.current) {
      clearTimeout(convertTimeoutRef.current);
    }

    // Set new timeout
    convertTimeoutRef.current = setTimeout(() => {
      handleConvert();
    }, 500);

    return () => {
      if (convertTimeoutRef.current) {
        clearTimeout(convertTimeoutRef.current);
      }
    };
  }, [conversionOptions, isAutoConvert, fileState.file, fileState.status, handleConvert]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (fileState.imageDataUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(fileState.imageDataUrl);
      }
      if (fileState.result?.svgDataUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(fileState.result.svgDataUrl);
      }
    };
  }, [fileState.imageDataUrl, fileState.result?.svgDataUrl]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (!fileState.result || !fileState.file) return;

    const originalName = fileState.file.name;
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const filename = `${nameWithoutExt}.svg`;

    downloadBlob(fileState.result.svgBlob, filename);
  }, [fileState.result, fileState.file]);

  // Handle reset
  const handleReset = useCallback(() => {
    // Revoke object URLs
    if (fileState.imageDataUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(fileState.imageDataUrl);
    }
    if (fileState.result?.svgDataUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(fileState.result.svgDataUrl);
    }

    setFileState({
      file: null,
      imageDataUrl: null,
      status: ConversionStatus.IDLE,
      result: null,
      error: null,
      progress: 0,
    });
  }, [fileState.imageDataUrl, fileState.result?.svgDataUrl]);

  const isProcessing = fileState.status === ConversionStatus.PROCESSING;
  const hasFile = fileState.file !== null;
  const hasResult = fileState.result !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Theme Toggle */}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>
          <h1 className="mt-6 text-4xl font-bold">Image to SVG</h1>
          <div className="mt-2 h-1 w-20 bg-gradient-to-r from-primary to-primary/50" />
          <p className="mt-4 text-lg text-muted-foreground">
            Convert raster images (PNG, JPEG, WebP, BMP) to scalable vector
            graphics (SVG). All processing happens in your browser for complete
            privacy.
          </p>
        </div>

        {/* Main Content */}
        {!hasFile ? (
          /* Upload Zone */
          <div className="mx-auto max-w-2xl">
            <FileUploadZone
              onFilesSelected={handleFileUpload}
              accept={SUPPORTED_IMAGE_FORMATS.join(',')}
              multiple={false}
              validationFn={validateImageFile}
              title="Drop image files here"
              description="or click the button below to select an image from your device. Supports PNG, JPEG, WebP, BMP, and GIF."
              maxSizeLabel="Maximum file size: 10 MB | Maximum dimensions: 4096 × 4096 pixels"
            />
            <div className="mt-6 rounded-lg border border-border bg-card p-6">
              <h3 className="mb-3 font-semibold">Supported Formats</h3>
              <div className="flex flex-wrap gap-2">
                <span className="rounded bg-secondary px-3 py-1 text-sm">
                  PNG
                </span>
                <span className="rounded bg-secondary px-3 py-1 text-sm">
                  JPEG
                </span>
                <span className="rounded bg-secondary px-3 py-1 text-sm">
                  WebP
                </span>
                <span className="rounded bg-secondary px-3 py-1 text-sm">
                  BMP
                </span>
                <span className="rounded bg-secondary px-3 py-1 text-sm">
                  GIF
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Maximum file size: 10 MB | Maximum dimensions: 4096 × 4096
                pixels
              </p>
            </div>
          </div>
        ) : (
          /* Processing View */
          <div className="space-y-6">
            {/* Error Display */}
            {fileState.error && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
                <p className="text-sm font-medium text-destructive">
                  {fileState.error}
                </p>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
              {/* Configuration Panel */}
              <div className="space-y-4">
                <SVGConfigPanel
                  options={conversionOptions}
                  onOptionsChange={setConversionOptions}
                  disabled={isProcessing}
                />

                {/* Auto-convert Toggle */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="auto-convert"
                      checked={isAutoConvert}
                      onCheckedChange={(checked) =>
                        setIsAutoConvert(checked === true)
                      }
                      disabled={isProcessing}
                    />
                    <Label
                      htmlFor="auto-convert"
                      className="cursor-pointer text-sm"
                    >
                      Auto-convert on settings change
                    </Label>
                  </div>
                </div>

                {/* Manual Convert Button */}
                {!isAutoConvert && (
                  <Button
                    onClick={() => handleConvert()}
                    disabled={isProcessing || !hasFile}
                    className="w-full"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Convert to SVG
                  </Button>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleDownload}
                    disabled={!hasResult}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download SVG
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Start Over
                  </Button>
                </div>

                {/* File Info */}
                {hasFile && (
                  <div className="rounded-lg border border-border bg-card p-4 text-sm">
                    <p className="font-medium">{fileState.file?.name}</p>
                    {fileState.result && (
                      <p className="mt-1 text-muted-foreground">
                        Processing time:{' '}
                        {(fileState.result.processingTime / 1000).toFixed(2)}s
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Preview Panel */}
              <div>
                <SVGPreview
                  originalImageUrl={fileState.imageDataUrl}
                  svgDataUrl={fileState.result?.svgDataUrl || null}
                  originalSize={fileState.result?.originalSize || 0}
                  svgSize={fileState.result?.svgSize || 0}
                  compressionRatio={fileState.result?.compressionRatio || 0}
                  isProcessing={isProcessing}
                  error={fileState.error}
                />

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="mt-4 rounded-lg border border-border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>Converting to SVG...</span>
                      <span className="font-semibold">
                        {Math.round(fileState.progress)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${fileState.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 rounded-lg border border-border bg-card p-8">
          <h2 className="mb-6 text-2xl font-semibold">About Image to SVG</h2>

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-lg font-semibold">What is SVG?</h3>
              <p className="text-sm text-muted-foreground">
                Scalable Vector Graphics (SVG) is a resolution-independent image
                format that uses mathematical paths instead of pixels. SVGs
                scale infinitely without quality loss, are smaller for simple
                graphics, and can be edited in code and design tools.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">When to Use SVG</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Logos and brand assets (always sharp)</li>
                <li>• Icons and UI elements (responsive design)</li>
                <li>• Illustrations and diagrams (clean lines)</li>
                <li>• Print materials (any size without pixelation)</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">Conversion Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use high-quality source images (PNG preferred)</li>
                <li>• Simple images convert better than photos</li>
                <li>• Use Logo preset for graphics with limited colors</li>
                <li>• Adjust color precision to balance quality vs file size</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold">Privacy Note</h3>
              <p className="text-sm text-muted-foreground">
                All processing happens in your browser. Your images never leave
                your device. No uploads, no servers, complete privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
