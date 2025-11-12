'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, Upload, Download, RotateCcw, Undo, Redo, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { AnnotationToolbar } from '@/components/annotation-toolbar'
import { AnnotationControls } from '@/components/annotation-controls'
import { AnnotationCanvas } from '@/components/annotation-canvas'
import {
  Annotation,
  AnnotationTool,
  ToolConfig,
  ProcessingStatus,
  ExportFormat,
  DEFAULT_TOOL,
  DEFAULT_COLOR,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_OPACITY,
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_FAMILY,
  ERROR_MESSAGES
} from '@/types/screenshot-annotator'
import {
  validateImageFile,
  exportCanvas,
  generateFilename
} from '@/lib/screenshot-annotator'
import { downloadBlob } from '@/lib/zip-utils'

export default function ScreenshotAnnotator() {
  // State
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [currentTool, setCurrentTool] = useState<AnnotationTool>(DEFAULT_TOOL)
  const [toolConfig, setToolConfig] = useState<ToolConfig>({
    color: DEFAULT_COLOR,
    strokeWidth: DEFAULT_STROKE_WIDTH,
    opacity: DEFAULT_OPACITY,
    fontSize: DEFAULT_FONT_SIZE,
    fontFamily: DEFAULT_FONT_FAMILY,
    filled: false
  })
  const [history, setHistory] = useState<Annotation[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null)
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null!)

  // File upload handlers
  const handleFileSelected = useCallback((file: File) => {
    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError.message)
      return
    }

    setStatus(ProcessingStatus.LOADING)
    setError(null)

    // Clear previous state
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }
    setAnnotations([])
    setHistory([[]])
    setHistoryIndex(0)
    setSelectedAnnotationId(null)

    // Create object URL
    const url = URL.createObjectURL(file)
    setImageFile(file)
    setImageUrl(url)
    setStatus(ProcessingStatus.ANNOTATING)
  }, [imageUrl])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelected(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelected(file)
    e.target.value = '' // Reset for re-selection
  }

  // Annotation management
  const addToHistory = useCallback((newAnnotations: Annotation[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(newAnnotations)
      // Limit history size to 50 states
      if (newHistory.length > 50) {
        newHistory.shift()
        setHistoryIndex(prev => prev)
        return newHistory
      }
      setHistoryIndex(newHistory.length - 1)
      return newHistory
    })
  }, [historyIndex])

  const handleAnnotationAdd = useCallback((annotation: Annotation) => {
    const newAnnotations = [...annotations, annotation]
    setAnnotations(newAnnotations)
    addToHistory(newAnnotations)
  }, [annotations, addToHistory])

  const handleAnnotationUpdate = useCallback((id: string, updates: Partial<Annotation>) => {
    const newAnnotations = annotations.map(a =>
      a.id === id ? { ...a, ...updates } as Annotation : a
    )
    setAnnotations(newAnnotations)
    addToHistory(newAnnotations)
  }, [annotations, addToHistory])

  const handleAnnotationDelete = useCallback((id: string) => {
    const newAnnotations = annotations.filter(a => a.id !== id)
    setAnnotations(newAnnotations)
    addToHistory(newAnnotations)
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(null)
    }
  }, [annotations, selectedAnnotationId, addToHistory])

  const handleClearAll = useCallback(() => {
    if (annotations.length === 0) return

    const confirmed = window.confirm('Are you sure you want to clear all annotations?')
    if (confirmed) {
      setAnnotations([])
      addToHistory([])
      setSelectedAnnotationId(null)
    }
  }, [annotations, addToHistory])

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setAnnotations(history[newIndex])
      setSelectedAnnotationId(null)
    }
  }, [history, historyIndex])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setAnnotations(history[newIndex])
      setSelectedAnnotationId(null)
    }
  }, [history, historyIndex])

  // Export
  const handleExport = useCallback(async (format: ExportFormat) => {
    if (!canvasRef.current || !imageFile) {
      setError(ERROR_MESSAGES.NO_IMAGE)
      return
    }

    try {
      setStatus(ProcessingStatus.EXPORTING)
      setError(null)

      const blob = await exportCanvas(canvasRef.current, {
        format,
        quality: format === 'jpeg' ? 0.92 : undefined
      })

      const filename = generateFilename(imageFile.name, format)
      downloadBlob(blob, filename)

      setStatus(ProcessingStatus.ANNOTATING)
    } catch (err) {
      setError(ERROR_MESSAGES.EXPORT_FAILED)
      setStatus(ProcessingStatus.ANNOTATING)
    }
  }, [imageFile])

  // Reset
  const handleReset = useCallback(() => {
    if (annotations.length > 0) {
      const confirmed = window.confirm('Are you sure you want to start over? All annotations will be lost.')
      if (!confirmed) return
    }

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }

    setImageFile(null)
    setImageUrl(null)
    setAnnotations([])
    setHistory([[]])
    setHistoryIndex(0)
    setSelectedAnnotationId(null)
    setCurrentTool(DEFAULT_TOOL)
    setToolConfig({
      color: DEFAULT_COLOR,
      strokeWidth: DEFAULT_STROKE_WIDTH,
      opacity: DEFAULT_OPACITY,
      fontSize: DEFAULT_FONT_SIZE,
      fontFamily: DEFAULT_FONT_FAMILY,
      filled: false
    })
    setStatus(ProcessingStatus.IDLE)
    setError(null)
  }, [imageUrl, annotations])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when annotating
      if (status !== ProcessingStatus.ANNOTATING) return

      // Tool shortcuts (only if not in an input)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'v') setCurrentTool('select')
      if (e.key === 'a') setCurrentTool('arrow')
      if (e.key === 't') setCurrentTool('text')
      if (e.key === 'r') setCurrentTool('rectangle')
      if (e.key === 'c') setCurrentTool('circle')
      if (e.key === 'l') setCurrentTool('line')
      if (e.key === 'p') setCurrentTool('pen')
      if (e.key === 'h') setCurrentTool('highlighter')

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        handleRedo()
      }

      // Delete
      if (e.key === 'Delete' && selectedAnnotationId) {
        handleAnnotationDelete(selectedAnnotationId)
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedAnnotationId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, selectedAnnotationId, handleUndo, handleRedo, handleAnnotationDelete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [imageUrl])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tools
          </Link>

          <div className="text-center mt-6">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Screenshot Annotator
            </h1>
            <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent"></div>
            <p className="mt-6 text-lg text-muted-foreground">
              Mark up screenshots and images with arrows, text, and shapes
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          {/* Upload section (if no image) */}
          {!imageUrl && (
            <div
              className={`rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Upload an image to annotate</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Drag and drop or click to select (PNG, JPEG, WebP, GIF - max 10MB)
              </p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleFileInputChange}
                className="sr-only"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button className="mt-4" asChild>
                  <span>Select Image</span>
                </Button>
              </label>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Annotation interface (if image loaded) */}
          {imageUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
              {/* Left: Canvas */}
              <div className="rounded-lg border border-border bg-card p-4">
                <AnnotationCanvas
                  imageUrl={imageUrl}
                  annotations={annotations}
                  currentTool={currentTool}
                  config={toolConfig}
                  onAnnotationAdd={handleAnnotationAdd}
                  onAnnotationUpdate={handleAnnotationUpdate}
                  onAnnotationSelect={setSelectedAnnotationId}
                  selectedAnnotationId={selectedAnnotationId}
                  canvasRef={canvasRef}
                />
              </div>

              {/* Right: Toolbar and Controls */}
              <div className="space-y-4 lg:w-64">
                {/* Toolbar */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold mb-3">Tools</h3>
                  <AnnotationToolbar
                    currentTool={currentTool}
                    onToolChange={setCurrentTool}
                    disabled={status !== ProcessingStatus.ANNOTATING}
                  />
                </div>

                {/* Controls */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold mb-3">Properties</h3>
                  <AnnotationControls
                    config={toolConfig}
                    onConfigChange={(updates) => setToolConfig({ ...toolConfig, ...updates })}
                    currentTool={currentTool}
                    disabled={status !== ProcessingStatus.ANNOTATING}
                  />
                </div>

                {/* Actions */}
                <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                  <h3 className="text-sm font-semibold mb-3">Actions</h3>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUndo}
                      disabled={historyIndex === 0}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleRedo}
                      disabled={historyIndex === history.length - 1}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      title="Redo (Ctrl+Shift+Z)"
                    >
                      <Redo className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    onClick={() => selectedAnnotationId && handleAnnotationDelete(selectedAnnotationId)}
                    disabled={!selectedAnnotationId}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    title="Delete Selected (Delete)"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>

                  <Button
                    onClick={handleClearAll}
                    disabled={annotations.length === 0}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Clear All
                  </Button>

                  <div className="pt-2 border-t border-border">
                    <Button
                      onClick={() => handleExport('png')}
                      disabled={status === ProcessingStatus.EXPORTING}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {status === ProcessingStatus.EXPORTING ? 'Exporting...' : 'Download PNG'}
                    </Button>
                    <Button
                      onClick={() => handleExport('jpeg')}
                      disabled={status === ProcessingStatus.EXPORTING}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                    >
                      Download JPEG
                    </Button>
                  </div>

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Start Over
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Info section */}
          <div className="rounded-lg border border-border bg-card p-6 mt-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              About Screenshot Annotator
            </h2>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Annotation Tools</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Select (V)</strong>: Click annotations to select, move, or delete them</li>
                  <li><strong>Arrow (A)</strong>: Draw arrows to point to important areas</li>
                  <li><strong>Text (T)</strong>: Add text labels with customizable size and color</li>
                  <li><strong>Rectangle (R)</strong>: Draw rectangles to highlight regions</li>
                  <li><strong>Circle (C)</strong>: Draw circles or ellipses for emphasis</li>
                  <li><strong>Line (L)</strong>: Draw straight lines</li>
                  <li><strong>Pen (P)</strong>: Draw freehand for custom markup</li>
                  <li><strong>Highlighter (H)</strong>: Semi-transparent highlighting</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Use Cases</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Bug reports: Highlight and explain UI issues</li>
                  <li>Documentation: Create annotated screenshots for guides</li>
                  <li>Tutorials: Add arrows and text to show steps</li>
                  <li>Presentations: Mark up images for slides</li>
                  <li>Design feedback: Point out areas needing attention</li>
                  <li>Education: Annotate diagrams and images for teaching</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">Tips</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use bright colors (red, orange, yellow) for important highlights</li>
                  <li>Combine arrows with text for clear explanations</li>
                  <li>Use rectangles to frame specific areas</li>
                  <li>Use highlighter for subtle emphasis</li>
                  <li>Press Ctrl+Z to undo, Ctrl+Shift+Z to redo</li>
                  <li>Select tool allows you to move and edit annotations</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="flex items-center gap-2 text-foreground">
                  <span className="text-lg">🔒</span>
                  <strong>Privacy:</strong> All processing happens in your browser. Your images never leave your device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
