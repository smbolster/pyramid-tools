'use client';

/**
 * PDF Splitter Tool Page
 * Allows users to split PDF documents into separate files using various methods
 */

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Scissors, RefreshCw, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { PdfPageGrid } from '@/components/pdf-page-grid';
import { SplitMethodSelector } from '@/components/split-method-selector';
import { SplitResultsPreview } from '@/components/split-results-preview';
import { downloadBlob } from '@/lib/zip-utils';
import { validatePdfFile, splitPdf } from '@/lib/pdf-splitter';
import { generatePdfPreview, getPdfPageCount } from '@/lib/pdf-preview';
import type {
  PdfPageState,
  SplitMethod,
  SplitConfig,
  SplitResult,
} from '@/types/pdf-splitter';
import {
  SplitStatus,
  DEFAULT_SPLIT_METHOD,
  DEFAULT_PAGES_PER_FILE,
} from '@/types/pdf-splitter';

export default function PdfSplitterPage() {
  // State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pages, setPages] = useState<PdfPageState[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(DEFAULT_SPLIT_METHOD);
  const [splitConfig, setSplitConfig] = useState<SplitConfig>({
    method: DEFAULT_SPLIT_METHOD,
    selectedPages: [],
  });
  const [results, setResults] = useState<SplitResult[]>([]);
  const [status, setStatus] = useState<SplitStatus>(SplitStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate thumbnails for pages
  const generateThumbnails = useCallback(async (file: File, pageCount: number) => {
    // Initialize pages with loading state
    const initialPages: PdfPageState[] = Array.from({ length: pageCount }, (_, i) => ({
      pageNumber: i + 1,
      thumbnail: null,
      selected: false,
      width: 0,
      height: 0,
      isLoading: true,
    }));
    setPages(initialPages);

    // Generate thumbnails in batches
    const batchSize = 5;
    for (let i = 0; i < pageCount; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, pageCount); j++) {
        batch.push(
          generatePdfPreview(file, j + 1).catch(err => {
            console.error(`Failed to generate thumbnail for page ${j + 1}:`, err);
            return null;
          })
        );
      }

      const thumbnails = await Promise.all(batch);

      setPages(prevPages => {
        const newPages = [...prevPages];
        thumbnails.forEach((thumbnail, idx) => {
          const pageIndex = i + idx;
          if (pageIndex < newPages.length) {
            newPages[pageIndex] = {
              ...newPages[pageIndex],
              thumbnail,
              isLoading: false,
            };
          }
        });
        return newPages;
      });
    }
  }, []);

  // Handle file selection
  const handleFileSelected = useCallback(
    async (file: File) => {
      // Validate file
      const validationError = validatePdfFile(file);
      if (validationError) {
        setError(validationError.message);
        return;
      }

      try {
        setStatus(SplitStatus.LOADING_PDF);
        setError(null);
        setResults([]);
        setSelectedPages(new Set());

        // Get page count
        const pageCount = await getPdfPageCount(file);

        setPdfFile(file);
        setOriginalFilename(file.name);
        setTotalPages(pageCount);

        // Generate thumbnails
        await generateThumbnails(file, pageCount);

        setStatus(SplitStatus.IDLE);
      } catch (err) {
        console.error('Failed to load PDF:', err);
        setError(err instanceof Error ? err.message : 'Failed to load PDF file');
        setStatus(SplitStatus.ERROR);
      }
    },
    [generateThumbnails]
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const pdfFile = files.find(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));

      if (pdfFile) {
        handleFileSelected(pdfFile);
      } else {
        setError('Please drop a PDF file');
      }
    },
    [handleFileSelected]
  );

  // File input change handler
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelected(file);
      }
      // Reset input value to allow re-selecting same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileSelected]
  );

  // Page selection handlers
  const handlePageSelect = useCallback(
    (pageNumber: number) => {
      setSelectedPages(prev => {
        const newSet = new Set(prev);
        if (newSet.has(pageNumber)) {
          newSet.delete(pageNumber);
        } else {
          newSet.add(pageNumber);
        }
        return newSet;
      });

      setPages(prevPages =>
        prevPages.map(p =>
          p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
        )
      );

      // Update config if extract method
      if (splitMethod === 'extract') {
        setSplitConfig(prev => ({
          ...prev,
          selectedPages: Array.from(selectedPages).sort((a, b) => a - b),
        }));
      }
    },
    [splitMethod, selectedPages]
  );

  const handleSelectAll = useCallback(() => {
    const allPages = new Set(pages.map(p => p.pageNumber));
    setSelectedPages(allPages);
    setPages(prevPages => prevPages.map(p => ({ ...p, selected: true })));

    if (splitMethod === 'extract') {
      setSplitConfig(prev => ({
        ...prev,
        selectedPages: Array.from(allPages).sort((a, b) => a - b),
      }));
    }
  }, [pages, splitMethod]);

  const handleSelectNone = useCallback(() => {
    setSelectedPages(new Set());
    setPages(prevPages => prevPages.map(p => ({ ...p, selected: false })));

    if (splitMethod === 'extract') {
      setSplitConfig(prev => ({
        ...prev,
        selectedPages: [],
      }));
    }
  }, [splitMethod]);

  // Split method handlers
  const handleMethodChange = useCallback(
    (method: SplitMethod) => {
      setSplitMethod(method);
      setResults([]);
      setError(null);

      // Set default config based on method
      switch (method) {
        case 'extract':
          setSplitConfig({
            method,
            selectedPages: Array.from(selectedPages).sort((a, b) => a - b),
          });
          break;
        case 'individual':
          setSplitConfig({ method });
          break;
        case 'ranges':
          setSplitConfig({
            method,
            ranges: [{ start: 1, end: Math.min(5, totalPages) }],
          });
          break;
        case 'page-count':
          setSplitConfig({
            method,
            pagesPerFile: DEFAULT_PAGES_PER_FILE,
          });
          break;
      }
    },
    [selectedPages, totalPages]
  );

  const handleConfigChange = useCallback(
    (updates: Partial<SplitConfig>) => {
      setSplitConfig(prev => ({ ...prev, ...updates }));
      setResults([]);
      setError(null);
    },
    []
  );

  // Split execution
  const handleSplit = useCallback(async () => {
    if (!pdfFile) return;

    try {
      setStatus(SplitStatus.SPLITTING);
      setError(null);

      const splitResults = await splitPdf(pdfFile, splitConfig);
      setResults(splitResults);
      setStatus(SplitStatus.SUCCESS);
    } catch (err) {
      console.error('Split failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to split PDF');
      setStatus(SplitStatus.ERROR);
    }
  }, [pdfFile, splitConfig]);

  // Download handlers
  const handleDownloadSingle = useCallback((index: number) => {
    const result = results[index];
    if (result) {
      downloadBlob(result.blob, result.filename);
    }
  }, [results]);

  const handleDownloadAll = useCallback(async () => {
    if (results.length === 1) {
      handleDownloadSingle(0);
      return;
    }

    try {
      const zip = new JSZip();
      results.forEach(result => {
        zip.file(result.filename, result.blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadBlob(zipBlob, `split-pdfs-${timestamp}.zip`);
    } catch (err) {
      console.error('Failed to create ZIP:', err);
      setError('Failed to create ZIP file');
    }
  }, [results, handleDownloadSingle]);

  // Reset
  const handleReset = useCallback(() => {
    setPdfFile(null);
    setOriginalFilename(null);
    setTotalPages(0);
    setPages([]);
    setSelectedPages(new Set());
    setSplitMethod(DEFAULT_SPLIT_METHOD);
    setSplitConfig({ method: DEFAULT_SPLIT_METHOD, selectedPages: [] });
    setResults([]);
    setStatus(SplitStatus.IDLE);
    setError(null);
    setIsDragging(false);
  }, []);

  const canSplit = pdfFile && status === SplitStatus.IDLE && !error;
  const isProcessing = status === SplitStatus.LOADING_PDF || status === SplitStatus.SPLITTING;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tools
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Scissors className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">PDF Splitter</h1>
            </div>
          </div>

          <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/50 rounded-full mb-4" />

          <p className="text-lg text-muted-foreground max-w-2xl">
            Split PDF documents into separate files. Extract specific pages, create individual
            files for each page, or split by custom ranges. All processing happens in your
            browser for complete privacy.
          </p>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          {/* Error display */}
          {error && (
            <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          {/* Upload section */}
          {!pdfFile && (
            <div className="rounded-lg border-2 border-dashed border-border bg-card p-8">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  flex flex-col items-center justify-center gap-4 p-8 rounded-lg transition-colors
                  ${isDragging ? 'bg-primary/10 border-2 border-primary' : ''}
                `}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>

                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">
                    Drop your PDF here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Maximum file size: 100MB
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Select PDF File
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* PDF loaded - show preview and options */}
          {pdfFile && (
            <>
              {/* File info */}
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold">{originalFilename}</p>
                    <p className="text-sm text-muted-foreground">
                      {totalPages} {totalPages === 1 ? 'page' : 'pages'}
                    </p>
                  </div>

                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Page grid */}
              {status === SplitStatus.LOADING_PDF ? (
                <div className="rounded-lg border border-border bg-card p-8">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading PDF pages...</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-4">PDF Pages</h2>
                  <PdfPageGrid
                    pages={pages}
                    selectedPages={selectedPages}
                    onPageSelect={handlePageSelect}
                    onSelectAll={handleSelectAll}
                    onSelectNone={handleSelectNone}
                    disabled={isProcessing}
                  />
                </div>
              )}

              {/* Split method selector */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Split Method</h2>
                <SplitMethodSelector
                  selectedMethod={splitMethod}
                  onMethodChange={handleMethodChange}
                  config={splitConfig}
                  onConfigChange={handleConfigChange}
                  totalPages={totalPages}
                  selectedPageCount={selectedPages.size}
                />
              </div>

              {/* Split button */}
              {status !== SplitStatus.SUCCESS && (
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleSplit}
                    disabled={!canSplit || isProcessing}
                    className="min-w-[200px]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Scissors className="w-5 h-5 mr-2" />
                        Split PDF
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Results */}
              {(results.length > 0 || status === SplitStatus.SPLITTING) && (
                <div className="rounded-lg border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Results</h2>
                  <SplitResultsPreview
                    results={results}
                    isProcessing={status === SplitStatus.SPLITTING}
                    onDownload={handleDownloadSingle}
                    onDownloadAll={handleDownloadAll}
                  />
                </div>
              )}
            </>
          )}

          {/* Info section */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">About PDF Splitter</h2>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">What is PDF Splitting?</h3>
                <p>
                  PDF splitting allows you to divide a single PDF document into multiple separate
                  files. This is useful for extracting specific pages, removing unwanted content,
                  creating individual documents for distribution, or reorganizing large PDFs into
                  manageable sections.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Splitting Methods</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>Extract Selected Pages:</strong> Choose specific pages to keep in a
                    new PDF
                  </li>
                  <li>
                    <strong>Individual Pages:</strong> Create one PDF per page (useful for
                    distribution)
                  </li>
                  <li>
                    <strong>Custom Ranges:</strong> Define multiple sections (e.g., chapters)
                  </li>
                  <li>
                    <strong>By Page Count:</strong> Split evenly into smaller documents
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Privacy & Security</h3>
                <p>
                  All PDF processing happens entirely in your browser. Your files are never
                  uploaded to any server, ensuring complete privacy and security for your
                  documents.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Tips</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Hold Shift and click to select a range of pages quickly</li>
                  <li>Use custom names for ranges to create descriptive filenames</li>
                  <li>Preview your split configuration before processing</li>
                  <li>Download all files as a ZIP for easier management</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
