/**
 * Screenshot Annotator Utility Functions
 *
 * This file contains core business logic for image validation, loading,
 * annotation rendering, and export functionality.
 */

import {
  Annotation,
  ArrowAnnotation,
  TextAnnotation,
  RectangleAnnotation,
  CircleAnnotation,
  LineAnnotation,
  PenAnnotation,
  HighlighterAnnotation,
  Point,
  ToolConfig,
  ExportOptions,
  MAX_FILE_SIZE,
  SUPPORTED_FORMATS,
  ERROR_MESSAGES,
  ARROW_HEAD_LENGTH,
  ARROW_HEAD_ANGLE,
  SELECTION_TOLERANCE
} from '@/types/screenshot-annotator'

// ============================================================================
// File Validation and Loading
// ============================================================================

/**
 * Validates an uploaded image file
 * @param file The file to validate
 * @returns Error object if invalid, null if valid
 */
export function validateImageFile(file: File): Error | null {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return new Error(ERROR_MESSAGES.FILE_TOO_LARGE)
  }

  // Check file type
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return new Error(ERROR_MESSAGES.INVALID_FILE_TYPE)
  }

  return null
}

/**
 * Loads an image file and returns an HTMLImageElement
 * @param file The image file to load
 * @returns Promise that resolves to the loaded image
 */
export function loadImageToCanvas(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        resolve(img)
      }

      img.onerror = () => {
        reject(new Error(ERROR_MESSAGES.LOAD_FAILED))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error(ERROR_MESSAGES.LOAD_FAILED))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Generates a filename for the exported image
 * @param originalName Original filename
 * @param format Export format
 * @returns Formatted filename with timestamp
 */
export function generateFilename(originalName: string, format: string): string {
  // Remove extension from original name
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')

  // Generate timestamp: YYYYMMDD-HHMMSS
  const now = new Date()
  const timestamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('') + '-' + [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0')
  ].join('')

  return `annotated-${nameWithoutExt}-${timestamp}.${format}`
}

// ============================================================================
// Canvas Utilities
// ============================================================================

/**
 * Applies style configuration to canvas context
 * @param ctx Canvas rendering context
 * @param config Tool configuration
 */
function applyStyleConfig(ctx: CanvasRenderingContext2D, config: Partial<ToolConfig>) {
  if (config.color) {
    ctx.strokeStyle = config.color
    ctx.fillStyle = config.color
  }
  if (config.strokeWidth) {
    ctx.lineWidth = config.strokeWidth
  }
  if (config.opacity !== undefined) {
    ctx.globalAlpha = config.opacity
  }

  // Smooth line rendering
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

// ============================================================================
// Drawing Functions
// ============================================================================

/**
 * Draws an arrow annotation on the canvas
 */
export function drawArrow(ctx: CanvasRenderingContext2D, annotation: ArrowAnnotation) {
  ctx.save()
  applyStyleConfig(ctx, annotation)

  const { start, end } = annotation

  // Draw main line
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()

  // Calculate arrowhead
  const angle = Math.atan2(end.y - start.y, end.x - start.x)

  const head1 = {
    x: end.x - ARROW_HEAD_LENGTH * Math.cos(angle - ARROW_HEAD_ANGLE),
    y: end.y - ARROW_HEAD_LENGTH * Math.sin(angle - ARROW_HEAD_ANGLE)
  }

  const head2 = {
    x: end.x - ARROW_HEAD_LENGTH * Math.cos(angle + ARROW_HEAD_ANGLE),
    y: end.y - ARROW_HEAD_LENGTH * Math.sin(angle + ARROW_HEAD_ANGLE)
  }

  // Draw arrowhead
  ctx.beginPath()
  ctx.moveTo(end.x, end.y)
  ctx.lineTo(head1.x, head1.y)
  ctx.moveTo(end.x, end.y)
  ctx.lineTo(head2.x, head2.y)
  ctx.stroke()

  ctx.restore()
}

/**
 * Draws a text annotation on the canvas
 */
export function drawText(ctx: CanvasRenderingContext2D, annotation: TextAnnotation) {
  ctx.save()
  applyStyleConfig(ctx, annotation)

  const { x, y, text, fontSize, fontFamily, backgroundColor } = annotation

  // Set font
  ctx.font = `${fontSize}px ${fontFamily}`

  // Measure text for background
  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  const textHeight = fontSize * 1.2 // Approximate line height

  // Draw background if specified
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(x - 4, y - textHeight + 4, textWidth + 8, textHeight + 4)
  }

  // Draw text
  ctx.fillStyle = annotation.color
  ctx.fillText(text, x, y)

  ctx.restore()
}

/**
 * Draws a rectangle annotation on the canvas
 */
export function drawRectangle(ctx: CanvasRenderingContext2D, annotation: RectangleAnnotation) {
  ctx.save()
  applyStyleConfig(ctx, annotation)

  const { x, y, width, height, filled } = annotation

  if (filled) {
    ctx.fillRect(x, y, width, height)
  } else {
    ctx.strokeRect(x, y, width, height)
  }

  ctx.restore()
}

/**
 * Draws a circle/ellipse annotation on the canvas
 */
export function drawCircle(ctx: CanvasRenderingContext2D, annotation: CircleAnnotation) {
  ctx.save()
  applyStyleConfig(ctx, annotation)

  const { x, y, radiusX, radiusY, filled } = annotation

  ctx.beginPath()
  ctx.ellipse(x, y, Math.abs(radiusX), Math.abs(radiusY), 0, 0, 2 * Math.PI)

  if (filled) {
    ctx.fill()
  } else {
    ctx.stroke()
  }

  ctx.restore()
}

/**
 * Draws a line annotation on the canvas
 */
export function drawLine(ctx: CanvasRenderingContext2D, annotation: LineAnnotation) {
  ctx.save()
  applyStyleConfig(ctx, annotation)

  const { start, end } = annotation

  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)
  ctx.stroke()

  ctx.restore()
}

/**
 * Draws a pen annotation (freehand) on the canvas
 */
export function drawPen(ctx: CanvasRenderingContext2D, annotation: PenAnnotation) {
  ctx.save()
  applyStyleConfig(ctx, annotation)

  const { points } = annotation

  if (points.length < 2) {
    // Draw single point
    if (points.length === 1) {
      ctx.beginPath()
      ctx.arc(points[0].x, points[0].y, annotation.strokeWidth / 2, 0, 2 * Math.PI)
      ctx.fill()
    }
    ctx.restore()
    return
  }

  // Draw smooth curve through points using quadratic curves
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2
    const yc = (points[i].y + points[i + 1].y) / 2
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
  }

  // Last point
  const lastPoint = points[points.length - 1]
  const secondLastPoint = points[points.length - 2]
  ctx.quadraticCurveTo(secondLastPoint.x, secondLastPoint.y, lastPoint.x, lastPoint.y)

  ctx.stroke()

  ctx.restore()
}

/**
 * Draws a highlighter annotation on the canvas
 */
export function drawHighlighter(ctx: CanvasRenderingContext2D, annotation: HighlighterAnnotation) {
  // Highlighter is essentially a pen with different default opacity
  drawPen(ctx, annotation as PenAnnotation)
}

/**
 * Draws a single annotation based on its type
 */
export function drawAnnotation(ctx: CanvasRenderingContext2D, annotation: Annotation) {
  switch (annotation.type) {
    case 'arrow':
      drawArrow(ctx, annotation)
      break
    case 'text':
      drawText(ctx, annotation)
      break
    case 'rectangle':
      drawRectangle(ctx, annotation)
      break
    case 'circle':
      drawCircle(ctx, annotation)
      break
    case 'line':
      drawLine(ctx, annotation)
      break
    case 'pen':
      drawPen(ctx, annotation)
      break
    case 'highlighter':
      drawHighlighter(ctx, annotation)
      break
  }
}

/**
 * Draws all annotations on the canvas
 */
export function drawAllAnnotations(ctx: CanvasRenderingContext2D, annotations: Annotation[]) {
  annotations.forEach(annotation => drawAnnotation(ctx, annotation))
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Exports the canvas to a Blob
 * @param canvas The canvas element to export
 * @param options Export options
 * @returns Promise that resolves to the exported Blob
 */
export function exportCanvas(canvas: HTMLCanvasElement, options: ExportOptions): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { format, quality = 0.92 } = options

    const mimeType = `image/${format}`

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error(ERROR_MESSAGES.EXPORT_FAILED))
        }
      },
      mimeType,
      quality
    )
  })
}

// ============================================================================
// Hit Detection for Selection
// ============================================================================

/**
 * Calculates distance from a point to a line segment
 */
function distanceToLineSegment(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    // Line segment is actually a point
    const pdx = point.x - start.x
    const pdy = point.y - start.y
    return Math.sqrt(pdx * pdx + pdy * pdy)
  }

  // Calculate projection of point onto line segment
  let t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared
  t = Math.max(0, Math.min(1, t))

  const projX = start.x + t * dx
  const projY = start.y + t * dy

  const distX = point.x - projX
  const distY = point.y - projY

  return Math.sqrt(distX * distX + distY * distY)
}

/**
 * Checks if a point is inside an annotation (for selection)
 */
export function isPointInAnnotation(annotation: Annotation, point: Point): boolean {
  const tolerance = SELECTION_TOLERANCE

  switch (annotation.type) {
    case 'arrow':
    case 'line': {
      const dist = distanceToLineSegment(point, annotation.start, annotation.end)
      return dist <= tolerance + annotation.strokeWidth / 2
    }

    case 'text': {
      const { x, y, text, fontSize, fontFamily } = annotation
      // Create a temporary canvas to measure text
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return false

      ctx.font = `${fontSize}px ${fontFamily}`
      const metrics = ctx.measureText(text)
      const textWidth = metrics.width
      const textHeight = fontSize * 1.2

      return (
        point.x >= x - 4 &&
        point.x <= x + textWidth + 4 &&
        point.y >= y - textHeight + 4 &&
        point.y <= y + 8
      )
    }

    case 'rectangle': {
      const { x, y, width, height } = annotation
      return (
        point.x >= Math.min(x, x + width) - tolerance &&
        point.x <= Math.max(x, x + width) + tolerance &&
        point.y >= Math.min(y, y + height) - tolerance &&
        point.y <= Math.max(y, y + height) + tolerance
      )
    }

    case 'circle': {
      const { x, y, radiusX, radiusY } = annotation
      const dx = (point.x - x) / Math.abs(radiusX)
      const dy = (point.y - y) / Math.abs(radiusY)
      const distanceSquared = dx * dx + dy * dy
      return distanceSquared <= 1 + tolerance / Math.min(Math.abs(radiusX), Math.abs(radiusY))
    }

    case 'pen':
    case 'highlighter': {
      const { points } = annotation
      // Check if point is close to any segment of the path
      for (let i = 0; i < points.length - 1; i++) {
        const dist = distanceToLineSegment(point, points[i], points[i + 1])
        if (dist <= tolerance + annotation.strokeWidth / 2) {
          return true
        }
      }
      return false
    }

    default:
      return false
  }
}

/**
 * Gets the bounding box of an annotation
 */
export function getAnnotationBounds(annotation: Annotation): { x: number; y: number; width: number; height: number } {
  switch (annotation.type) {
    case 'arrow':
    case 'line': {
      const { start, end } = annotation
      return {
        x: Math.min(start.x, end.x),
        y: Math.min(start.y, end.y),
        width: Math.abs(end.x - start.x),
        height: Math.abs(end.y - start.y)
      }
    }

    case 'text': {
      const { x, y, text, fontSize, fontFamily } = annotation
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return { x, y, width: 100, height: fontSize }

      ctx.font = `${fontSize}px ${fontFamily}`
      const metrics = ctx.measureText(text)
      return {
        x: x - 4,
        y: y - fontSize * 1.2 + 4,
        width: metrics.width + 8,
        height: fontSize * 1.2 + 4
      }
    }

    case 'rectangle': {
      const { x, y, width, height } = annotation
      return {
        x: Math.min(x, x + width),
        y: Math.min(y, y + height),
        width: Math.abs(width),
        height: Math.abs(height)
      }
    }

    case 'circle': {
      const { x, y, radiusX, radiusY } = annotation
      return {
        x: x - Math.abs(radiusX),
        y: y - Math.abs(radiusY),
        width: Math.abs(radiusX) * 2,
        height: Math.abs(radiusY) * 2
      }
    }

    case 'pen':
    case 'highlighter': {
      const { points } = annotation
      if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 }

      let minX = points[0].x
      let minY = points[0].y
      let maxX = points[0].x
      let maxY = points[0].y

      points.forEach(point => {
        minX = Math.min(minX, point.x)
        minY = Math.min(minY, point.y)
        maxX = Math.max(maxX, point.x)
        maxY = Math.max(maxY, point.y)
      })

      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      }
    }

    default:
      return { x: 0, y: 0, width: 0, height: 0 }
  }
}
