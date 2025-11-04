'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { QRCodePreview } from '@/components/qr-code-preview';
import {
  generateQRCode,
  validateQRInput,
  hasLowContrast,
  getSizeInPixels,
  dataUrlToBlob,
  generateFilename,
} from '@/lib/qr-code-generator';
import { downloadBlob } from '@/lib/zip-utils';
import {
  QRCodeSize,
  ErrorCorrectionLevel,
  MAX_TEXT_LENGTH,
  DEFAULT_SIZE,
  DEFAULT_ERROR_CORRECTION,
  DEFAULT_FG_COLOR,
  DEFAULT_BG_COLOR,
  DEFAULT_MARGIN,
  ERROR_CORRECTION_DESCRIPTIONS,
  SIZE_DESCRIPTIONS,
  ERROR_MESSAGES,
} from '@/types/qr-code-generator';

export default function QRCodeGeneratorPage() {
  // State management
  const [inputText, setInputText] = useState('');
  const [sizePreset, setSizePreset] = useState<QRCodeSize>(DEFAULT_SIZE);
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionLevel>(DEFAULT_ERROR_CORRECTION);
  const [foregroundColor, setForegroundColor] = useState(DEFAULT_FG_COLOR);
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_BG_COLOR);
  const [margin, setMargin] = useState(DEFAULT_MARGIN);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contrastWarning, setContrastWarning] = useState<string | null>(null);

  // Generate QR code handler
  const generateQRCodeHandler = useCallback(async () => {
    // Validate input
    const validationError = validateQRInput(inputText);
    if (validationError) {
      setError(validationError);
      setQrCodeDataUrl(null);
      return;
    }

    // Check contrast
    if (hasLowContrast(foregroundColor, backgroundColor)) {
      setContrastWarning(ERROR_MESSAGES.LOW_CONTRAST);
    } else {
      setContrastWarning(null);
    }

    setIsGenerating(true);
    setError(null);

    try {
      const config = {
        data: inputText,
        size: getSizeInPixels(sizePreset),
        errorCorrectionLevel: errorCorrection,
        foregroundColor,
        backgroundColor,
        margin,
      };

      const dataUrl = await generateQRCode(config);
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.GENERATION_FAILED);
      setQrCodeDataUrl(null);
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, sizePreset, errorCorrection, foregroundColor, backgroundColor, margin]);

  // Debounced auto-generation on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputText.trim()) {
        generateQRCodeHandler();
      } else {
        setQrCodeDataUrl(null);
        setError(null);
        setContrastWarning(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputText, sizePreset, errorCorrection, foregroundColor, backgroundColor, margin, generateQRCodeHandler]);

  // Download handler
  const handleDownload = async () => {
    if (!qrCodeDataUrl) return;

    try {
      const blob = await dataUrlToBlob(qrCodeDataUrl);
      const filename = generateFilename('qr-code');
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download QR code. Please try again.');
    }
  };

  // Reset handler
  const handleReset = () => {
    setInputText('');
    setSizePreset(DEFAULT_SIZE);
    setErrorCorrection(DEFAULT_ERROR_CORRECTION);
    setForegroundColor(DEFAULT_FG_COLOR);
    setBackgroundColor(DEFAULT_BG_COLOR);
    setMargin(DEFAULT_MARGIN);
    setQrCodeDataUrl(null);
    setError(null);
    setContrastWarning(null);
  };

  const characterCount = inputText.length;
  const isOverLimit = characterCount > MAX_TEXT_LENGTH;

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
              QR Code Generator
            </h1>
            <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent"></div>
            <p className="mt-6 text-lg text-muted-foreground">
              Create customizable QR codes from text or URLs. All processing happens
              in your browser - your data never leaves your device.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Input and Configuration */}
          <div className="space-y-6">
            {/* Input Section */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Input Text
              </h2>
              <div className="space-y-2">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter URL or text to generate QR code..."
                  maxLength={MAX_TEXT_LENGTH + 100} // Allow typing slightly over to show error
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isOverLimit
                      ? 'border-destructive'
                      : 'border-border'
                  } bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-colors`}
                />
                <div className="flex items-center justify-between text-sm">
                  <span className={`${
                    isOverLimit
                      ? 'text-destructive font-medium'
                      : 'text-muted-foreground'
                  }`}>
                    {characterCount} / {MAX_TEXT_LENGTH} characters
                  </span>
                </div>
              </div>
            </div>

            {/* Size Configuration */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Size
              </h2>
              <div className="space-y-3">
                {(Object.keys(SIZE_DESCRIPTIONS) as QRCodeSize[]).map((size) => (
                  <label
                    key={size}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="size"
                      value={size}
                      checked={sizePreset === size}
                      onChange={(e) => setSizePreset(e.target.value as QRCodeSize)}
                      className="w-4 h-4 focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-foreground group-hover:text-primary transition-colors">
                      <span className="font-medium capitalize">{size}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {SIZE_DESCRIPTIONS[size]}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Error Correction */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Error Correction Level
              </h2>
              <div className="space-y-3">
                {(Object.keys(ERROR_CORRECTION_DESCRIPTIONS) as ErrorCorrectionLevel[]).map((level) => (
                  <label
                    key={level}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="errorCorrection"
                      value={level}
                      checked={errorCorrection === level}
                      onChange={(e) => setErrorCorrection(e.target.value as ErrorCorrectionLevel)}
                      className="w-4 h-4 focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-foreground group-hover:text-primary transition-colors text-sm">
                      {ERROR_CORRECTION_DESCRIPTIONS[level]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Configuration */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Colors
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Foreground Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-12 h-12 rounded border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-12 rounded border border-border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                {contrastWarning && (
                  <div className="flex items-start gap-2 p-3 bg-accent/20 border border-accent rounded-lg">
                    <AlertCircle className="size-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-accent-foreground">
                      {contrastWarning}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Options */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Advanced Options
              </h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Margin (Quiet Zone): {margin}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  White space around the QR code
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Preview and Actions */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Preview
              </h2>
              <QRCodePreview
                dataUrl={qrCodeDataUrl}
                isGenerating={isGenerating}
                error={error}
              />
            </div>

            {/* Actions */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDownload}
                  disabled={!qrCodeDataUrl || isGenerating}
                  className="flex-1 gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download QR Code
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Information Section */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                About This Tool
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    What are QR Codes?
                  </h3>
                  <p>
                    QR codes are two-dimensional barcodes that can store text, URLs, contact information, and more.
                    They can be scanned using smartphone cameras to quickly access the encoded information.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Best Practices
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Keep URLs short for better scannability</li>
                    <li>Ensure high contrast between colors</li>
                    <li>Test generated codes before printing</li>
                    <li>Leave adequate margin (quiet zone) around code</li>
                    <li>Use higher error correction for printed materials</li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Privacy:</strong> All processing happens in your browser.
                    No data is sent to any server.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
