/**
 * Screenshot Annotator Type Definitions
 *
 * This file contains all TypeScript types, interfaces, and constants
 * for the Screenshot Annotator tool.
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Available annotation tools
 */
export type AnnotationTool =
  | 'select'      // Selection and editing tool
  | 'arrow'       // Arrow annotation
  | 'text'        // Text annotation
  | 'rectangle'   // Rectangle shape
  | 'circle'      // Circle/ellipse shape
  | 'line'        // Straight line
  | 'pen'         // Freehand drawing
  | 'highlighter' // Semi-transparent highlighter

/**
 * Processing status states
 */
export enum ProcessingStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  ANNOTATING = 'annotating',
  EXPORTING = 'exporting',
  ERROR = 'error'
}

/**
 * Point in 2D space
 */
export interface Point {
  x: number
  y: number
}

// ============================================================================
// Annotation Interfaces
// ============================================================================

/**
 * Base properties shared by all annotation types
 */
export interface AnnotationBase {
  id: string
  type: AnnotationTool
  color: string
  strokeWidth: number
  opacity: number
}

/**
 * Arrow annotation with start and end points
 */
export interface ArrowAnnotation extends AnnotationBase {
  type: 'arrow'
  start: Point
  end: Point
}

/**
 * Text annotation with position and text content
 */
export interface TextAnnotation extends AnnotationBase {
  type: 'text'
  x: number
  y: number
  text: string
  fontSize: number
  fontFamily: string
  backgroundColor?: string
}

/**
 * Rectangle annotation (outline or filled)
 */
export interface RectangleAnnotation extends AnnotationBase {
  type: 'rectangle'
  x: number
  y: number
  width: number
  height: number
  filled: boolean
}

/**
 * Circle/ellipse annotation (outline or filled)
 */
export interface CircleAnnotation extends AnnotationBase {
  type: 'circle'
  x: number
  y: number
  radiusX: number
  radiusY: number
  filled: boolean
}

/**
 * Line annotation with start and end points
 */
export interface LineAnnotation extends AnnotationBase {
  type: 'line'
  start: Point
  end: Point
}

/**
 * Pen annotation with freehand path
 */
export interface PenAnnotation extends AnnotationBase {
  type: 'pen'
  points: Point[]
}

/**
 * Highlighter annotation with semi-transparent freehand path
 */
export interface HighlighterAnnotation extends AnnotationBase {
  type: 'highlighter'
  points: Point[]
}

/**
 * Union type of all annotation types
 */
export type Annotation =
  | ArrowAnnotation
  | TextAnnotation
  | RectangleAnnotation
  | CircleAnnotation
  | LineAnnotation
  | PenAnnotation
  | HighlighterAnnotation

// ============================================================================
// Configuration and State
// ============================================================================

/**
 * Configuration for annotation tools
 */
export interface ToolConfig {
  color: string
  strokeWidth: number
  opacity: number
  fontSize: number
  fontFamily: string
  filled: boolean // for shapes (rectangle, circle)
}

/**
 * Overall annotator state
 */
export interface AnnotatorState {
  imageFile: File | null
  imageUrl: string | null
  currentTool: AnnotationTool
  annotations: Annotation[]
  history: Annotation[][] // for undo/redo
  historyIndex: number
  selectedAnnotationId: string | null
  config: ToolConfig
  status: ProcessingStatus
  error: string | null
}

// ============================================================================
// Export Types
// ============================================================================

/**
 * Supported export formats
 */
export type ExportFormat = 'png' | 'jpeg' | 'webp'

/**
 * Options for exporting canvas
 */
export interface ExportOptions {
  format: ExportFormat
  quality?: number // 0-1 for JPEG/WebP compression
  scale?: number   // scaling factor (default: 1)
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Maximum file size for image uploads (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * Supported image MIME types
 */
export const SUPPORTED_FORMATS = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif'
]

/**
 * Default annotation tool
 */
export const DEFAULT_TOOL: AnnotationTool = 'select'

/**
 * Default annotation color (red)
 */
export const DEFAULT_COLOR = '#FF0000'

/**
 * Default stroke width
 */
export const DEFAULT_STROKE_WIDTH = 3

/**
 * Default opacity (fully opaque)
 */
export const DEFAULT_OPACITY = 1

/**
 * Default font size for text annotations
 */
export const DEFAULT_FONT_SIZE = 16

/**
 * Default font family for text annotations
 */
export const DEFAULT_FONT_FAMILY = 'Arial, sans-serif'

/**
 * Default highlighter opacity (semi-transparent)
 */
export const HIGHLIGHTER_OPACITY = 0.3

/**
 * Default highlighter stroke width (thicker than pen)
 */
export const HIGHLIGHTER_STROKE_WIDTH = 20

/**
 * Arrowhead size in pixels
 */
export const ARROW_HEAD_LENGTH = 15

/**
 * Arrowhead angle in radians (30 degrees)
 */
export const ARROW_HEAD_ANGLE = Math.PI / 6

/**
 * Selection hit detection tolerance in pixels
 */
export const SELECTION_TOLERANCE = 10

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: 'Please upload a valid image file (PNG, JPEG, WebP, GIF)',
  FILE_TOO_LARGE: `Image size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
  LOAD_FAILED: 'Failed to load image. Please try another file.',
  EXPORT_FAILED: 'Failed to export annotated image. Please try again.',
  NO_IMAGE: 'Please upload an image first',
  NO_TEXT: 'Please enter some text for the annotation'
} as const
