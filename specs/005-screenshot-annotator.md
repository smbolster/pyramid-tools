# Feature: Screenshot Annotator

## Feature Plan Created: /Users/sbolster/projects/corporate/pyramid-tools/specs/005-screenshot-annotator.md

## Feature Description

Create a Screenshot Annotator tool that allows users to upload screenshots or images, annotate them with arrows, text, shapes (rectangles, circles, lines), and freehand drawings, then download the annotated image instantly. Users can upload images via drag-and-drop or file picker, select from various annotation tools, customize colors and stroke widths, and export the final result in common formats (PNG, JPEG). The tool will be entirely client-side using the HTML Canvas API, requiring no backend processing, ensuring complete privacy. It provides an intuitive interface with a toolbar for annotation tools, real-time preview, undo/redo functionality, and flexible export options. This feature is perfect for creating documentation, bug reports, tutorials, presentations, or any scenario where visual markup adds clarity to images.

## User Story

As a user creating documentation, bug reports, or tutorials
I want to annotate screenshots with arrows, text, and shapes
So that I can highlight important areas, add explanations, and communicate visual information more effectively without needing external software

## Problem Statement

Users frequently need to annotate screenshots and images for various purposes: creating documentation, reporting bugs, building tutorials, preparing presentations, highlighting important information, or explaining visual concepts. While many annotation tools exist, they often have limitations such as requiring software installation, being platform-specific (Windows/Mac only), requiring account registration, uploading images to servers (privacy concerns), having complex interfaces with unnecessary features, or being expensive. Users need a fast, simple, privacy-respecting tool that works in the browser, supports essential annotation features (arrows, text, shapes, drawing), provides instant downloads, and has an intuitive interface. The Pyramid Tools application currently has various utilities but lacks image annotation capabilities, which would complement existing tools and provide value for users creating visual content.

## Solution Statement

Implement a client-side Screenshot Annotator tool that:
- Accepts image uploads (PNG, JPEG, WebP, GIF) via drag-and-drop or file selector
- Displays uploaded image on a zoomable/pannable canvas for annotation
- Provides annotation tools:
  - Arrow: Draw arrows pointing to specific areas with customizable colors and sizes
  - Text: Add text labels with custom font size, color, and background
  - Rectangle: Draw outlined or filled rectangles for highlighting
  - Circle/Ellipse: Draw outlined or filled circles for emphasis
  - Line: Draw straight lines connecting points
  - Pen/Freehand: Draw freehand lines for custom markup
  - Highlighter: Semi-transparent highlighting for text or areas
- Allows tool customization:
  - Color picker for stroke/fill colors
  - Stroke width selector
  - Opacity/transparency control
  - Font size selector for text
- Supports essential editing features:
  - Undo/Redo for all annotations
  - Select and move/edit existing annotations
  - Delete individual annotations
  - Clear all annotations
  - Layer management (bring to front/send to back)
- Provides download options:
  - Export as PNG (lossless, with transparency support)
  - Export as JPEG (compressed, smaller file size)
  - Custom filename with timestamp
  - Option to download at original resolution or scaled
- Works entirely client-side with no server requests for maximum privacy
- Follows established design patterns from existing tools (PDF tools, converters)
- Includes dark mode support consistent with the rest of the application
- Provides informational section about annotation best practices and use cases
- Responsive design for desktop (optimized for desktop use, mobile support basic)

## Relevant Files

Use these files to implement the feature:

- **app/lib/tools.ts** (lines 10-59) - Tool registry where all tools are defined. Need to add new entry for the Screenshot Annotator with id "screenshot-annotator", name "Screenshot Annotator", description "Mark up and download screenshots instantly", icon "PenTool" or "Edit3" from lucide-react, href "/tools/screenshot-annotator", and category "Image Tools".

- **app/app/page.tsx** - Homepage that displays all tools as cards. Once registered in tools.ts, the Screenshot Annotator will automatically appear. No direct changes needed.

- **app/app/layout.tsx** - Root layout with theme provider. No changes needed, but relevant for understanding app structure and dark mode support.

- **app/components/ui/button.tsx** - Reusable button component with variants. Will be used for upload, download, tool selection, and action buttons.

- **app/components/theme-toggle.tsx** - Theme toggle component to include in the tool page header for consistency.

- **app/lib/utils.ts** - Utility functions including cn() helper for merging Tailwind classes.

- **app/lib/zip-utils.ts** - Contains downloadBlob() utility function for downloading annotated images.

- **app/components/file-upload-zone.tsx** - Reusable drag-and-drop file upload component. Can be referenced for implementing image upload.

- **app/app/tools/heic-to-jpeg/page.tsx** - Reference for image handling tool page structure including file upload, processing, and download patterns.

### New Files

- **app/app/tools/screenshot-annotator/page.tsx** - Main tool page component. Client-side component ("use client") that includes:
  - Image file upload with drag-and-drop support
  - Canvas-based annotation interface
  - Toolbar with annotation tools (arrow, text, rectangle, circle, line, pen, highlighter)
  - Tool customization panel (color picker, stroke width, opacity, font size)
  - Edit controls (undo, redo, delete, clear all)
  - Annotation layer management
  - Real-time canvas preview with annotations
  - Export/download functionality with format selection
  - Reset button to clear and start over
  - Loading states and validation
  - Info section explaining annotation tools and use cases
  - Consistent header with back link and theme toggle
  - Responsive layout optimized for desktop

- **app/types/screenshot-annotator.ts** - TypeScript type definitions including:
  - AnnotationTool type: 'select' | 'arrow' | 'text' | 'rectangle' | 'circle' | 'line' | 'pen' | 'highlighter'
  - AnnotationBase interface: Common properties for all annotations (id, type, color, strokeWidth, opacity)
  - ArrowAnnotation interface: Extends AnnotationBase with start point, end point, arrowhead style
  - TextAnnotation interface: Extends AnnotationBase with x, y, text content, fontSize, fontFamily, background color
  - RectangleAnnotation interface: Extends AnnotationBase with x, y, width, height, filled boolean
  - CircleAnnotation interface: Extends AnnotationBase with x, y, radiusX, radiusY, filled boolean
  - LineAnnotation interface: Extends AnnotationBase with start point, end point
  - PenAnnotation interface: Extends AnnotationBase with points array (freehand path)
  - HighlighterAnnotation interface: Extends AnnotationBase with points array and semi-transparent opacity
  - Annotation union type: All annotation types combined
  - AnnotatorState interface: Current tool, annotations array, selected annotation, canvas dimensions, zoom/pan state
  - ToolConfig interface: Current color, stroke width, opacity, font size, fill/outline settings
  - ExportFormat type: 'png' | 'jpeg' | 'webp'
  - ExportOptions interface: format, quality (for JPEG), scale, includeBackground
  - Constants: MAX_FILE_SIZE, SUPPORTED_FORMATS, DEFAULT_TOOL, DEFAULT_COLOR, DEFAULT_STROKE_WIDTH, ERROR_MESSAGES
  - ProcessingStatus enum: IDLE | LOADING | ANNOTATING | EXPORTING | ERROR

- **app/lib/screenshot-annotator.ts** - Core business logic for annotation and export including:
  - validateImageFile(file: File): Error | null - Validate uploaded image
  - loadImageToCanvas(file: File, canvas: HTMLCanvasElement): Promise<void> - Load image onto canvas
  - drawAnnotation(ctx: CanvasRenderingContext2D, annotation: Annotation): void - Render single annotation
  - drawAllAnnotations(ctx: CanvasRenderingContext2D, annotations: Annotation[]): void - Render all annotations
  - createArrow(ctx, startX, startY, endX, endY, config): void - Draw arrow annotation
  - createText(ctx, x, y, text, config): void - Draw text annotation
  - createRectangle(ctx, x, y, width, height, config): void - Draw rectangle annotation
  - createCircle(ctx, x, y, radiusX, radiusY, config): void - Draw circle/ellipse annotation
  - createLine(ctx, startX, startY, endX, endY, config): void - Draw line annotation
  - drawFreehand(ctx, points, config): void - Draw freehand path
  - exportCanvas(canvas: HTMLCanvasElement, format: ExportFormat, options: ExportOptions): Promise<Blob> - Export canvas to image blob
  - generateFilename(originalName: string, format: ExportFormat): string - Generate download filename with timestamp
  - isPointInAnnotation(annotation: Annotation, x: number, y: number): boolean - Hit detection for selection
  - getAnnotationBounds(annotation: Annotation): { x, y, width, height } - Get bounding box for annotation
  - Helper functions for coordinate transforms, canvas utilities

- **app/components/annotation-toolbar.tsx** - Toolbar component for selecting annotation tools:
  - Tool buttons: Select, Arrow, Text, Rectangle, Circle, Line, Pen, Highlighter
  - Each button shows icon and label
  - Active tool highlighted with border/background
  - Tooltip on hover explaining tool
  - Organized in logical groups (selection, shapes, drawing)
  - Keyboard shortcuts displayed (optional)
  - Responsive layout (vertical on mobile, horizontal on desktop)
  - Dark mode compatible styling

- **app/components/annotation-controls.tsx** - Control panel for customizing annotation properties:
  - Color picker for stroke/fill color
  - Stroke width slider (1-20px)
  - Opacity slider (0-100%)
  - Font size selector (for text tool) (12-72px)
  - Fill/Outline toggle (for shapes)
  - Displays current settings prominently
  - Updates applied to next annotation
  - Can update selected annotation properties
  - Organized in collapsible sections
  - Clean, intuitive interface
  - Dark mode compatible

- **app/components/annotation-canvas.tsx** - Canvas component for displaying and interacting with image:
  - HTML5 canvas element for rendering
  - Image background layer
  - Annotation layer on top
  - Mouse/touch event handlers for drawing
  - Real-time preview while drawing
  - Grid/guides overlay (optional)
  - Zoom controls (zoom in, zoom out, fit to screen)
  - Pan functionality (drag canvas to move view)
  - Cursor changes based on active tool
  - Selection handles for editing annotations
  - Canvas auto-sizing based on container
  - Responsive to window resizing
  - Performance optimized for smooth drawing

## Implementation Plan

### Phase 1: Foundation

1. Research HTML5 Canvas API for drawing operations (2D context, paths, transformations)
2. Research annotation libraries (Fabric.js, Konva.js) and decide whether to use native Canvas or library
3. Create TypeScript type definitions for annotation tools, state, and configuration
4. Define constants for validation rules, default values, and error messages
5. Set up basic file structure for the Screenshot Annotator tool
6. Create component skeletons (toolbar, controls, canvas)
7. Implement image upload and loading functionality

### Phase 2: Core Implementation

1. Implement core Canvas rendering logic in lib/screenshot-annotator.ts:
   - Canvas initialization and image loading
   - Basic drawing primitives (lines, shapes, text)
   - Annotation rendering functions for each tool type
   - Canvas-to-blob export functionality
2. Build the annotation canvas component with mouse/touch event handling
3. Implement drawing logic for each tool:
   - Arrow with arrowhead
   - Text with background
   - Rectangle (outline and filled)
   - Circle/Ellipse
   - Straight line
   - Freehand pen
   - Semi-transparent highlighter
4. Create the annotation toolbar component with tool selection
5. Build the controls panel component for customization
6. Implement undo/redo functionality using annotation history stack
7. Add annotation selection and editing (move, resize, delete)
8. Implement export functionality with format options
9. Add filename generation with timestamp

### Phase 3: Integration

1. Register the tool in lib/tools.ts so it appears on the homepage
2. Build the main tool page integrating all components
3. Implement state management for annotations, tool selection, and configuration
4. Add comprehensive error handling and validation
5. Implement loading states and user feedback
6. Ensure dark mode compatibility for all UI elements
7. Test responsive layout (optimized for desktop, basic mobile support)
8. Add informational content about annotation tools and best practices
9. Performance optimization (canvas rendering, event throttling)
10. Test with various image types and sizes

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Research Canvas API and Architecture Decisions

- Review HTML5 Canvas 2D API documentation (drawing primitives, paths, text, images)
- Research annotation UX patterns (toolbar position, tool selection, color pickers)
- Evaluate whether to use native Canvas API or library (Fabric.js, Konva.js):
  - Native Canvas: Lighter weight, more control, simpler for basic annotations
  - Fabric.js: Object-oriented canvas, built-in selection/manipulation
  - Konva.js: Similar to Fabric, good performance
  - **Decision**: Start with native Canvas API for simplicity and control
- Document key Canvas APIs needed:
  - `ctx.drawImage()` for background
  - `ctx.beginPath()`, `ctx.lineTo()`, `ctx.stroke()` for drawing
  - `ctx.fillText()`, `ctx.strokeText()` for text
  - `ctx.arc()`, `ctx.ellipse()` for circles
  - `ctx.fillRect()`, `ctx.strokeRect()` for rectangles
  - `canvas.toBlob()` for export

### 2. Create Type Definitions File

- Create `app/types/screenshot-annotator.ts`
- Define `AnnotationTool` type:
  ```typescript
  type AnnotationTool = 'select' | 'arrow' | 'text' | 'rectangle' | 'circle' | 'line' | 'pen' | 'highlighter';
  ```
- Define `ProcessingStatus` enum:
  ```typescript
  enum ProcessingStatus { IDLE, LOADING, ANNOTATING, EXPORTING, ERROR }
  ```
- Define `Point` interface: `{ x: number; y: number }`
- Define `AnnotationBase` interface:
  ```typescript
  interface AnnotationBase {
    id: string;
    type: AnnotationTool;
    color: string;
    strokeWidth: number;
    opacity: number;
  }
  ```
- Define specific annotation interfaces extending AnnotationBase:
  - `ArrowAnnotation`: start: Point, end: Point
  - `TextAnnotation`: x: number, y: number, text: string, fontSize: number, fontFamily: string, backgroundColor?: string
  - `RectangleAnnotation`: x: number, y: number, width: number, height: number, filled: boolean
  - `CircleAnnotation`: x: number, y: number, radiusX: number, radiusY: number, filled: boolean
  - `LineAnnotation`: start: Point, end: Point
  - `PenAnnotation`: points: Point[]
  - `HighlighterAnnotation`: points: Point[] (with semi-transparent opacity)
- Define `Annotation` union type combining all annotation types
- Define `ToolConfig` interface:
  ```typescript
  interface ToolConfig {
    color: string;
    strokeWidth: number;
    opacity: number;
    fontSize: number;
    fontFamily: string;
    filled: boolean; // for shapes
  }
  ```
- Define `AnnotatorState` interface:
  ```typescript
  interface AnnotatorState {
    imageFile: File | null;
    imageUrl: string | null;
    currentTool: AnnotationTool;
    annotations: Annotation[];
    history: Annotation[][]; // for undo/redo
    historyIndex: number;
    selectedAnnotationId: string | null;
    config: ToolConfig;
    status: ProcessingStatus;
    error: string | null;
  }
  ```
- Define `ExportFormat` type: `'png' | 'jpeg' | 'webp'`
- Define `ExportOptions` interface:
  ```typescript
  interface ExportOptions {
    format: ExportFormat;
    quality?: number; // 0-1 for JPEG/WebP
    scale?: number; // scaling factor
  }
  ```
- Define constants:
  ```typescript
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  const DEFAULT_TOOL: AnnotationTool = 'select';
  const DEFAULT_COLOR = '#FF0000'; // Red
  const DEFAULT_STROKE_WIDTH = 3;
  const DEFAULT_OPACITY = 1;
  const DEFAULT_FONT_SIZE = 16;
  const ERROR_MESSAGES = {
    INVALID_FILE_TYPE: 'Please upload a valid image file (PNG, JPEG, WebP, GIF)',
    FILE_TOO_LARGE: 'Image size exceeds 10MB limit',
    LOAD_FAILED: 'Failed to load image',
    EXPORT_FAILED: 'Failed to export annotated image',
  };
  ```
- Export all types, interfaces, and constants

### 3. Create Image Validation and Loading Utilities

- Create `app/lib/screenshot-annotator.ts`
- Import types from `types/screenshot-annotator.ts`
- Implement `validateImageFile(file: File): Error | null`:
  ```typescript
  - Check file size against MAX_FILE_SIZE
  - Verify file type is in SUPPORTED_FORMATS
  - Return null if valid, Error object with message if invalid
  ```
- Implement `loadImageToCanvas(file: File): Promise<HTMLImageElement>`:
  ```typescript
  - Create FileReader to read file as data URL
  - Create new Image() element
  - Set image.src to data URL
  - Return promise that resolves when image loads
  - Handle errors (corrupted image, unsupported format)
  ```
- Implement `generateFilename(originalName: string, format: ExportFormat): string`:
  ```typescript
  - Remove extension from original filename
  - Add 'annotated-' prefix
  - Append timestamp: YYYYMMDD-HHMMSS
  - Add format extension
  - Return formatted filename
  - Example: "screenshot.png" → "annotated-screenshot-20250104-143022.png"
  ```
- Add JSDoc comments explaining each function
- Export all functions

### 4. Create Canvas Drawing Utility Functions

- In `app/lib/screenshot-annotator.ts`, implement drawing functions:
- Implement `drawArrow(ctx: CanvasRenderingContext2D, start: Point, end: Point, config: ToolConfig)`:
  ```typescript
  - Draw line from start to end
  - Calculate angle and arrowhead points
  - Draw arrowhead triangle at end point
  - Apply color, strokeWidth, opacity from config
  ```
- Implement `drawText(ctx: CanvasRenderingContext2D, annotation: TextAnnotation)`:
  ```typescript
  - Set font: `${fontSize}px ${fontFamily}`
  - Measure text width for background
  - Draw background rectangle (if backgroundColor set)
  - Draw text with fillText or strokeText
  - Apply color, opacity from config
  ```
- Implement `drawRectangle(ctx: CanvasRenderingContext2D, annotation: RectangleAnnotation)`:
  ```typescript
  - Use fillRect for filled, strokeRect for outline
  - Apply color, strokeWidth, opacity
  ```
- Implement `drawCircle(ctx: CanvasRenderingContext2D, annotation: CircleAnnotation)`:
  ```typescript
  - Use ctx.ellipse() for circle/ellipse
  - Fill or stroke based on filled property
  - Apply color, strokeWidth, opacity
  ```
- Implement `drawLine(ctx: CanvasRenderingContext2D, annotation: LineAnnotation)`:
  ```typescript
  - Use ctx.moveTo() and ctx.lineTo()
  - Apply color, strokeWidth, opacity
  ```
- Implement `drawPen(ctx: CanvasRenderingContext2D, annotation: PenAnnotation)`:
  ```typescript
  - Iterate through points array
  - Use quadratic curves for smooth freehand
  - Apply color, strokeWidth, opacity
  ```
- Implement `drawHighlighter(ctx: CanvasRenderingContext2D, annotation: HighlighterAnnotation)`:
  ```typescript
  - Similar to pen but with semi-transparent opacity (0.3-0.5)
  - Thicker stroke width
  - Bright colors (yellow, green, pink)
  ```
- Implement `drawAnnotation(ctx: CanvasRenderingContext2D, annotation: Annotation)`:
  ```typescript
  - Switch on annotation.type
  - Call appropriate draw function
  - Restore context state after drawing
  ```
- Implement `drawAllAnnotations(ctx: CanvasRenderingContext2D, annotations: Annotation[])`:
  ```typescript
  - Loop through annotations array
  - Call drawAnnotation for each
  - Maintain proper layering order
  ```
- Add helper function `applyStyleConfig(ctx: CanvasRenderingContext2D, config: ToolConfig)`:
  ```typescript
  - Set ctx.strokeStyle = config.color
  - Set ctx.lineWidth = config.strokeWidth
  - Set ctx.globalAlpha = config.opacity
  - Set ctx.lineCap = 'round', ctx.lineJoin = 'round' for smooth lines
  ```

### 5. Create Export Functionality

- In `app/lib/screenshot-annotator.ts`, implement export functions:
- Implement `exportCanvas(canvas: HTMLCanvasElement, options: ExportOptions): Promise<Blob>`:
  ```typescript
  - Use canvas.toBlob() with specified format
  - For PNG: canvas.toBlob(callback, 'image/png')
  - For JPEG: canvas.toBlob(callback, 'image/jpeg', quality)
  - For WebP: canvas.toBlob(callback, 'image/webp', quality)
  - Return promise resolving to Blob
  - Handle errors if format not supported
  ```
- Implement `downloadAnnotatedImage(canvas: HTMLCanvasElement, filename: string, options: ExportOptions)`:
  ```typescript
  - Call exportCanvas to get blob
  - Use downloadBlob utility from lib/zip-utils.ts
  - Pass filename and blob
  - Handle errors and provide user feedback
  ```
- Add format validation to ensure browser support
- Consider adding scale option for hi-res export (2x, 3x)

### 6. Create Annotation Toolbar Component

- Create `app/components/annotation-toolbar.tsx`
- Make it a client component ("use client")
- Define props interface:
  ```typescript
  interface AnnotationToolbarProps {
    currentTool: AnnotationTool;
    onToolChange: (tool: AnnotationTool) => void;
    disabled?: boolean;
  }
  ```
- Import icons from lucide-react:
  - MousePointer (Select)
  - ArrowRight (Arrow)
  - Type (Text)
  - Square (Rectangle)
  - Circle (Circle)
  - Minus (Line)
  - Pen (Pen)
  - Highlighter (Highlighter)
- Create tool definitions array:
  ```typescript
  const tools: { id: AnnotationTool; icon: Icon; label: string; shortcut?: string }[] = [
    { id: 'select', icon: MousePointer, label: 'Select', shortcut: 'V' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow', shortcut: 'A' },
    { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
    { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
    { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
    { id: 'pen', icon: Pen, label: 'Pen', shortcut: 'P' },
    { id: 'highlighter', icon: Highlighter, label: 'Highlighter', shortcut: 'H' },
  ];
  ```
- Render toolbar:
  - Use flex layout (horizontal on desktop, vertical on mobile)
  - Map over tools array to create buttons
  - Use Button component with variant="outline"
  - Highlight active tool with different variant or border
  - Show icon and label
  - Display tooltip on hover with tool name and shortcut
  - Disable all buttons if disabled prop is true
- Style with Tailwind classes:
  - `flex gap-2 flex-wrap` for container
  - `w-12 h-12` for icon buttons (desktop)
  - `hover:bg-accent` for hover effect
  - `border-2 border-primary` for active tool
  - Dark mode compatible colors
- Export component

### 7. Create Annotation Controls Component

- Create `app/components/annotation-controls.tsx`
- Make it a client component ("use client")
- Define props interface:
  ```typescript
  interface AnnotationControlsProps {
    config: ToolConfig;
    onConfigChange: (updates: Partial<ToolConfig>) => void;
    currentTool: AnnotationTool;
    disabled?: boolean;
  }
  ```
- Import necessary components:
  - Input (for color picker)
  - Slider or range input for stroke width, opacity, font size
  - Toggle or Switch for filled/outline
- Implement controls:
  1. **Color Picker**:
     - HTML input type="color"
     - Display current color as preview swatch
     - Label: "Color"
     - onChange calls onConfigChange({ color: value })
  2. **Stroke Width Slider**:
     - Range: 1-20px
     - Display current value
     - Label: "Stroke Width"
     - onChange calls onConfigChange({ strokeWidth: value })
  3. **Opacity Slider**:
     - Range: 0-100% (or 0-1)
     - Display current percentage
     - Label: "Opacity"
     - onChange calls onConfigChange({ opacity: value / 100 })
  4. **Font Size Selector** (visible when tool is 'text'):
     - Dropdown or slider: 12-72px
     - Label: "Font Size"
     - onChange calls onConfigChange({ fontSize: value })
  5. **Fill Toggle** (visible when tool is 'rectangle' or 'circle'):
     - Checkbox or toggle switch
     - Label: "Fill Shape"
     - onChange calls onConfigChange({ filled: checked })
- Layout:
  - Grid or flex layout
  - Collapsible sections (optional)
  - Responsive: stack vertically on mobile
- Style with Tailwind:
  - Consistent spacing and borders
  - Card-style background
  - Dark mode compatible
- Conditional rendering based on currentTool (e.g., only show font size for text tool)
- Export component

### 8. Create Annotation Canvas Component

- Create `app/components/annotation-canvas.tsx`
- Make it a client component ("use client")
- Define props interface:
  ```typescript
  interface AnnotationCanvasProps {
    imageUrl: string | null;
    annotations: Annotation[];
    currentTool: AnnotationTool;
    config: ToolConfig;
    onAnnotationAdd: (annotation: Annotation) => void;
    onAnnotationUpdate: (id: string, updates: Partial<Annotation>) => void;
    onAnnotationSelect: (id: string | null) => void;
    selectedAnnotationId: string | null;
    canvasRef: React.RefObject<HTMLCanvasElement>;
  }
  ```
- Use refs:
  - canvasRef (passed as prop for export)
  - containerRef for sizing
  - imageRef to cache loaded image
- State:
  - isDrawing: boolean
  - drawingAnnotation: Partial<Annotation> | null (for preview while drawing)
  - cursorPosition: Point | null
- Implement useEffect to load and draw image:
  ```typescript
  - When imageUrl changes, load image
  - Set canvas size to match image dimensions
  - Draw image as background
  - Redraw when annotations change
  ```
- Implement drawing lifecycle handlers:
  - `handleMouseDown(e)`:
    - Get mouse position on canvas
    - Start new annotation based on currentTool
    - Set isDrawing = true
    - For text tool, prompt for text input (modal or inline)
  - `handleMouseMove(e)`:
    - If not isDrawing, return
    - Update drawingAnnotation based on mouse position
    - Redraw canvas with preview
  - `handleMouseUp(e)`:
    - Finalize annotation
    - Generate unique ID (uuid or timestamp)
    - Call onAnnotationAdd with completed annotation
    - Set isDrawing = false
    - Clear drawingAnnotation
- Implement rendering function:
  ```typescript
  const redrawCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    if (imageRef.current) {
      ctx.drawImage(imageRef.current, 0, 0);
    }

    // Draw all annotations
    drawAllAnnotations(ctx, annotations);

    // Draw preview annotation (while drawing)
    if (drawingAnnotation) {
      drawAnnotation(ctx, drawingAnnotation as Annotation);
    }

    // Draw selection handles (if annotation selected)
    if (selectedAnnotationId) {
      drawSelectionHandles(ctx, selectedAnnotation);
    }
  };
  ```
- Handle canvas resizing:
  - Maintain aspect ratio of image
  - Fit canvas to container
  - Update on window resize (debounced)
- Cursor styling based on tool:
  - Select: default cursor
  - Drawing tools: crosshair cursor
  - Text: text cursor
- Touch support for mobile:
  - Handle touchstart, touchmove, touchend
  - Convert touch coordinates to canvas coordinates
- Style canvas:
  - Border around canvas
  - Max width/height to fit container
  - Centered in container
  - Dark mode: border color adapts
- Export component

### 9. Implement Undo/Redo Functionality

- In the main page component (to be created), implement history management:
- State for history:
  ```typescript
  const [history, setHistory] = useState<Annotation[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  ```
- Function `addToHistory(annotations: Annotation[])`:
  ```typescript
  - Create new history entry
  - Trim history after current index (clear "redo" history)
  - Add new snapshot
  - Limit history size (e.g., max 50 states)
  - Update historyIndex
  ```
- Function `handleUndo()`:
  ```typescript
  - Check if historyIndex > 0
  - Decrement historyIndex
  - Set annotations to history[historyIndex]
  ```
- Function `handleRedo()`:
  ```typescript
  - Check if historyIndex < history.length - 1
  - Increment historyIndex
  - Set annotations to history[historyIndex]
  ```
- Trigger addToHistory whenever annotation is added, updated, or deleted
- Add undo/redo buttons in UI (keyboard shortcuts: Ctrl+Z, Ctrl+Shift+Z or Ctrl+Y)
- Disable undo button when at start of history
- Disable redo button when at end of history

### 10. Implement Annotation Selection and Editing

- In canvas component, implement selection mode:
- Function `isPointInAnnotation(annotation: Annotation, point: Point): boolean`:
  ```typescript
  - Check if click point is inside annotation bounds
  - For arrow/line: check distance from line segment
  - For text: check bounding box
  - For shapes: check if point inside shape
  - For pen/highlighter: check proximity to path
  - Return true if within tolerance
  ```
- In handleMouseDown when tool is 'select':
  ```typescript
  - Iterate through annotations (reverse order for top-first)
  - Check if click point is in annotation
  - If found, call onAnnotationSelect(annotation.id)
  - If not found, deselect (onAnnotationSelect(null))
  ```
- When annotation selected:
  - Draw selection handles (small squares at corners/edges)
  - Allow dragging to move annotation
  - Allow dragging handles to resize/reshape
  - Show delete button or allow Delete key to remove
- Implement `handleAnnotationDelete(id: string)`:
  ```typescript
  - Filter out annotation from annotations array
  - Add to history
  - Deselect
  ```
- Keyboard shortcuts:
  - Delete key: delete selected annotation
  - Escape key: deselect

### 11. Create Main Screenshot Annotator Page Structure

- Create `app/app/tools/screenshot-annotator/page.tsx`
- Add "use client" directive at the top
- Import dependencies:
  - React hooks: useState, useCallback, useEffect, useRef
  - Next.js Link
  - Icons: ArrowLeft, Upload, Download, RotateCcw, Undo, Redo, Trash2 from lucide-react
  - Button component
  - ThemeToggle
  - AnnotationToolbar
  - AnnotationControls
  - AnnotationCanvas
  - Types from types/screenshot-annotator.ts
  - Utilities from lib/screenshot-annotator.ts
  - downloadBlob from lib/zip-utils.ts
- Initialize state:
  ```typescript
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentTool, setCurrentTool] = useState<AnnotationTool>('select');
  const [toolConfig, setToolConfig] = useState<ToolConfig>({
    color: DEFAULT_COLOR,
    strokeWidth: DEFAULT_STROKE_WIDTH,
    opacity: DEFAULT_OPACITY,
    fontSize: DEFAULT_FONT_SIZE,
    fontFamily: 'Arial',
    filled: false,
  });
  const [history, setHistory] = useState<Annotation[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  ```
- Define handler functions (will implement in next steps)
- Create JSX structure following standard tool page template
- Export default component

### 12. Implement File Upload Handlers

- Implement `handleFileSelected(file: File)`:
  ```typescript
  - Validate file using validateImageFile
  - If invalid, set error and return
  - Set status to LOADING
  - Clear previous state (annotations, history, selected)
  - Create object URL for image
  - Set imageFile and imageUrl
  - Set status to ANNOTATING
  - Clear error
  ```
- Implement drag-and-drop handlers:
  ```typescript
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelected(file);
  };
  ```
- Implement file input handler:
  ```typescript
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
    e.target.value = ''; // Reset for re-selection
  };
  ```
- Show loading indicator while image loads
- Display error message if validation fails

### 13. Implement Annotation Management

- Implement `handleAnnotationAdd(annotation: Annotation)`:
  ```typescript
  - Add annotation to annotations array
  - Add current state to history
  - Update historyIndex
  ```
- Implement `handleAnnotationUpdate(id: string, updates: Partial<Annotation>)`:
  ```typescript
  - Find annotation by id
  - Merge updates
  - Update annotations array
  - Add to history
  ```
- Implement `handleAnnotationDelete(id: string)`:
  ```typescript
  - Filter out annotation from array
  - Add to history
  - Deselect if deleted annotation was selected
  ```
- Implement `handleClearAll()`:
  ```typescript
  - Confirm with user (optional)
  - Clear annotations array
  - Add to history
  - Deselect
  ```
- All annotation changes should call addToHistory

### 14. Implement Export and Download

- Implement `handleExport(format: ExportFormat)`:
  ```typescript
  - Get canvas reference
  - Set status to EXPORTING
  - Call exportCanvas with format and quality options
  - Generate filename with timestamp
  - Call downloadBlob with blob and filename
  - Set status back to ANNOTATING
  - Show success message (optional)
  - Handle errors (show error message)
  ```
- Implement format selector:
  - Radio buttons or dropdown for PNG/JPEG/WebP
  - Default: PNG
  - Show quality slider for JPEG (optional)
- Add download button:
  - Disabled if no image loaded
  - Shows loading state during export
  - Triggers handleExport on click

### 15. Implement Reset Functionality

- Implement `handleReset()`:
  ```typescript
  - Confirm if annotations exist (optional)
  - Revoke object URL to free memory
  - Clear imageFile and imageUrl
  - Clear annotations
  - Reset history
  - Reset historyIndex
  - Deselect
  - Reset tool to 'select'
  - Reset config to defaults
  - Set status to IDLE
  - Clear error
  ```
- Add reset button:
  - Always visible when image loaded
  - Shows confirmation dialog if annotations exist
  - Returns to upload state

### 16. Build Page Layout and UI

- Create page structure:
  ```tsx
  <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
    {/* Theme toggle */}
    <div className="fixed top-4 right-4 z-50">
      <ThemeToggle />
    </div>

    <main className="container mx-auto px-4 py-16 max-w-7xl">
      {/* Header */}
      <div className="mb-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
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
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleRedo}
                    disabled={historyIndex === history.length - 1}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={() => handleAnnotationDelete(selectedAnnotationId!)}
                  disabled={!selectedAnnotationId}
                  variant="outline"
                  size="sm"
                  className="w-full"
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
                    Download PNG
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
                <li><strong>Select</strong>: Click annotations to select, move, or delete them</li>
                <li><strong>Arrow</strong>: Draw arrows to point to important areas</li>
                <li><strong>Text</strong>: Add text labels with customizable size and color</li>
                <li><strong>Rectangle</strong>: Draw rectangles to highlight regions</li>
                <li><strong>Circle</strong>: Draw circles or ellipses for emphasis</li>
                <li><strong>Line</strong>: Draw straight lines</li>
                <li><strong>Pen</strong>: Draw freehand for custom markup</li>
                <li><strong>Highlighter</strong>: Semi-transparent highlighting</li>
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
                <li>Press Ctrl+Z to undo, Ctrl+Y to redo</li>
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
  ```

### 17. Register Tool in Tools Registry

- Open `app/lib/tools.ts`
- Add new entry to tools array:
  ```typescript
  {
    id: "screenshot-annotator",
    name: "Screenshot Annotator",
    description: "Mark up and download screenshots instantly",
    icon: "PenTool", // or "Edit3"
    href: "/tools/screenshot-annotator",
    category: "Image Tools",
  }
  ```
- Verify icon is available in lucide-react
- Position appropriately in array (near other image tools if any)
- Save file

### 18. Implement Keyboard Shortcuts

- Add useEffect for keyboard event listeners:
  ```typescript
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tool shortcuts
      if (e.key === 'v') setCurrentTool('select');
      if (e.key === 'a') setCurrentTool('arrow');
      if (e.key === 't') setCurrentTool('text');
      if (e.key === 'r') setCurrentTool('rectangle');
      if (e.key === 'c') setCurrentTool('circle');
      if (e.key === 'l') setCurrentTool('line');
      if (e.key === 'p') setCurrentTool('pen');
      if (e.key === 'h') setCurrentTool('highlighter');

      // Undo/Redo
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }

      // Delete
      if (e.key === 'Delete' && selectedAnnotationId) {
        handleAnnotationDelete(selectedAnnotationId);
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedAnnotationId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTool, selectedAnnotationId, history, historyIndex]);
  ```
- Display shortcuts in UI (tooltips or help section)

### 19. Style and Polish the UI

- Ensure consistent spacing using Tailwind utilities
- Apply typography hierarchy:
  - Main title: text-4xl font-bold
  - Section headings: text-lg font-semibold
  - Labels: text-sm font-medium
  - Body text: text-sm text-muted-foreground
- Add proper shadows and borders:
  - Cards: border border-border rounded-lg
  - Canvas: border-2 border-border
- Ensure all interactive elements have hover/focus states:
  - Buttons: hover:bg-primary/90 focus:ring-2
  - Tool buttons: hover:bg-accent transition-colors
- Verify dark mode styles:
  - Test all backgrounds, text, borders
  - Canvas border visible in dark mode
  - Annotations visible against dark UI
- Responsive layout:
  - Stack vertically on mobile (<1024px)
  - Side-by-side on desktop (>=1024px)
  - Toolbar vertical on mobile, grid on desktop
- Add smooth transitions for tool switching
- Loading states: show spinner during image load and export
- Disabled states: reduce opacity, show cursor not-allowed

### 20. Optimize Performance

- Throttle canvas redraws to avoid excessive rendering
- Use requestAnimationFrame for smooth drawing animations
- Debounce resize handlers (window resize)
- Optimize canvas clearing (only redraw changed areas if possible)
- Use canvas offscreen buffers for complex operations (optional)
- Monitor memory usage:
  - Revoke object URLs when no longer needed
  - Clear large data structures on reset
- Test with large images (4K resolution)
- Test with many annotations (50+ annotations)
- Ensure smooth interactions with no lag
- Profile with React DevTools and Chrome Performance tab

### 21. Test Basic Functionality

- Test image upload:
  - Drag and drop PNG image
  - Click to select JPEG image
  - Try uploading non-image file (should show error)
  - Try uploading image >10MB (should show error)
- Test annotation tools:
  - Draw arrow from one point to another
  - Add text annotation with custom text
  - Draw rectangle (outline and filled)
  - Draw circle
  - Draw straight line
  - Draw freehand with pen
  - Draw with highlighter (semi-transparent)
- Verify annotations appear on canvas
- Verify each tool uses current config (color, stroke width)

### 22. Test Tool Configuration

- Change color and verify next annotation uses new color
- Adjust stroke width and verify thicker/thinner lines
- Adjust opacity and verify semi-transparent annotations
- For text tool: change font size and verify larger text
- For shapes: toggle fill and verify filled vs. outlined
- Verify config persists when switching between tools
- Test with extreme values (very thick stroke, very large text)

### 23. Test Undo/Redo Functionality

- Add 3-4 annotations
- Click Undo button - verify last annotation removed
- Click Undo multiple times - verify annotations removed in reverse order
- Click Redo button - verify annotation reappears
- Add new annotation after undo - verify redo history cleared
- Test keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z or Ctrl+Y (redo)
- Verify undo/redo buttons disabled at history boundaries

### 24. Test Selection and Editing

- Add several annotations
- Switch to Select tool
- Click annotation - verify it becomes selected (highlight or handles shown)
- Drag selected annotation - verify it moves
- Press Delete key - verify selected annotation removed
- Click empty area - verify selection cleared
- Test selecting different annotation types (arrow, text, shapes, pen)
- Verify only one annotation selected at a time

### 25. Test Export and Download

- Annotate an image with multiple annotations
- Click "Download PNG" button:
  - Verify PNG file downloads
  - Verify filename includes timestamp
  - Open downloaded image - verify annotations are rendered correctly
- Click "Download JPEG" button:
  - Verify JPEG file downloads
  - Verify quality is acceptable
  - Verify filename correct
- Test export with no annotations (should still work, download original image)
- Test export with many annotations (50+)
- Verify downloaded image resolution matches original

### 26. Test Reset Functionality

- Upload image and add annotations
- Click "Start Over" button
- Verify confirmation if annotations exist (optional)
- Verify returns to upload state
- Verify annotations cleared
- Verify history cleared
- Verify can upload new image and start fresh

### 27. Test Dark Mode

- Toggle dark mode using theme toggle
- Verify all UI elements visible and styled:
  - Page background
  - Card backgrounds and borders
  - Text colors (headings, labels, body)
  - Canvas border visible
  - Toolbar buttons visible
  - Control inputs styled correctly
  - Buttons styled correctly
  - Error messages readable
- Verify canvas annotations visible against dark UI
- Switch between light and dark multiple times
- Verify no visual glitches

### 28. Test Responsive Layout

- Test on mobile viewport (375px):
  - Toolbar stacks vertically or wraps
  - Controls panel stacks below canvas
  - Canvas fits viewport width
  - All buttons accessible
  - Text readable
  - Touch interactions work (optional, if implemented)
- Test on tablet (768px):
  - Layout adjusts appropriately
  - Canvas and controls positioned well
- Test on desktop (1920px):
  - Side-by-side layout (canvas left, controls right)
  - Canvas scales to fit
  - Controls panel fixed width
  - Good use of space
- Test landscape mobile orientation
- Resize browser window dynamically - verify responsive behavior

### 29. Test Keyboard Accessibility

- Tab through all interactive elements:
  - File input button
  - Back link
  - Theme toggle
  - Tool buttons
  - Control inputs (color, sliders)
  - Action buttons (undo, redo, delete, clear, download, reset)
- Verify visible focus indicators (focus ring)
- Verify tab order is logical
- Test keyboard shortcuts:
  - V, A, T, R, C, L, P, H for tools
  - Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y for undo/redo
  - Delete for deleting selected annotation
  - Escape for deselecting
- Verify no keyboard traps

### 30. Test Error Handling

- Upload invalid file (non-image) - verify clear error message
- Upload oversized file (>10MB) - verify file size error
- Upload corrupted image - verify load error handled gracefully
- Test with unsupported export format (if applicable)
- Verify error messages are user-friendly and actionable
- Verify errors clear when valid action taken

### 31. Test Integration and Navigation

- Navigate to homepage (/)
- Verify "Screenshot Annotator" tool card appears
- Verify card has:
  - Title: "Screenshot Annotator"
  - Description: "Mark up and download screenshots instantly"
  - PenTool or Edit3 icon
  - Category: "Image Tools"
- Verify hover effects on card
- Click card - verify navigates to /tools/screenshot-annotator
- Verify page loads correctly
- Test back navigation:
  - Click "Back to Tools" link
  - Verify returns to homepage
  - Verify homepage displays correctly
- Test theme persistence across navigation
- Test browser back/forward buttons

### 32. Code Quality Review

- Run ESLint: `cd app && npm run lint`
  - Fix all errors
  - Fix all warnings
- Check TypeScript compilation
  - Verify no type errors
  - Verify no implicit any
- Review code for:
  - Proper TypeScript types (no any unless necessary)
  - Consistent formatting
  - Meaningful variable/function names
  - JSDoc comments on utility functions
  - No console.log statements (except intentional logging)
  - No unused imports/variables
  - No commented-out code
  - No TODOs or FIXMEs
- Ensure error handling in all async operations
- Verify proper cleanup (event listeners, object URLs)

### 33. Final Build and Validation

- Run `cd app && npm run lint`:
  - Verify zero errors and zero warnings
- Run `cd app && npm run build`:
  - Verify successful build
  - Check for any TypeScript errors
  - Verify exit code 0
- Run `cd app && npm run dev`:
  - Start development server
  - Navigate to http://localhost:3050
  - Perform comprehensive end-to-end test:
    - Homepage loads
    - Screenshot Annotator card visible
    - Click and navigate to tool
    - Upload a screenshot
    - Add arrow annotation pointing to something
    - Add text annotation with label
    - Draw rectangle around area
    - Add circle
    - Draw freehand with pen
    - Change colors and stroke widths
    - Test undo/redo
    - Select annotation and move it
    - Delete annotation
    - Download as PNG
    - Open downloaded file - verify annotations rendered correctly
    - Reset and start over
    - Test dark mode toggle
    - Verify all UI elements visible in dark mode
    - Navigate back to homepage
    - Test other tools (no regressions)
  - Verify no console errors or warnings
- Stop dev server

## Testing Strategy

### Unit Tests

Due to the client-side nature and current absence of a testing framework, formal unit tests are not included. If testing framework added in future, consider testing:

- **validateImageFile()**: Valid image, invalid type, oversized file
- **generateFilename()**: Various inputs, special characters, timestamp format
- **Drawing functions**: Each annotation type renders correctly with config
- **isPointInAnnotation()**: Hit detection for each annotation type
- **Export functions**: Canvas to blob conversion for each format

### Integration Tests

Manual integration tests to perform:

- **Upload to canvas integration**: Image loads and displays on canvas
- **Tool to annotation integration**: Selected tool creates correct annotation type
- **Config to annotation integration**: Annotations use current config settings
- **Annotation to canvas integration**: Annotations render correctly on canvas
- **Export integration**: Downloaded file contains rendered annotations
- **History integration**: Undo/redo affects annotations correctly
- **Selection integration**: Selection mode allows editing annotations
- **Reset integration**: Reset clears all state and returns to upload

### Edge Cases

- **Empty or invalid inputs**:
  - No image uploaded (upload section shown)
  - Invalid file type (error message)
  - Corrupted image (load error handled)
  - No annotations (export still works, downloads original)
- **Boundary conditions**:
  - Very small image (1x1px)
  - Very large image (8K resolution, 10MB)
  - Maximum file size (10MB)
  - Many annotations (100+, test performance)
  - Very long text annotation (wrapping, truncation)
- **Annotation edge cases**:
  - Arrow with same start/end point (zero-length)
  - Rectangle with zero width/height (dot)
  - Circle with zero radius (dot)
  - Pen annotation with single point (dot)
  - Text annotation with empty string (not added or placeholder shown)
- **Tool switching**:
  - Switch tools mid-drawing (cancel current annotation)
  - Switch tools rapidly (no state corruption)
- **Selection edge cases**:
  - Select annotation at canvas edge
  - Move annotation partially off canvas
  - Delete while drawing (no errors)
- **Export edge cases**:
  - Export immediately after upload (no annotations)
  - Export with one annotation
  - Export with many annotations
  - Export multiple times (repeated downloads)
  - Export with transparency (PNG vs JPEG)
- **Performance edge cases**:
  - Rapid drawing (many pen strokes)
  - Rapid undo/redo clicks
  - Canvas resize during annotation
  - Switch tabs during drawing (state preservation)

## Acceptance Criteria

1. **Tool Visibility**:
   - Screenshot Annotator appears on homepage with correct title, description, and icon
   - Tool accessible via /tools/screenshot-annotator
   - Tool card follows design patterns of other tools
   - Tool grouped in "Image Tools" category

2. **Image Upload**:
   - Accepts images via drag-and-drop
   - Accepts images via file picker
   - Validates file type (PNG, JPEG, WebP, GIF)
   - Validates file size (max 10MB)
   - Shows error for invalid files
   - Displays image on canvas after upload
   - Replaces previous image if new one uploaded

3. **Annotation Tools Available**:
   - Select tool for editing annotations
   - Arrow tool for drawing arrows
   - Text tool for adding text labels
   - Rectangle tool for drawing rectangles
   - Circle tool for drawing circles/ellipses
   - Line tool for drawing straight lines
   - Pen tool for freehand drawing
   - Highlighter tool for semi-transparent highlighting
   - All tools clearly labeled with icons
   - Active tool visually highlighted

4. **Tool Configuration**:
   - Color picker changes annotation color
   - Stroke width slider adjusts line thickness
   - Opacity slider controls transparency
   - Font size selector for text tool
   - Fill toggle for shapes (outline vs. filled)
   - Configuration persists when switching compatible tools
   - Configuration applies to new annotations

5. **Annotation Creation**:
   - Click and drag to create annotations
   - Real-time preview while drawing
   - Annotations rendered on canvas
   - Annotations use current config (color, stroke, opacity)
   - Text tool prompts for text input
   - Pen tool follows mouse smoothly
   - Annotations layered in creation order

6. **Annotation Editing**:
   - Select tool allows clicking annotations
   - Selected annotation highlighted with handles
   - Drag to move selected annotation
   - Delete key or button removes selected annotation
   - Undo button reverts last change
   - Redo button reapplies undone change
   - Clear all button removes all annotations
   - History tracks all changes

7. **Export and Download**:
   - Download as PNG (lossless)
   - Download as JPEG (compressed)
   - Filename includes original name and timestamp
   - Downloaded image contains all annotations
   - Annotations rendered at correct positions
   - Export works with no annotations (original image)
   - Export works with many annotations

8. **User Interface**:
   - Clean, intuitive layout
   - Toolbar and controls easily accessible
   - Canvas prominently displayed
   - Action buttons clearly labeled
   - Loading states during operations
   - Error messages displayed clearly
   - Informational section explains tools and use cases
   - Privacy note prominently displayed

9. **Dark Mode Support**:
   - All UI elements visible in dark mode
   - Text, borders, backgrounds adapt correctly
   - Canvas annotations visible against dark UI
   - Theme toggle present and functional
   - No contrast or readability issues

10. **Responsive Design**:
    - Works on desktop (optimized)
    - Basic support on mobile/tablet
    - Layout adapts to viewport size
    - Canvas scales appropriately
    - Toolbar and controls accessible at all sizes
    - No horizontal scrolling

11. **Keyboard Accessibility**:
    - All controls keyboard accessible
    - Tab order logical
    - Focus indicators visible
    - Keyboard shortcuts work (tool switching, undo/redo, delete)
    - No keyboard traps

12. **Performance**:
    - Image loads within 2 seconds
    - Smooth drawing with no lag
    - Canvas redraws efficiently
    - Export completes within 5 seconds
    - No memory leaks
    - Handles large images (up to 10MB)
    - Handles many annotations (50+)

13. **Error Handling**:
    - Clear error messages for all failure scenarios
    - Validation prevents invalid operations
    - Errors displayed prominently
    - Errors are actionable
    - Errors clear when corrected
    - No unhandled exceptions in console

14. **Reset Functionality**:
    - Reset button clears image and annotations
    - Returns to upload state
    - Confirmation if annotations exist (optional)
    - Clean state for fresh start

15. **Privacy**:
    - All processing client-side
    - No data sent to servers
    - No network requests during annotation
    - Privacy note stated clearly

16. **Code Quality**:
    - TypeScript types properly defined
    - No ESLint errors or warnings
    - Build completes successfully
    - Code follows project conventions
    - Functions documented with JSDoc
    - Files organized appropriately

17. **Integration**:
    - Accessible from homepage
    - Back link returns to homepage
    - Theme toggle integrates with global theme
    - No regressions to existing tools
    - Works seamlessly as part of application

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `cd app && npm run lint` - Run linting to validate code quality. Must complete with zero errors and zero warnings.

- `cd app && npm run build` - Build the Next.js app to validate there are no TypeScript errors or build failures. Must complete successfully with exit code 0.

- `cd app && npm run dev` - Start development server and manually test the Screenshot Annotator end-to-end:
  - Navigate to http://localhost:3050
  - Verify "Screenshot Annotator" tool card appears on homepage with PenTool or Edit3 icon
  - Click card and navigate to /tools/screenshot-annotator
  - Verify page loads correctly
  - **Test image upload**:
    - Drag and drop a PNG screenshot onto upload zone
    - Verify image loads and displays on canvas
  - **Test arrow annotation**:
    - Select Arrow tool from toolbar
    - Click and drag on canvas to draw arrow
    - Verify arrow appears with arrowhead
    - Change color to blue, draw another arrow
    - Verify new arrow is blue
  - **Test text annotation**:
    - Select Text tool
    - Click on canvas
    - Enter text: "Important area"
    - Verify text appears at click location
    - Change font size to 24px
    - Add another text annotation
    - Verify larger font size
  - **Test rectangle annotation**:
    - Select Rectangle tool
    - Click and drag to draw rectangle (outline)
    - Toggle Fill to on
    - Draw another rectangle
    - Verify filled rectangle appears
  - **Test circle annotation**:
    - Select Circle tool
    - Click and drag to draw circle
    - Verify circle appears
  - **Test line annotation**:
    - Select Line tool
    - Click and drag to draw straight line
    - Verify line appears
  - **Test pen annotation**:
    - Select Pen tool
    - Draw freehand path on canvas
    - Verify smooth line follows mouse
  - **Test highlighter annotation**:
    - Select Highlighter tool
    - Change color to yellow
    - Draw over some area
    - Verify semi-transparent highlighting
  - **Test stroke width**:
    - Adjust stroke width slider to 10px
    - Draw line or arrow
    - Verify thicker annotation
  - **Test opacity**:
    - Adjust opacity slider to 50%
    - Draw annotation
    - Verify semi-transparent
  - **Test undo/redo**:
    - Click Undo button
    - Verify last annotation removed
    - Click Redo button
    - Verify annotation reappears
    - Press Ctrl+Z (undo)
    - Verify works via keyboard
  - **Test selection and editing**:
    - Select "Select" tool
    - Click an annotation
    - Verify selection handles appear
    - Drag annotation to new position
    - Verify it moves
    - Press Delete key
    - Verify annotation removed
  - **Test clear all**:
    - Add 3-4 annotations
    - Click "Clear All" button
    - Verify all annotations removed
  - **Test export PNG**:
    - Add several annotations (arrow, text, shapes)
    - Click "Download PNG" button
    - Verify PNG file downloads with filename like "annotated-screenshot-20250104-143022.png"
    - Open downloaded PNG
    - Verify all annotations rendered correctly at correct positions
  - **Test export JPEG**:
    - Click "Download JPEG" button
    - Verify JPEG file downloads
    - Open downloaded JPEG
    - Verify annotations present and quality acceptable
  - **Test reset**:
    - Click "Start Over" button
    - Verify returns to upload state
    - Verify canvas cleared
    - Upload new image and verify fresh start works
  - **Test dark mode**:
    - Toggle dark mode
    - Verify all UI elements visible and styled correctly:
      - Page background adapts
      - Cards and borders visible
      - Text readable
      - Canvas border visible
      - Toolbar buttons styled correctly
      - Control inputs visible
      - Annotations visible on canvas
    - Toggle back to light mode
    - Verify styles revert correctly
  - **Test responsive layout**:
    - Resize browser to mobile width (~375px)
    - Verify layout stacks vertically
    - Verify toolbar accessible
    - Verify controls accessible
    - Verify canvas fits viewport
    - Resize to desktop width (~1920px)
    - Verify side-by-side layout (canvas left, controls right)
    - Verify good use of space
  - **Test keyboard accessibility**:
    - Tab through all interactive elements
    - Verify focus indicators visible
    - Verify tab order logical
    - Test tool shortcuts (V, A, T, R, C, L, P, H)
    - Verify tools switch via keyboard
    - Test Escape to deselect
  - **Test error handling**:
    - Try uploading a non-image file (e.g., .txt)
    - Verify error message displayed
    - Upload valid image
    - Verify error clears
  - **Test browser console**:
    - Open DevTools console
    - Perform all operations above
    - Verify zero errors in console
    - Verify zero warnings in console
  - **Test integration**:
    - Navigate back to homepage via back link
    - Verify homepage displays correctly
    - Test another tool (e.g., PDF Merger, HEIC Converter)
    - Verify no regressions
    - Verify theme persists across navigation
  - **Test in multiple browsers** (if available):
    - Test in Chrome
    - Test in Firefox or Safari
    - Verify upload, annotation, and download work in both

## Notes

### Architecture Decision: Native Canvas vs. Library

**Decision**: Use native HTML5 Canvas API for simplicity and control.

**Rationale**:
- Screenshot Annotator needs basic drawing primitives (arrows, text, shapes, freehand)
- Native Canvas API provides all necessary functionality
- Lighter weight: No additional library dependency
- More control over rendering and performance
- Simpler codebase for maintenance

**Alternative Considered**:
- **Fabric.js** (~200KB): Provides object-oriented canvas, built-in selection/manipulation, event handling
- **Konva.js** (~150KB): Similar features, good performance, React integration via react-konva
- **Pros of libraries**: Easier selection/editing, better hit detection, layer management, more features
- **Cons**: Larger bundle size, learning curve, potential overkill for basic annotations

**Future Enhancement**: If annotation features become complex (rotation, grouping, advanced transformations), consider migrating to Fabric.js or Konva.js.

### Annotation Data Structure

Annotations are stored as objects with type-specific properties:

```typescript
{
  id: "uuid",
  type: "arrow",
  color: "#FF0000",
  strokeWidth: 3,
  opacity: 1,
  start: { x: 100, y: 100 },
  end: { x: 200, y: 200 }
}
```

This structure allows:
- Easy serialization (JSON)
- Type-safe TypeScript definitions
- Efficient rendering (iterate and draw)
- Simple undo/redo (store snapshots)
- Potential future export to other formats (SVG, JSON for sharing)

### Canvas Rendering Strategy

**Rendering pipeline**:
1. Clear canvas
2. Draw background image
3. Draw all completed annotations (from annotations array)
4. Draw preview annotation (while drawing, from drawingAnnotation state)
5. Draw selection handles (if annotation selected)

**Optimization**:
- Use `requestAnimationFrame` for smooth drawing
- Throttle mouse move events to reduce redraws (every 16ms = 60fps)
- Consider offscreen canvas for complex operations
- Only redraw when state changes

### Text Annotation Implementation

**Approach**: Click-based text input with modal or inline prompt.

**Options considered**:
1. **Modal dialog**: Click to open, enter text, click OK
   - Pros: Clear interaction, prevents canvas interference
   - Cons: Extra click, interrupts flow
2. **Inline input**: Show input box at click location on canvas
   - Pros: Contextual, faster workflow
   - Cons: More complex to implement, overlays canvas
3. **Browser prompt**: Use `window.prompt()`
   - Pros: Simple to implement, native UI
   - Cons: Ugly, breaks UX consistency

**Recommendation**: Use browser `window.prompt()` for simplicity in initial implementation. Consider modal or inline input in future enhancement.

### Arrow Drawing Implementation

**Arrowhead calculation**:
```typescript
// Calculate angle from start to end
const angle = Math.atan2(endY - startY, endX - startX);

// Arrowhead size (pixels)
const headLength = 15;
const headAngle = Math.PI / 6; // 30 degrees

// Arrowhead points
const head1 = {
  x: endX - headLength * Math.cos(angle - headAngle),
  y: endY - headLength * Math.sin(angle - headAngle)
};
const head2 = {
  x: endX - headLength * Math.cos(angle + headAngle),
  y: endY - headLength * Math.sin(angle + headAngle)
};

// Draw line
ctx.beginPath();
ctx.moveTo(startX, startY);
ctx.lineTo(endX, endY);
ctx.stroke();

// Draw arrowhead
ctx.beginPath();
ctx.moveTo(endX, endY);
ctx.lineTo(head1.x, head1.y);
ctx.moveTo(endX, endY);
ctx.lineTo(head2.x, head2.y);
ctx.stroke();
```

### Freehand Drawing Smoothing

To make pen and highlighter annotations smooth:

**Use quadratic curves instead of line segments**:
```typescript
ctx.beginPath();
ctx.moveTo(points[0].x, points[0].y);

for (let i = 1; i < points.length - 1; i++) {
  const xc = (points[i].x + points[i + 1].x) / 2;
  const yc = (points[i].y + points[i + 1].y) / 2;
  ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
}

ctx.stroke();
```

This creates smooth curves through points rather than jagged segments.

### Hit Detection for Selection

Detecting if click is inside an annotation:

**Arrow/Line**: Check distance from point to line segment (< stroke width threshold)
**Text**: Check if point inside bounding box (measure text width/height)
**Rectangle**: Check if point inside x,y,width,height bounds
**Circle**: Check if distance from center < radius
**Pen/Highlighter**: Check proximity to path (iterate points, check distance)

**Threshold**: Allow some tolerance (e.g., 5px) for easier selection.

### Export Format Recommendations

**PNG (default)**:
- Pros: Lossless, supports transparency, widely supported
- Cons: Larger file size
- Best for: High quality, editing, transparency needed

**JPEG**:
- Pros: Smaller file size (compressed), widely supported
- Cons: Lossy compression, no transparency
- Best for: Email attachments, web sharing, when size matters

**WebP**:
- Pros: Better compression than JPEG, supports transparency, modern format
- Cons: Not supported in older browsers (IE, old Safari)
- Best for: Modern web, when size and quality both matter

### Filename Generation

Generated filenames include timestamp for uniqueness:

**Format**: `annotated-{originalname}-{timestamp}.{ext}`

**Example**:
- Original: `screenshot.png`
- Generated: `annotated-screenshot-20250104-143022.png`

**Benefits**:
- Uniqueness prevents overwriting
- Timestamp helps identify when annotated
- Original name preserved for context
- Consistent naming convention

### Use Cases and User Personas

**Documentation Writers**:
- Need: Annotated screenshots for user guides
- Uses: Arrows pointing to buttons, text labels, rectangles around UI elements
- Frequency: Daily, dozens of screenshots

**QA Engineers / Bug Reporters**:
- Need: Mark up bugs for developers
- Uses: Arrows to issues, text explaining problems, rectangles highlighting incorrect areas
- Frequency: Multiple times per day

**Designers / Design Reviewers**:
- Need: Provide visual feedback on mockups
- Uses: Text comments, circles around elements, arrows pointing to areas needing work
- Frequency: Weekly, during design reviews

**Teachers / Educators**:
- Need: Annotate diagrams and images for lessons
- Uses: Arrows, text labels, highlighting, shapes for emphasis
- Frequency: Weekly, for lesson preparation

**Presenters**:
- Need: Mark up slides and images for presentations
- Uses: Arrows, text, shapes, highlighting key points
- Frequency: Before presentations, occasional

**Technical Support**:
- Need: Annotate screenshots to help customers
- Uses: Arrows to show where to click, text instructions, rectangles around relevant areas
- Frequency: Daily, many times

### Performance Considerations

**Canvas size limits**:
- Modern browsers support large canvases (up to 16384x16384 on Chrome)
- Memory usage: width × height × 4 bytes (RGBA)
- 4K image (3840×2160): ~33MB canvas memory
- 8K image: ~132MB canvas memory

**Large image handling**:
- Images near 10MB file size may be high resolution
- Consider downsampling for canvas display (keep original for export)
- Or use zoom/pan with viewport rendering (advanced)

**Throttling**:
- Mouse move events during freehand drawing: throttle to 16ms (60fps)
- Window resize events: debounce to 250ms
- Canvas redraws: batch using requestAnimationFrame

**Memory management**:
- Revoke object URLs: `URL.revokeObjectURL(imageUrl)` on reset
- Clear large arrays when no longer needed
- Avoid keeping multiple image copies in memory

### Browser Compatibility

**Supported browsers**:
- Chrome 90+ ✓
- Firefox 88+ ✓
- Safari 14+ ✓
- Edge 90+ ✓

**Required APIs**:
- HTML5 Canvas 2D context ✓ (all modern browsers)
- File API (File, FileReader, Blob) ✓
- Canvas toBlob() ✓
- URL.createObjectURL() ✓
- ES6 features (const, let, arrow functions, async/await) ✓

**Potential issues**:
- Older browsers: May not support toBlob() or modern JS features
- Mobile browsers: Touch events need testing, may have memory limits
- Safari: Sometimes has canvas size limits lower than Chrome

**Graceful degradation**:
- Feature detection for required APIs
- Show browser upgrade message if unsupported
- Fallback to alert() if modal not available

### Future Enhancements

**Additional annotation tools**:
- Polygon: Draw custom shapes with multiple points
- Callout: Text with pointer line (like speech bubble)
- Blur: Pixelate or blur sensitive information (privacy)
- Crop: Crop image before annotating
- Number labels: Add numbered markers (1, 2, 3) for steps

**Advanced editing features**:
- Rotate annotations
- Resize annotations with handles
- Group multiple annotations
- Layer management (bring to front, send to back)
- Copy/paste annotations
- Align tools (align left, center, distribute)
- Snap to grid/guides

**Import/Export enhancements**:
- Save as SVG (vector format)
- Save as PDF (for printing)
- Export annotation data as JSON (for sharing, reimporting)
- Import existing annotations from JSON
- Batch annotation (multiple images)

**Collaboration features**:
- Share annotated images with unique URL (requires backend)
- Real-time collaboration (multiple users annotating)
- Comments and discussions on annotations

**Zoom and pan**:
- Zoom in/out controls (1x, 2x, fit)
- Pan by dragging canvas
- Zoom to selected annotation
- Minimap for navigation (large images)

**Templates and presets**:
- Save common annotation styles as presets
- Templates for specific use cases (bug report, tutorial, design review)
- Color palettes for consistent branding

**Accessibility improvements**:
- Screen reader announcements for annotations
- High contrast mode for low vision users
- Keyboard-only workflow (no mouse required)
- ARIA labels for all controls

### Testing Resources

**Test images to use**:
- Simple screenshot (UI, website) - 1920x1080 PNG, ~500KB
- Complex image (photo) - 4K JPEG, 5-8MB
- Small image - 500x300 PNG, ~100KB
- Large image - 8K PNG, near 10MB limit
- Portrait orientation - 1080x1920
- Landscape orientation - 1920x1080
- Transparent PNG - for testing alpha channel
- GIF image - for format support testing

**Where to get test images**:
- Take screenshots of this documentation
- Use https://picsum.photos for random test images
- Create simple test images in MS Paint or Preview
- Use existing project screenshots

### Security Considerations

**Client-side only = inherently safe**:
- No server uploads = no data leakage
- No authentication needed
- No XSS risk (no user content rendered as HTML)
- No CSRF risk (no server requests)

**Still important**:
- File size validation (prevent browser crash from huge file)
- File type validation (only images)
- Sanitize filenames (prevent directory traversal, though download only)
- Memory limits (large canvas can crash tab)
- CSP policy (allow blob URLs for downloads)

**Privacy emphasis**:
- Clearly state "never leaves your device" on page
- No analytics on uploaded images
- No telemetry on annotation content
- User-friendly privacy note in prominent position

### Development Tips

**Iterative implementation**:
1. Start with image upload and canvas display
2. Add arrow tool (simplest drawing)
3. Add rectangle and circle (basic shapes)
4. Add text tool (most complex)
5. Add pen tool (freehand)
6. Implement selection and editing last
7. Polish UI and add info section

**Testing during development**:
- Keep 2-3 test images handy for quick testing
- Test after each tool implementation
- Use browser DevTools canvas inspector
- Profile with Performance tab to catch rendering issues
- Test on actual mobile device, not just responsive mode

**Common pitfalls to avoid**:
- Forgetting to save/restore canvas context state
- Not clearing canvas before redrawing (ghosting artifacts)
- Mouse coordinates not accounting for canvas offset
- Memory leaks from event listeners not cleaned up
- Object URLs not revoked (memory leak)
- Canvas size not matching image aspect ratio (distortion)

### Bundle Size Impact

**New dependencies**: None! All required APIs are native.

**New code size estimate**:
- Types: ~5KB
- Utilities (lib): ~15KB
- Components: ~20-25KB
- Page: ~10KB
- **Total**: ~50-55KB (minified)

**Impact**: Minimal. Application already has Next.js, React, and UI libraries. Screenshot Annotator adds less than 60KB to bundle.

**Code splitting**: Page is already lazy-loaded by Next.js (route-based splitting), so Screenshot Annotator code only loaded when tool is accessed.

### Complementary Tools

Screenshot Annotator pairs well with existing tools:

**PDF Merger → Screenshot Annotator**:
- Export pages from PDF as images
- Annotate each image
- (Future: Re-merge into annotated PDF)

**HEIC Converter → Screenshot Annotator**:
- Convert iPhone screenshots from HEIC to JPEG
- Annotate converted images
- Download annotated versions

**Future "Screenshot Capture" tool**:
- Capture screenshot directly in browser
- Immediately open in Screenshot Annotator
- Streamlined workflow

### Accessibility Best Practices

**Color contrast**:
- All text: 4.5:1 minimum (WCAG AA)
- Large text: 3:1 minimum
- Use WebAIM Contrast Checker during development

**Focus indicators**:
- Visible on all interactive elements
- 2px solid ring with sufficient contrast
- Not removed via CSS (outline: none is bad)

**Keyboard navigation**:
- Logical tab order (left-to-right, top-to-bottom)
- All functionality accessible via keyboard
- Shortcuts documented and consistent

**Screen reader support**:
- Labels for all inputs (visible or aria-label)
- Button purposes clear (aria-label for icon buttons)
- Error messages associated with controls (aria-describedby)
- Status updates announced (aria-live regions)

**ARIA attributes**:
- role="toolbar" for annotation toolbar
- aria-pressed for toggle buttons
- aria-disabled for disabled states
- aria-selected for active tool

### Mobile Considerations

**Primary target**: Desktop users (documentation writers, QA engineers, designers work on desktop)

**Mobile support**: Basic functionality, not primary use case

**Mobile UX challenges**:
- Precise annotation difficult on small touchscreen
- Toolbar takes significant screen space
- Canvas needs to be smaller to fit
- Zoom/pan essential for usability
- Keyboard shortcuts not available

**Mobile compromises**:
- Simplified toolbar (icons only, no labels)
- Fewer tools visible at once (scrollable toolbar)
- Larger touch targets (min 44x44px)
- Basic functionality only (arrow, text, rectangle)
- Download works, but viewing annotations harder on small screen

**Future mobile enhancement**:
- Dedicated mobile layout with bottom toolbar
- Touch gestures (pinch zoom, two-finger pan)
- Simplified controls (fewer options)
- Full-screen canvas mode
