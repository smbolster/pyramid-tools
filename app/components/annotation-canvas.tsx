'use client'

/**
 * Annotation Canvas Component
 *
 * Canvas component for displaying images and handling annotation drawing.
 */

import { useEffect, useRef, useState } from 'react'
import {
  Annotation,
  AnnotationTool,
  Point,
  ToolConfig,
  HIGHLIGHTER_OPACITY,
  HIGHLIGHTER_STROKE_WIDTH
} from '@/types/screenshot-annotator'
import {
  drawAllAnnotations,
  isPointInAnnotation
} from '@/lib/screenshot-annotator'

interface AnnotationCanvasProps {
  imageUrl: string | null
  annotations: Annotation[]
  currentTool: AnnotationTool
  config: ToolConfig
  onAnnotationAdd: (annotation: Annotation) => void
  onAnnotationUpdate: (id: string, updates: Partial<Annotation>) => void
  onAnnotationSelect: (id: string | null) => void
  selectedAnnotationId: string | null
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export function AnnotationCanvas({
  imageUrl,
  annotations,
  currentTool,
  config,
  onAnnotationAdd,
  onAnnotationUpdate,
  onAnnotationSelect,
  selectedAnnotationId,
  canvasRef
}: AnnotationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 })

  // Get simple bounds for selection highlight
  const getSimpleBounds = (annotation: Annotation): { x: number; y: number; width: number; height: number } | null => {
    switch (annotation.type) {
      case 'arrow':
      case 'line':
        return {
          x: Math.min(annotation.start.x, annotation.end.x),
          y: Math.min(annotation.start.y, annotation.end.y),
          width: Math.abs(annotation.end.x - annotation.start.x),
          height: Math.abs(annotation.end.y - annotation.start.y)
        }
      case 'rectangle':
        return {
          x: annotation.x,
          y: annotation.y,
          width: annotation.width,
          height: annotation.height
        }
      case 'circle':
        return {
          x: annotation.x - annotation.radiusX,
          y: annotation.y - annotation.radiusY,
          width: annotation.radiusX * 2,
          height: annotation.radiusY * 2
        }
      default:
        return null
    }
  }

  // Draw selection highlight
  const drawSelectionHighlight = (ctx: CanvasRenderingContext2D, annotation: Annotation) => {
    ctx.save()
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])

    // Draw bounding box
    const bounds = getSimpleBounds(annotation)
    if (bounds) {
      ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10)
    }

    ctx.restore()
  }

  // Draw preview while creating annotation
  const drawPreview = (ctx: CanvasRenderingContext2D) => {
    if (!startPoint || !currentPoint) return

    ctx.save()
    ctx.strokeStyle = config.color
    ctx.fillStyle = config.color
    ctx.lineWidth = config.strokeWidth
    ctx.globalAlpha = currentTool === 'highlighter' ? HIGHLIGHTER_OPACITY : config.opacity
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.setLineDash([5, 5]) // Dashed line for preview

    switch (currentTool) {
      case 'arrow':
      case 'line':
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(currentPoint.x, currentPoint.y)
        ctx.stroke()
        break

      case 'rectangle':
        {
          const width = currentPoint.x - startPoint.x
          const height = currentPoint.y - startPoint.y
          if (config.filled) {
            ctx.fillRect(startPoint.x, startPoint.y, width, height)
          } else {
            ctx.strokeRect(startPoint.x, startPoint.y, width, height)
          }
        }
        break

      case 'circle':
        {
          const radiusX = Math.abs(currentPoint.x - startPoint.x) / 2
          const radiusY = Math.abs(currentPoint.y - startPoint.y) / 2
          const centerX = (startPoint.x + currentPoint.x) / 2
          const centerY = (startPoint.y + currentPoint.y) / 2
          ctx.beginPath()
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
          if (config.filled) {
            ctx.fill()
          } else {
            ctx.stroke()
          }
        }
        break

      case 'pen':
      case 'highlighter':
        if (drawingPoints.length > 1) {
          ctx.beginPath()
          ctx.moveTo(drawingPoints[0].x, drawingPoints[0].y)
          for (let i = 1; i < drawingPoints.length; i++) {
            ctx.lineTo(drawingPoints[i].x, drawingPoints[i].y)
          }
          ctx.stroke()
        }
        break
    }

    ctx.restore()
  }

  // Redraw canvas function
  const redrawCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !imageRef.current) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background image
    ctx.drawImage(imageRef.current, 0, 0)

    // Draw all annotations
    drawAllAnnotations(ctx, annotations)

    // Draw preview while drawing
    if (isDrawing && startPoint && currentPoint) {
      drawPreview(ctx)
    }

    // Draw selection highlight
    if (selectedAnnotationId) {
      const selected = annotations.find(a => a.id === selectedAnnotationId)
      if (selected) {
        drawSelectionHighlight(ctx, selected)
      }
    }
  }

  // Load image and setup canvas
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width
      canvas.height = img.height

      // Store image reference
      imageRef.current = img

      // Initial draw
      redrawCanvas()
    }
    img.src = imageUrl
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl])

  // Redraw canvas when annotations change
  useEffect(() => {
    redrawCanvas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations, selectedAnnotationId, isDrawing, startPoint, currentPoint, drawingPoints])

  // Get canvas coordinates from mouse event
  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  // Mouse down handler
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e)

    if (currentTool === 'select') {
      // Check if clicking on an annotation
      const clickedAnnotation = [...annotations].reverse().find(a => isPointInAnnotation(a, point))
      if (clickedAnnotation) {
        onAnnotationSelect(clickedAnnotation.id)
        setIsDragging(true)
        const bounds = getSimpleBounds(clickedAnnotation)
        if (bounds) {
          setDragOffset({ x: point.x - bounds.x, y: point.y - bounds.y })
        }
      } else {
        onAnnotationSelect(null)
      }
    } else if (currentTool === 'text') {
      // Prompt for text
      const text = window.prompt('Enter text for annotation:')
      if (text && text.trim()) {
        const annotation: Annotation = {
          id: Date.now().toString(),
          type: 'text',
          x: point.x,
          y: point.y,
          text: text.trim(),
          fontSize: config.fontSize,
          fontFamily: config.fontFamily,
          color: config.color,
          strokeWidth: config.strokeWidth,
          opacity: config.opacity
        }
        onAnnotationAdd(annotation)
      }
    } else if (currentTool === 'pen' || currentTool === 'highlighter') {
      setIsDrawing(true)
      setDrawingPoints([point])
    } else {
      setIsDrawing(true)
      setStartPoint(point)
      setCurrentPoint(point)
    }
  }

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e)

    if (isDragging && selectedAnnotationId) {
      // Drag selected annotation
      const selected = annotations.find(a => a.id === selectedAnnotationId)
      if (selected) {
        const newX = point.x - dragOffset.x
        const newY = point.y - dragOffset.y

        // Update annotation position (simplified - only works for some types)
        if (selected.type === 'text') {
          onAnnotationUpdate(selectedAnnotationId, { x: point.x, y: point.y })
        } else if (selected.type === 'rectangle') {
          onAnnotationUpdate(selectedAnnotationId, { x: newX, y: newY })
        }
      }
    } else if (isDrawing) {
      if (currentTool === 'pen' || currentTool === 'highlighter') {
        setDrawingPoints(prev => [...prev, point])
      } else {
        setCurrentPoint(point)
      }
    }
  }

  // Mouse up handler
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false)
      return
    }

    if (!isDrawing || !startPoint) return

    const point = getCanvasPoint(e)

    let annotation: Annotation | null = null

    switch (currentTool) {
      case 'arrow':
        annotation = {
          id: Date.now().toString(),
          type: 'arrow',
          start: startPoint,
          end: point,
          color: config.color,
          strokeWidth: config.strokeWidth,
          opacity: config.opacity
        }
        break

      case 'line':
        annotation = {
          id: Date.now().toString(),
          type: 'line',
          start: startPoint,
          end: point,
          color: config.color,
          strokeWidth: config.strokeWidth,
          opacity: config.opacity
        }
        break

      case 'rectangle':
        annotation = {
          id: Date.now().toString(),
          type: 'rectangle',
          x: startPoint.x,
          y: startPoint.y,
          width: point.x - startPoint.x,
          height: point.y - startPoint.y,
          filled: config.filled,
          color: config.color,
          strokeWidth: config.strokeWidth,
          opacity: config.opacity
        }
        break

      case 'circle':
        {
          const radiusX = Math.abs(point.x - startPoint.x) / 2
          const radiusY = Math.abs(point.y - startPoint.y) / 2
          const centerX = (startPoint.x + point.x) / 2
          const centerY = (startPoint.y + point.y) / 2
          annotation = {
            id: Date.now().toString(),
            type: 'circle',
            x: centerX,
            y: centerY,
            radiusX,
            radiusY,
            filled: config.filled,
            color: config.color,
            strokeWidth: config.strokeWidth,
            opacity: config.opacity
          }
        }
        break

      case 'pen':
        if (drawingPoints.length > 1) {
          annotation = {
            id: Date.now().toString(),
            type: 'pen',
            points: drawingPoints,
            color: config.color,
            strokeWidth: config.strokeWidth,
            opacity: config.opacity
          }
        }
        break

      case 'highlighter':
        if (drawingPoints.length > 1) {
          annotation = {
            id: Date.now().toString(),
            type: 'highlighter',
            points: drawingPoints,
            color: config.color,
            strokeWidth: currentTool === 'highlighter' ? HIGHLIGHTER_STROKE_WIDTH : config.strokeWidth,
            opacity: HIGHLIGHTER_OPACITY
          }
        }
        break
    }

    if (annotation) {
      onAnnotationAdd(annotation)
    }

    // Reset drawing state
    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
    setDrawingPoints([])
  }

  // Get cursor style based on current tool
  const getCursorStyle = () => {
    switch (currentTool) {
      case 'select':
        return 'default'
      case 'text':
        return 'text'
      case 'pen':
      case 'highlighter':
        return 'crosshair'
      default:
        return 'crosshair'
    }
  }

  return (
    <div ref={containerRef} className="flex items-center justify-center bg-muted/20 rounded-lg p-4 min-h-[400px]">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDrawing(false)
          setIsDragging(false)
        }}
        className="border-2 border-border bg-white max-w-full max-h-[600px] object-contain"
        style={{ cursor: getCursorStyle() }}
      />
    </div>
  )
}
