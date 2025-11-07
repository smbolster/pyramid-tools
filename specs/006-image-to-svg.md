# Feature: Image to SVG

## Feature Plan Created: specs/006-image-to-svg.md

## Feature Description

Create an Image to SVG converter tool that transforms raster images (PNG, JPEG, WebP, BMP) into scalable vector graphics (SVG) using image tracing algorithms. Users will be able to upload bitmap images, adjust vectorization parameters (color precision, path smoothing, threshold), preview the SVG output in real-time, and download the result as a scalable SVG file. The tool provides side-by-side comparison of the original raster image and the generated vector graphic, allowing users to fine-tune settings for optimal results. This feature adds significant value for users who need to create resolution-independent graphics from photos, logos, icons, or illustrations for web design, print materials, or digital art workflows. All processing happens entirely client-side using JavaScript image tracing libraries, ensuring user privacy and fast performance without requiring server uploads.

## User Story

As a user of Pyramid Tools
I want to convert raster images (PNG, JPEG) to scalable vector graphics (SVG)
So that I can create resolution-independent graphics for web design, print, logos, or icons without quality loss when scaling

## Problem Statement

Raster images (PNG, JPEG, BMP) are composed of pixels and lose quality when scaled up, making them unsuitable for responsive web design, print at various sizes, or professional logo work. Designers, developers, and content creators frequently need to convert bitmap images into vector format (SVG) to achieve infinite scalability without quality degradation. While professional tools like Adobe Illustrator offer image tracing, they require expensive licenses and complex installations. Online SVG converters often have file size limits, add watermarks, require account registration, track user data, or produce poor-quality results. Users need a fast, private, and customizable image-to-SVG conversion tool that works entirely in the browser, respects their privacy, provides real-time preview with adjustable parameters, and produces high-quality SVG output suitable for professional use.

## Solution Statement

Implement a client-side Image to SVG converter tool that:
- Accepts raster image uploads (PNG, JPEG, WebP, BMP) via drag-and-drop or file picker
- Uses advanced image tracing algorithms (imagetracerjs library) to convert pixels to vector paths
- Provides real-time SVG preview showing the vectorized result
- Offers side-by-side comparison view (original vs SVG) to evaluate conversion quality
- Includes customizable vectorization parameters:
  - Color Mode: Full color, Grayscale, Black & White
  - Color Precision: Number of colors in output (2-64 colors)
  - Path Precision: Detail level of vector paths (low/medium/high)
  - Threshold: Edge detection sensitivity (for black & white mode)
  - Simplification: Smoothing factor for cleaner paths
- Validates input files (format, size, dimensions)
- Allows users to download the generated SVG file with appropriate filename
- Displays file size comparison (original vs SVG) and compression ratio
- Shows processing progress with estimated time remaining
- Works entirely client-side with no server requests for maximum privacy
- Follows the established design patterns from existing tools (PDF Merger, HEIC Converter, Screenshot Annotator)
- Includes comprehensive dark mode support consistent with the rest of the application
- Provides educational information about SVG benefits, use cases, and optimization tips

## Relevant Files

Use these files to implement the feature:

- **app/lib/tools.ts** - Tool registry where all tools are defined. Need to add new entry for the Image to SVG converter with appropriate id ("image-to-svg"), name ("Image to SVG"), description ("Convert raster images to scalable vector graphics"), icon (Image or Sparkles from lucide-react), href (/tools/image-to-svg), and category ("Image Conversion").

- **app/app/page.tsx** - Homepage that displays all tools as cards. Once the tool is registered in tools.ts, it will automatically appear on the homepage. No direct changes needed here, but useful for understanding how tools are displayed.

- **app/app/layout.tsx** - Root layout with ThemeProvider. No changes needed, but relevant for understanding the app structure and that dark mode support is available.

- **app/components/ui/button.tsx** - Reusable button component with variants (default, outline, ghost, destructive, secondary, link) and sizes (default, sm, lg, icon). Will be used for download button, reset button, conversion button, etc.

- **app/components/ui/checkbox.tsx** - Checkbox component for enabling/disabling advanced options.

- **app/components/ui/label.tsx** - Label component for form controls.

- **app/components/theme-toggle.tsx** - Theme toggle button component that should be included in the Image to SVG page header for consistency with other tool pages.

- **app/components/file-upload-zone.tsx** - Existing drag-and-drop file upload component. Will be used for image upload functionality. Supports file validation, drag-and-drop, and error display.

- **app/lib/utils.ts** - Utility functions including the cn() helper for merging Tailwind classes. Will be used throughout the component for conditional styling.

- **app/lib/zip-utils.ts** - Contains downloadBlob() utility function that will be used to trigger the download of the generated SVG file.

- **app/app/tools/heic-to-jpeg/page.tsx** - Reference implementation showing batch image processing with progress tracking, preview, and download functionality. Useful pattern for file upload, conversion, and result display.

- **app/app/tools/screenshot-annotator/page.tsx** - Reference implementation using canvas-based image manipulation. Demonstrates advanced image preview and comparison techniques.

### New Files

- **app/app/tools/image-to-svg/page.tsx** - Main tool page component. This is a client-side component ("use client") that includes:
  - File upload zone for raster images (PNG, JPEG, WebP, BMP)
  - Side-by-side preview: original image vs generated SVG
  - Real-time conversion with progress indicator
  - Configuration panel with vectorization parameters
  - Download button to save SVG file
  - Reset button to clear and start over
  - File size comparison display (original vs SVG)
  - Validation and error handling
  - Info section explaining SVG benefits and use cases
  - Consistent header with back link and theme toggle
  - Responsive layout for mobile/tablet/desktop

- **app/types/image-to-svg.ts** - TypeScript type definitions including:
  - ConversionStatus enum ('idle', 'uploading', 'processing', 'completed', 'error')
  - ColorMode enum ('color', 'grayscale', 'blackwhite')
  - PathPrecision enum ('low', 'medium', 'high')
  - SVGConversionOptions interface (colorMode, colorPrecision, pathPrecision, threshold, simplificationTolerance)
  - ConversionResult interface (svgBlob, svgDataUrl, originalSize, svgSize, compressionRatio, processingTime)
  - FileState interface (file, status, result, error, progress)
  - ValidationError interface (code, message)
  - Constants: SUPPORTED_IMAGE_FORMATS, MAX_FILE_SIZE, MAX_IMAGE_DIMENSIONS, DEFAULT_OPTIONS, ERROR_MESSAGES
  - ConversionState interface (uploaded file, current options, conversion result, processing state)

- **app/lib/image-to-svg.ts** - Core business logic for image-to-SVG conversion including:
  - convertImageToSVG(file: File, options: SVGConversionOptions, onProgress?: (progress: number) => void): Promise<ConversionResult>
    - Loads image into canvas
    - Calls imagetracerjs with specified options
    - Returns SVG blob and metadata
  - validateImageFile(file: File): ValidationError | null
    - Checks file format (PNG, JPEG, WebP, BMP)
    - Validates file size (max 10MB)
    - Validates image dimensions (max 4096x4096)
  - loadImageToCanvas(file: File): Promise<HTMLCanvasElement>
    - Creates canvas from uploaded file
    - Handles image loading errors
  - optimizeSVG(svgString: string): string
    - Basic SVG optimization (remove unnecessary whitespace, round numbers)
  - getOptionsForPreset(preset: 'logo' | 'photo' | 'icon' | 'illustration'): SVGConversionOptions
    - Returns optimized settings for common use cases
  - calculateCompressionRatio(originalSize: number, svgSize: number): number
  - Helper functions for color quantization, path simplification, and edge detection

- **app/components/svg-preview.tsx** - Reusable component for side-by-side comparison:
  - Accepts original image and SVG data URL as props
  - Renders split view with draggable divider or tabs
  - Shows original image on left, SVG on right
  - Includes zoom controls for detailed inspection
  - Displays file size and dimensions for both versions
  - Shows compression ratio and quality metrics
  - Handles loading state while conversion is in progress
  - Responsive design (stacked on mobile, side-by-side on desktop)
  - Clean, bordered containers with appropriate styling

- **app/components/svg-config-panel.tsx** - Reusable component for conversion settings:
  - Color mode selector (radio buttons: Full Color, Grayscale, Black & White)
  - Color precision slider (2-64 colors) with live preview
  - Path precision selector (Low, Medium, High detail)
  - Threshold slider for black & white mode (edge detection sensitivity)
  - Simplification slider (path smoothing factor)
  - Preset buttons for common scenarios:
    - Logo (high precision, limited colors)
    - Photo (full color, high detail)
    - Icon (simplified, flat colors)
    - Illustration (balanced settings)
  - Reset to defaults button
  - Advanced options toggle (collapsible section)
  - Real-time parameter preview (shows estimated output complexity)
  - Organized in collapsible sections with clear labels

- **app/components/conversion-progress.tsx** (if not already suitable) - Enhanced progress indicator:
  - Progress bar with percentage
  - Processing stage indicator ("Loading image...", "Tracing edges...", "Generating paths...", "Optimizing SVG...")
  - Estimated time remaining
  - Cancel button (optional)
  - Smooth animations

## Implementation Plan

### Phase 1: Foundation

1. Research and select appropriate image-to-SVG conversion library (imagetracerjs recommended for browser compatibility, full client-side operation, and good quality output)
2. Install the chosen library using npm/uv add in the app directory
3. Create TypeScript type definitions for conversion options, state management, file validation, and results
4. Define constants for default values, supported formats, size limits, and validation rules
5. Create comprehensive error messages for various failure scenarios
6. Set up the basic file structure for the new tool (page, types, lib, components)
7. Test the image tracing library in isolation to understand its API and capabilities

### Phase 2: Core Implementation

1. Implement core image-to-SVG conversion logic in lib/image-to-svg.ts
2. Create validation functions for uploaded images (format, size, dimensions)
3. Implement image loading to canvas functionality
4. Integrate imagetracerjs library with progress callbacks
5. Implement SVG optimization and cleanup
6. Create preset configurations for common use cases (logo, photo, icon, illustration)
7. Build the SVG preview component with side-by-side comparison
8. Create the configuration panel component with all parameter controls
9. Build the main tool page component with upload, conversion, preview, and download workflow
10. Implement real-time conversion triggered by parameter changes (with debouncing)
11. Add download functionality using the downloadBlob utility
12. Implement reset/clear functionality to start over
13. Display file size comparison and compression ratio
14. Style the page following existing tool patterns with proper spacing, typography, and colors

### Phase 3: Integration

1. Register the tool in lib/tools.ts so it appears on the homepage
2. Add comprehensive error handling and validation with user-friendly messages
3. Test conversion with various image types (photos, logos, illustrations, icons)
4. Test with different file formats (PNG, JPEG, WebP, BMP)
5. Verify downloaded SVG files are valid and can be opened in browsers and design tools
6. Test all parameter combinations (color modes, precision levels, simplification)
7. Ensure dark mode compatibility for all UI elements
8. Test responsive layout on mobile, tablet, and desktop
9. Validate accessibility (keyboard navigation, screen readers, focus indicators)
10. Add informational content about SVG benefits, use cases, and optimization tips
11. Performance testing (conversion speed, memory usage, large image handling)
12. Verify progress tracking accuracy and estimated time calculations

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Research Image-to-SVG Libraries

- Research available image tracing libraries compatible with Next.js and browser environments
- Consider options:
  - **imagetracerjs**: Pure JavaScript, client-side, good quality, moderate file size
  - **potrace**: Popular but requires Node.js or WebAssembly (more complex setup)
  - **primitive.js**: Geometric primitives approach (different aesthetic)
  - **svg-path-commander**: Path manipulation (post-processing)
- Evaluate based on:
  - Browser compatibility (must work client-side)
  - Quality of traced output
  - Customization options (colors, precision, smoothing)
  - Bundle size
  - TypeScript support or type definitions
  - Active maintenance and documentation
- Choose **imagetracerjs** for its pure JavaScript implementation, client-side compatibility, good quality output, and extensive customization options
- Document the choice and rationale in code comments

### 2. Install Image Tracing Library and Dependencies

- Run `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm install imagetracerjs` to install the library
- Run `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm install -D @types/imagetracerjs` if TypeScript types are available (or create custom types)
- Verify installation by checking package.json
- Test import in a temporary file to ensure it works with Next.js and client-side rendering
- Check bundle size impact and ensure it's acceptable (likely 50-100KB)

### 3. Create Type Definitions File

- Create `app/types/image-to-svg.ts`
- Define `ConversionStatus` enum:
  - IDLE = 'idle' (no file uploaded)
  - UPLOADING = 'uploading' (file being loaded)
  - PROCESSING = 'processing' (conversion in progress)
  - COMPLETED = 'completed' (SVG generated successfully)
  - ERROR = 'error' (conversion failed)
- Define `ColorMode` enum:
  - COLOR = 'color' (full color tracing)
  - GRAYSCALE = 'grayscale' (grayscale tracing)
  - BLACKWHITE = 'blackwhite' (binary black/white)
- Define `PathPrecision` enum:
  - LOW = 'low' (simplified paths, smaller file size)
  - MEDIUM = 'medium' (balanced detail)
  - HIGH = 'high' (maximum detail, larger file size)
- Define `SVGConversionOptions` interface:
  - colorMode: ColorMode
  - numberOfColors: number (2-64, number of colors to quantize)
  - pathPrecision: number (0.01-10, lower = more precise)
  - threshold: number (0-255, for black/white mode)
  - simplificationTolerance: number (0-10, path smoothing)
  - removeBackground: boolean (optional feature)
- Define `ConversionResult` interface:
  - svgBlob: Blob (the generated SVG file)
  - svgDataUrl: string (for preview display)
  - svgString: string (raw SVG markup)
  - originalSize: number (bytes)
  - svgSize: number (bytes)
  - compressionRatio: number (percentage)
  - processingTime: number (milliseconds)
  - dimensions: { width: number; height: number }
- Define `FileState` interface:
  - file: File | null
  - imageDataUrl: string | null (preview of original)
  - status: ConversionStatus
  - result: ConversionResult | null
  - error: string | null
  - progress: number (0-100)
- Define `ValidationError` interface:
  - code: string
  - message: string
- Define constants:
  - SUPPORTED_IMAGE_FORMATS: string[] = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/gif']
  - MAX_FILE_SIZE = 10 * 1024 * 1024 (10MB)
  - MAX_IMAGE_DIMENSIONS = { width: 4096, height: 4096 }
  - DEFAULT_OPTIONS: SVGConversionOptions with sensible defaults
  - PRESET_OPTIONS: Record<'logo' | 'photo' | 'icon' | 'illustration', SVGConversionOptions>
  - ERROR_MESSAGES with various error scenarios
- Export all types, enums, and constants

### 4. Create Image-to-SVG Conversion Utility

- Create `app/lib/image-to-svg.ts`
- Import ImageTracer from 'imagetracerjs'
- Import types from types/image-to-svg.ts
- Implement `validateImageFile(file: File): ValidationError | null`:
  - Check if file format is in SUPPORTED_IMAGE_FORMATS
  - Check if file.size <= MAX_FILE_SIZE (return error if too large)
  - Return null if valid
- Implement `loadImageToCanvas(file: File): Promise<HTMLCanvasElement>`:
  - Create new Image()
  - Load file as data URL using FileReader
  - Wait for image.onload
  - Validate dimensions <= MAX_IMAGE_DIMENSIONS
  - Create canvas with image dimensions
  - Draw image to canvas
  - Return canvas
  - Handle errors (invalid image, failed load)
- Implement `convertImageToSVG(file: File, options: SVGConversionOptions, onProgress?: (progress: number) => void): Promise<ConversionResult>`:
  - Start timer for processingTime
  - Validate file using validateImageFile()
  - Load image to canvas using loadImageToCanvas()
  - Report progress: 20% (image loaded)
  - Convert options to ImageTracer API format
  - Call ImageTracer.imageToSVG() with canvas, options, and callback
  - Report progress: 50% (tracing started)
  - Wait for SVG string result (ImageTracer is async)
  - Report progress: 80% (tracing complete)
  - Optimize SVG string using optimizeSVG()
  - Report progress: 90% (optimization complete)
  - Create SVG blob from string
  - Create data URL for preview
  - Calculate file sizes and compression ratio
  - End timer
  - Report progress: 100% (done)
  - Return ConversionResult with all metadata
  - Handle errors at each stage with descriptive messages
- Implement `optimizeSVG(svgString: string): string`:
  - Remove unnecessary whitespace
  - Round decimal numbers to 2 decimal places
  - Remove redundant SVG attributes
  - Add viewBox if missing
  - Return optimized string
- Implement `getOptionsForPreset(preset: 'logo' | 'photo' | 'icon' | 'illustration'): SVGConversionOptions`:
  - Logo: Limited colors (8), high precision, black/white or grayscale
  - Photo: Full color (64), high precision, detailed
  - Icon: Limited colors (16), medium precision, simplified
  - Illustration: Moderate colors (32), medium precision, balanced
  - Return appropriate SVGConversionOptions
- Implement `calculateCompressionRatio(originalSize: number, svgSize: number): number`:
  - Calculate percentage: ((svgSize / originalSize) * 100)
  - Return rounded to 1 decimal place
- Implement `formatFileSize(bytes: number): string`:
  - Convert to KB, MB with appropriate suffix
  - Return formatted string (e.g., "2.5 MB")
- Add JSDoc comments explaining each function, parameters, and return values
- Export all functions

### 5. Create SVG Preview Component

- Create `app/components/svg-preview.tsx`
- Make it a client component ("use client")
- Define props interface: SVGPreviewProps
  - originalImageUrl: string | null
  - svgDataUrl: string | null
  - originalSize: number
  - svgSize: number
  - compressionRatio: number
  - isProcessing: boolean
  - error: string | null
- Import icons: Loader2, ZoomIn, ZoomOut, Eye from lucide-react
- Implement state for view mode:
  - viewMode: 'split' | 'original' | 'svg' (toggle between views)
  - zoomLevel: number (1.0 = 100%)
- Implement component structure:
  - View mode toggle buttons (Original, Split, SVG)
  - Zoom controls (+/- buttons)
  - Split view container with two image panels side-by-side
  - Original image panel (left): <img src={originalImageUrl} />
  - SVG panel (right): <img src={svgDataUrl} />
  - Loading spinner overlay when isProcessing is true
  - Error message display when error exists
  - File size comparison footer:
    - Original size
    - SVG size
    - Compression ratio (color-coded: green if <100%, red if >100%)
  - Empty state message when no images loaded
- Style with Tailwind:
  - Bordered containers with rounded corners
  - Dark mode compatible backgrounds and borders
  - Responsive layout (stacked on mobile, side-by-side on desktop)
  - Smooth transitions for view mode changes
  - Proper aspect ratio maintenance
  - Zoom transforms applied to images
- Add keyboard shortcuts (optional):
  - 1/2/3 for view modes
  - +/- for zoom
- Export component

### 6. Create SVG Configuration Panel Component

- Create `app/components/svg-config-panel.tsx`
- Make it a client component ("use client")
- Define props interface: SVGConfigPanelProps
  - options: SVGConversionOptions
  - onOptionsChange: (options: SVGConversionOptions) => void
  - disabled: boolean (during processing)
- Import Button, Label, Checkbox from UI components
- Implement sections:

  **Section 1: Presets**
  - Four preset buttons: Logo, Photo, Icon, Illustration
  - Each button calls onOptionsChange with preset options
  - Highlight currently active preset (if matches)

  **Section 2: Color Mode**
  - Radio buttons for: Full Color, Grayscale, Black & White
  - onChange updates options.colorMode
  - Show icon representing each mode

  **Section 3: Color Precision** (visible for color/grayscale modes)
  - Slider input: range 2-64
  - Label showing current value: "N colors"
  - onChange updates options.numberOfColors
  - Tooltip explaining impact on file size

  **Section 4: Path Precision**
  - Radio buttons or select: Low, Medium, High
  - Description for each:
    - Low: Simplified paths, smaller files, less detail
    - Medium: Balanced detail and file size
    - High: Maximum detail, larger files
  - onChange updates options.pathPrecision

  **Section 5: Advanced Options** (collapsible)
  - Threshold slider (0-255) for black/white mode only
  - Simplification slider (0-10)
  - Remove background checkbox (if implemented)
  - Expert mode toggle for manual control

  **Section 6: Actions**
  - Reset to defaults button
  - Apply button (if not auto-applying)

- Style consistently with other form controls
- Add helpful tooltips and descriptions
- Disable controls during processing
- Show estimated output complexity indicator
- Export component

### 7. Create Main Image to SVG Tool Page

- Create `app/app/tools/image-to-svg/page.tsx`
- Add "use client" directive at the top
- Import necessary dependencies:
  - React hooks: useState, useCallback, useEffect
  - Next.js Link component
  - Icons: ArrowLeft, Download, Upload, RefreshCw, Image from lucide-react
  - Button, Label components
  - ThemeToggle component
  - FileUploadZone component
  - SVGPreview component
  - SVGConfigPanel component
  - Types and utilities from lib/image-to-svg
  - downloadBlob from lib/zip-utils
- Initialize state using useState:
  - fileState: FileState (holds file, status, result, error, progress)
  - conversionOptions: SVGConversionOptions (starts with DEFAULT_OPTIONS)
  - isAutoConvert: boolean = true (auto-convert on option change)
- Implement `handleFileUpload` using useCallback:
  - Validate file using validateImageFile()
  - If invalid, set error state and return
  - Create image preview URL using FileReader
  - Update fileState with file and imageDataUrl
  - Set status to UPLOADING
  - If isAutoConvert, trigger conversion
- Implement `handleConvert` using useCallback:
  - Check if file exists in fileState
  - Set status to PROCESSING, progress to 0
  - Clear any previous errors
  - Call convertImageToSVG with file, options, and progress callback
  - Update progress as conversion proceeds
  - On success: set status to COMPLETED, store result
  - On error: set status to ERROR, store error message
- Implement debounced auto-conversion:
  - Use useEffect to watch conversionOptions changes
  - If isAutoConvert and file exists and status is COMPLETED
  - Debounce 500ms to avoid converting on every slider change
  - Trigger handleConvert()
- Implement `handleDownload`:
  - Check if result exists in fileState
  - Get filename from original file: `${nameWithoutExt}.svg`
  - Call downloadBlob(result.svgBlob, filename)
- Implement `handleReset`:
  - Clear fileState to initial empty state
  - Reset conversionOptions to DEFAULT_OPTIONS
  - Revoke any object URLs to free memory
- Create JSX structure following standard tool page template:
  - Fixed theme toggle in top-right corner
  - Container with gradient background
  - Header section with back link, title, gradient underline, description
  - Main content area with responsive layout:

    **Upload Section** (when no file uploaded):
    - FileUploadZone component
    - Supported formats list
    - File size limit notice

    **Processing Section** (when file uploaded):
    - SVGConfigPanel (left column on desktop, top on mobile)
    - SVGPreview (right column on desktop, bottom on mobile)
    - Action buttons row:
      - Convert button (if manual mode)
      - Download SVG button (enabled when completed)
      - Reset button
    - Progress bar (when processing)
    - Error alert (if error)

  - Info section at bottom explaining SVG benefits and use cases
- Style with Tailwind matching existing tools
- Export default component

### 8. Add Upload Interface to Tool Page

- Use FileUploadZone component for drag-and-drop upload
- Configure FileUploadZone props:
  - accept={SUPPORTED_IMAGE_FORMATS.join(',')}
  - maxSize={MAX_FILE_SIZE}
  - onFileSelect={handleFileUpload}
  - disabled={fileState.status === 'processing'}
- Add visual list of supported formats below upload zone:
  - PNG, JPEG, WebP, BMP, GIF
  - Icons for each format
  - File size limit: "Max 10 MB per image"
- Add example images or sample button (optional):
  - "Try with sample image" button
  - Loads a demo image for testing
- Style upload zone:
  - Large, centered drop area
  - Clear call-to-action text
  - Hover states indicating drop target
  - Dark mode compatible

### 9. Implement Configuration Panel Integration

- Place SVGConfigPanel in left column (desktop) or above preview (mobile)
- Pass current options and onChange handler
- Connect onChange to update conversionOptions state
- Add auto-convert toggle switch:
  - Label: "Auto-convert on settings change"
  - Checkbox to enable/disable isAutoConvert
  - When enabled, conversion triggers automatically with 500ms debounce
  - When disabled, show "Convert" button that must be clicked manually
- Add manual "Convert" button:
  - Visible only when isAutoConvert is false
  - onClick calls handleConvert()
  - Disabled during processing
  - Prominent styling
- Show current conversion status:
  - Processing indicator with spinner
  - Progress percentage
  - Estimated time remaining (if available)
- Disable all controls during processing

### 10. Implement Preview Display and Comparison

- Place SVGPreview component in right column (desktop) or below config (mobile)
- Pass all required props:
  - originalImageUrl from fileState.imageDataUrl
  - svgDataUrl from fileState.result?.svgDataUrl
  - originalSize from fileState.result?.originalSize
  - svgSize from fileState.result?.svgSize
  - compressionRatio from fileState.result?.compressionRatio
  - isProcessing based on fileState.status
  - error from fileState.error
- Ensure preview updates in real-time as conversion completes
- Add view mode controls (if not in SVGPreview):
  - Toggle between: Original Only, Split View, SVG Only
  - Default to Split View for comparison
- Add zoom controls:
  - Zoom in/out buttons
  - Reset zoom button
  - Display current zoom percentage
- Show processing overlay when status is PROCESSING:
  - Semi-transparent overlay
  - Spinner with "Converting..." message
  - Progress bar
  - Cancel button (optional feature)

### 11. Add Download and Reset Functionality

- Add action buttons row below preview:
  - **Download SVG button**:
    - Label: "Download SVG"
    - Icon: Download
    - variant="default" (primary styling)
    - Disabled when status !== COMPLETED
    - onClick calls handleDownload
    - Shows success animation on download
  - **Reset button**:
    - Label: "Start Over" or "Reset"
    - Icon: RefreshCw
    - variant="outline"
    - onClick calls handleReset
    - Confirm dialog if conversion in progress
  - **Convert button** (manual mode only):
    - Label: "Convert to SVG"
    - Icon: Image
    - variant="default"
    - Visible only when isAutoConvert is false
    - Disabled when no file uploaded or processing
    - onClick calls handleConvert
- Add file info display:
  - Original filename
  - Original file size
  - Image dimensions (width x height)
  - Processing time (when completed)
- Style buttons with consistent spacing and sizing
- Add keyboard shortcuts:
  - Ctrl/Cmd + S to download
  - Ctrl/Cmd + R to reset
  - Enter to convert (when focused on convert button)

### 12. Implement Progress Tracking and Status Display

- Show detailed progress during conversion:
  - Progress bar component (0-100%)
  - Current stage text:
    - "Loading image..." (0-20%)
    - "Tracing edges..." (20-50%)
    - "Generating vector paths..." (50-80%)
    - "Optimizing SVG..." (80-95%)
    - "Finalizing..." (95-100%)
  - Elapsed time counter
  - Estimated time remaining (if calculable)
- Add progress callbacks to convertImageToSVG function:
  - Report progress at each stage
  - Update fileState.progress
- Show success message when completed:
  - Brief animation or checkmark
  - "Conversion complete!" message
  - Auto-hide after 3 seconds
- Show warning messages when appropriate:
  - Large file size warning (>5MB)
  - High dimension warning (>2048x2048)
  - Compression ratio >100% warning (SVG larger than original)

### 13. Add Error Handling and Validation

- Display validation errors prominently:
  - Alert-style div with red/destructive border
  - Error icon
  - Specific error message from fileState.error
  - Position above upload zone or preview area
- Add inline validation feedback:
  - File format not supported
  - File size too large (show max limit)
  - Image dimensions too large (show max dimensions)
  - Invalid or corrupted image file
  - Out of memory error (image too complex)
- Handle conversion errors gracefully:
  - Catch errors from convertImageToSVG
  - Display user-friendly error messages
  - Log technical errors to console for debugging
  - Provide "Try Again" button
  - Suggest solutions (reduce file size, simplify options)
- Add warning indicators:
  - Yellow/warning color for non-blocking issues
  - Informational icon
  - Dismissible warnings
- Validate options in real-time:
  - Ensure numberOfColors is 2-64
  - Ensure pathPrecision is positive
  - Clamp slider values to valid ranges
- Clear errors when user takes corrective action:
  - Uploads a new valid file
  - Changes problematic settings
  - Clicks "Try Again"

### 14. Add Informational Section

- Create "About Image to SVG" section at bottom of page
- Style as a card with rounded border and padding (matching other tools)
- Include information about:

  **What is SVG?**
  - Scalable Vector Graphics: resolution-independent image format
  - Uses mathematical paths instead of pixels
  - Scales infinitely without quality loss
  - Editable in code and design tools
  - Smaller file size for simple graphics

  **When to Use SVG:**
  - Logos and brand assets (always sharp)
  - Icons and UI elements (responsive design)
  - Illustrations and diagrams (clean lines)
  - Print materials (any size without pixelation)
  - Web graphics (fast loading, SEO-friendly)

  **Conversion Tips:**
  - Start with high-quality source images (PNG preferred)
  - Simple images convert better (logos, icons, flat illustrations)
  - Photos require more colors and produce larger SVG files
  - Use Logo preset for simple graphics with limited colors
  - Use Photo preset for detailed images with gradients
  - Adjust color precision to balance quality vs file size
  - Higher path precision = more detail but larger file size
  - Test generated SVG in target application (browser, design tool)

  **Optimization Best Practices:**
  - Reduce number of colors for simpler, smaller SVGs
  - Increase simplification tolerance for smoother paths
  - Remove background if transparent output is needed
  - Use black & white mode for line art and sketches
  - Preview at intended display size before downloading

  **Privacy Note:**
  - "All processing happens in your browser. Your images never leave your device."
  - "No uploads, no servers, complete privacy."

- Use proper typography with headings, bullet points, bold emphasis
- Add icons for visual interest (Image, Zap, Shield)
- Include links to MDN SVG documentation (optional)

### 15. Style and Polish the Tool Page

- Apply gradient background matching other tools:
  - `bg-gradient-to-b from-background to-secondary/20`
- Ensure consistent spacing using Tailwind utilities:
  - Container padding: px-4 py-16 sm:px-6 lg:px-8
  - Section margins: mb-12
  - Element spacing: gap-4, gap-6
- Apply proper typography hierarchy:
  - h1: text-4xl font-bold
  - h2: text-2xl font-semibold
  - h3: text-lg font-semibold
  - body: text-base
  - captions: text-sm text-muted-foreground
- Add subtle shadows and borders to sections:
  - Cards: rounded-lg border border-border bg-card p-6
  - Buttons: proper shadow on hover
- Ensure all interactive elements have proper states:
  - Hover: opacity, scale, or background change
  - Focus: visible focus ring
  - Active: pressed effect
  - Disabled: reduced opacity, no pointer events
- Verify dark mode styles for all elements:
  - Text colors (foreground, muted-foreground)
  - Backgrounds (background, card)
  - Borders (border)
  - Buttons (proper contrast)
  - Preview containers (visible in both modes)
  - Error messages (destructive colors)
- Make layout fully responsive:
  - Mobile (< 640px): Single column, stacked sections
  - Tablet (640-1024px): Transitional layout
  - Desktop (> 1024px): Two-column layout (config left, preview right)
  - Max width container: max-w-6xl
- Add smooth transitions:
  - View mode changes
  - Status updates
  - Error displays
  - Button states
- Ensure proper contrast ratios for accessibility:
  - Text on backgrounds: 4.5:1 minimum
  - Interactive elements: clearly distinguishable
- Test all spacing and alignment:
  - Consistent gaps between sections
  - Aligned form controls
  - Centered headings
  - Proper button groups

### 16. Register Tool in Tools Registry

- Open `/Users/sbolster/projects/corporate/pyramid-tools/app/lib/tools.ts`
- Add new entry to the tools array:
  ```typescript
  {
    id: "image-to-svg",
    name: "Image to SVG",
    description: "Convert raster images to scalable vector graphics",
    icon: "Image", // or "Sparkles" for magic effect
    href: "/tools/image-to-svg",
    category: "Image Conversion",
  }
  ```
- Verify the icon name is available in lucide-react
  - Alternative icons: ImageIcon, Wand2, Sparkles, FileImage
- Verify the category matches existing categories or add new one
- Save the file
- Confirm the tool appears on the homepage

### 17. Test Basic Conversion Workflow

- Start dev server: `npm run dev` in app directory
- Navigate to http://localhost:3000
- Verify "Image to SVG" tool card appears on homepage
- Click the tool card
- Verify page loads at /tools/image-to-svg
- Test file upload:
  - Click upload zone or drag-and-drop a PNG image
  - Verify image preview loads
  - Verify file info displays (name, size, dimensions)
- Test conversion with default settings:
  - Verify conversion starts automatically (if auto-convert enabled)
  - Watch progress bar advance through stages
  - Verify SVG preview displays when complete
  - Check original vs SVG comparison
  - Verify file size comparison shows
- Test download:
  - Click "Download SVG" button
  - Verify SVG file downloads with correct filename
  - Open downloaded SVG in browser
  - Verify SVG displays correctly
  - Open SVG in text editor, verify valid XML
- Test reset:
  - Click "Reset" button
  - Verify all state clears
  - Verify upload zone reappears

### 18. Test Conversion with Various Image Types

- **Test PNG images:**
  - Simple logo with transparency
  - Complex photo
  - Icon with flat colors
  - Illustration with gradients
  - Line art or sketch
- **Test JPEG images:**
  - Photo with many colors
  - Compressed image
  - Large dimension image (2000x2000+)
  - Small icon (100x100)
- **Test WebP images:**
  - Modern format support
  - Animated WebP (if supported)
- **Test BMP images:**
  - Legacy format support
- **Test edge cases:**
  - Very small image (10x10 pixels)
  - Very large image (4096x4096 pixels, max allowed)
  - Image with unusual aspect ratio (1:10, 10:1)
  - Grayscale image
  - Black and white (1-bit) image
  - Image with alpha transparency
- Verify all formats convert successfully
- Verify SVG output is valid and scannable
- Check for visual quality issues (artifacts, missing details)

### 19. Test Conversion Parameter Adjustments

- **Test Presets:**
  - Click "Logo" preset:
    - Verify limited colors (8)
    - Verify high path precision
    - Test with logo image
    - Check SVG is clean and sharp
  - Click "Photo" preset:
    - Verify many colors (64)
    - Verify high detail
    - Test with photo image
    - Check SVG resembles original
  - Click "Icon" preset:
    - Verify moderate colors (16)
    - Verify simplified paths
    - Test with icon image
  - Click "Illustration" preset:
    - Verify balanced settings (32 colors, medium precision)
    - Test with illustration image
- **Test Color Mode:**
  - Switch to "Full Color":
    - Verify colorful output
    - Check color slider appears
  - Switch to "Grayscale":
    - Verify output is grayscale
    - Check color slider appears
  - Switch to "Black & White":
    - Verify binary output
    - Check threshold slider appears
    - Adjust threshold and verify edge detection changes
- **Test Color Precision:**
  - Set to 2 colors (minimum):
    - Verify simple, posterized output
    - Check smaller file size
  - Set to 64 colors (maximum):
    - Verify detailed, smooth gradients
    - Check larger file size
  - Gradually increase from 2 to 64:
    - Verify smooth transition in quality
- **Test Path Precision:**
  - Set to "Low":
    - Verify simplified, chunky paths
    - Check smaller file size
  - Set to "Medium":
    - Verify balanced detail
  - Set to "High":
    - Verify smooth, detailed paths
    - Check larger file size
- **Test Simplification:**
  - Set to 0 (no smoothing):
    - Verify detailed but jagged paths
  - Set to 10 (maximum smoothing):
    - Verify smooth but potentially over-simplified paths
  - Find balance that preserves detail while reducing complexity
- **Test Auto-convert toggle:**
  - Disable auto-convert
  - Change settings
  - Verify conversion does NOT happen automatically
  - Click "Convert" button manually
  - Verify conversion happens
  - Enable auto-convert
  - Change settings
  - Verify conversion happens automatically after 500ms delay

### 20. Test File Size Comparison and Optimization

- Upload various image types and note original sizes
- Convert with different settings and compare SVG sizes:
  - Logo with limited colors: SVG should be smaller than PNG
  - Photo with many colors: SVG will be larger than JPEG
  - Icon with flat colors: SVG should be much smaller
  - Complex illustration: SVG size varies based on complexity
- Verify compression ratio displays correctly:
  - Shows as percentage
  - Color-coded (green if <100%, red if >100%)
  - Updates when settings change
- Test optimization impact:
  - Verify optimizeSVG() function reduces file size
  - Compare raw vs optimized SVG sizes
  - Ensure optimization doesn't break SVG validity
- Verify file size display formatting:
  - Bytes → KB → MB conversion
  - Appropriate decimal places
  - Clear labels (Original, SVG, Ratio)

### 21. Test Preview and Comparison Features

- **Test view modes:**
  - Original Only: Shows only uploaded image
  - Split View: Shows original and SVG side-by-side
  - SVG Only: Shows only generated SVG
  - Verify seamless switching between modes
- **Test zoom controls:**
  - Click zoom in (+): Verify image scales up
  - Click zoom out (-): Verify image scales down
  - Click reset zoom: Verify return to 100%
  - Verify zoom applies to both images in split view
  - Test zoom limits (min 25%, max 400%)
- **Test split view divider** (if implemented):
  - Drag divider left/right
  - Verify preview adjusts in real-time
  - Verify divider position persists during conversion
- **Test responsive preview:**
  - Desktop: Side-by-side comparison
  - Tablet: Side-by-side or stacked based on screen size
  - Mobile: Stacked vertically
  - Verify images scale appropriately
- **Test preview during processing:**
  - Verify loading spinner displays
  - Verify progress indication
  - Verify original image remains visible
  - Verify SVG area shows "Processing..."
- **Test preview error state:**
  - Trigger conversion error
  - Verify error message displays in preview area
  - Verify previous successful preview remains if available

### 22. Test Error Handling and Edge Cases

- **Test file validation errors:**
  - Upload unsupported format (e.g., .txt, .pdf):
    - Verify error: "Unsupported file format"
  - Upload file >10MB:
    - Verify error: "File exceeds 10MB limit"
  - Upload corrupted image file:
    - Verify error: "Failed to load image"
- **Test image dimension limits:**
  - Upload image >4096x4096 pixels:
    - Verify error: "Image dimensions too large"
  - Upload extremely small image (1x1 pixel):
    - Verify conversion works or appropriate warning
- **Test conversion failures:**
  - Trigger out-of-memory error (very complex image):
    - Verify graceful error message
    - Suggest reducing color count or dimensions
  - Simulate ImageTracer failure:
    - Verify error caught and displayed
    - Provide "Try Again" button
- **Test browser compatibility issues:**
  - Test in Chrome, Firefox, Safari, Edge
  - Verify File API works
  - Verify Canvas API works
  - Verify Blob creation and download work
- **Test rapid interactions:**
  - Upload file, immediately click reset:
    - Verify no errors or crashes
  - Change settings rapidly:
    - Verify debouncing prevents excessive conversions
  - Click download multiple times rapidly:
    - Verify multiple downloads or single download (expected behavior)
- **Test memory management:**
  - Convert multiple images in sequence
  - Verify object URLs are revoked
  - Check browser memory usage (DevTools)
  - Verify no memory leaks

### 23. Test Dark Mode Compatibility

- Enable dark mode using theme toggle
- Verify all UI elements are visible and styled correctly:
  - Page background gradient
  - Section backgrounds and borders
  - Text colors (headings, labels, descriptions, body text)
  - Upload zone background and border
  - Preview containers and borders
  - Configuration panel controls (sliders, radio buttons)
  - Buttons (all variants: default, outline, destructive)
  - Progress bar
  - Error and warning messages
  - Info section background and text
- Verify proper contrast in dark mode:
  - Text on backgrounds: readable
  - Buttons: clearly visible
  - Form controls: distinguishable
  - Preview images: visible against dark background
- Test image preview visibility:
  - Original image with light background
  - SVG with light background
  - Ensure white areas don't blend into dark UI
  - Add subtle border if needed
- Switch between light and dark mode multiple times:
  - Verify smooth transitions
  - Verify no layout shifts
  - Verify no visual glitches
  - Verify theme persists after page navigation

### 24. Test Responsive Layout

- **Test mobile viewport (375px width):**
  - Verify single column layout
  - Config panel above preview (stacked)
  - Upload zone full width
  - Preview full width
  - Buttons stack vertically or wrap
  - Text remains readable
  - All controls are tappable (min 44x44px)
  - No horizontal scrolling
- **Test tablet viewport (768px width):**
  - Verify transitional layout
  - May be single column or starting two-column
  - Proper spacing and alignment
  - Images scale appropriately
- **Test desktop viewport (1920px width):**
  - Verify two-column layout:
    - Config panel on left (40%)
    - Preview on right (60%)
  - Content max-width prevents excessive stretching
  - Centered container
  - Good use of whitespace
- **Test landscape orientation on mobile:**
  - Verify layout adapts
  - May switch to side-by-side
- **Test browser zoom:**
  - 50% zoom: Verify layout still makes sense
  - 200% zoom: Verify no overflow, text remains readable
- **Test with browser dev tools device emulation:**
  - iPhone SE, iPhone 12, iPad, iPad Pro
  - Verify consistent experience

### 25. Test Accessibility

- **Keyboard navigation:**
  - Tab through all interactive elements in logical order:
    - Theme toggle
    - Back link
    - Upload zone (should be keyboard accessible)
    - Preset buttons
    - Color mode radio buttons
    - Sliders (arrow keys to adjust)
    - Auto-convert checkbox
    - Convert button
    - Download button
    - Reset button
    - Zoom controls
    - View mode buttons
  - Verify visible focus indicators on all elements
  - Press Enter or Space on buttons to activate
  - Arrow keys to adjust sliders
  - Verify no keyboard traps
- **Screen reader testing:**
  - Use screen reader (VoiceOver, NVDA, JAWS)
  - Verify all labels are announced correctly
  - Verify form controls have associated labels
  - Verify error messages are announced
  - Verify status updates are announced (aria-live regions)
  - Verify button purposes are clear
  - Verify image alt text (if applicable)
- **Color contrast:**
  - Use browser tools or axe DevTools to check ratios
  - Verify all text meets WCAG AA: 4.5:1 for normal text
  - Verify interactive elements are distinguishable
  - Verify error messages are readable
- **Focus management:**
  - Verify focus indicators are visible and clear
  - Verify focus rings work in both light and dark modes
  - Verify focus doesn't jump unexpectedly
  - Verify focus returns to appropriate element after modal close (if any)
- **ARIA attributes:**
  - Verify proper roles (button, region, status)
  - Verify aria-label for icon-only buttons
  - Verify aria-disabled for disabled controls
  - Verify aria-live for status updates
  - Verify aria-describedby for field descriptions
- **Semantic HTML:**
  - Use proper heading hierarchy (h1, h2, h3)
  - Use <button> for buttons, not <div>
  - Use <label> for form labels
  - Use semantic sectioning elements

### 26. Test Performance and Optimization

- **Test conversion speed:**
  - Small image (100KB): Should complete in <1 second
  - Medium image (1MB): Should complete in 1-3 seconds
  - Large image (5MB): Should complete in 3-10 seconds
  - Very large image (10MB, 4096x4096): Should complete in 10-20 seconds
  - Measure actual times and verify reasonable performance
- **Test memory usage:**
  - Open browser DevTools → Memory profiler
  - Convert multiple images in sequence
  - Take heap snapshots before and after each conversion
  - Verify memory is released (no leaks)
  - Verify object URLs are revoked using URL.revokeObjectURL()
- **Test debouncing effectiveness:**
  - Rapidly adjust color slider
  - Verify conversion doesn't trigger on every change
  - Verify only final value triggers conversion (500ms delay)
  - Check console for excessive function calls
- **Test bundle size impact:**
  - Run `npm run build`
  - Check build output for bundle sizes
  - Verify imagetracerjs is included in appropriate chunk
  - Verify bundle size increase is acceptable (~50-100KB)
- **Test on slower devices:**
  - Use Chrome DevTools CPU throttling (4x slowdown)
  - Verify conversion still completes
  - Verify UI remains responsive during processing
  - Verify progress updates smoothly
- **Test concurrent operations:**
  - Start conversion
  - Immediately change settings
  - Verify previous conversion is cancelled or completed first
  - Verify no race conditions or state conflicts

### 27. Test Download Functionality

- **Test basic download:**
  - Convert an image
  - Click "Download SVG" button
  - Verify file downloads
  - Verify filename format: `[original-name].svg`
  - Example: `logo.png` → `logo.svg`
- **Test downloaded SVG validity:**
  - Open downloaded SVG in browser (drag into address bar)
  - Verify SVG displays correctly
  - Verify viewBox is set correctly
  - Open SVG in text editor
  - Verify valid XML structure
  - Verify no syntax errors
- **Test SVG in design tools:**
  - Open downloaded SVG in:
    - Figma (import SVG)
    - Adobe Illustrator (if available)
    - Inkscape (if available)
  - Verify paths are editable
  - Verify colors are preserved
  - Verify dimensions are correct
- **Test cross-browser download:**
  - Download in Chrome: Verify works
  - Download in Firefox: Verify works
  - Download in Safari: Verify works
  - Download in Edge: Verify works
- **Test download on mobile:**
  - Convert image on mobile device
  - Click download
  - Verify file saves to device
  - Verify file can be opened and shared

### 28. Test Integration with Existing Tools

- **Test navigation:**
  - From homepage, click Image to SVG tool
  - Verify correct page loads
  - Click "Back to Tools" link
  - Verify homepage loads
  - Navigate to other tools (HEIC, PDF Merger)
  - Verify they still work correctly (no regressions)
- **Test theme persistence:**
  - Enable dark mode on homepage
  - Navigate to Image to SVG tool
  - Verify dark mode is active
  - Toggle theme on tool page
  - Navigate back to homepage
  - Verify theme change persisted
- **Test with other tools:**
  - Convert HEIC to JPEG
  - Download JPEG
  - Upload JPEG to Image to SVG
  - Convert to SVG
  - Verify workflow is seamless
- **Test shared components:**
  - Verify ThemeToggle works consistently across all pages
  - Verify Button component styles match other tools
  - Verify FileUploadZone behavior matches HEIC converter
  - Verify downloadBlob utility works same as other tools

### 29. Code Quality and Cleanup

- Review all new code for quality:
  - **TypeScript types:**
    - No `any` types (use proper interfaces)
    - All props interfaces defined
    - All function parameters typed
    - All return types explicit
  - **Formatting and style:**
    - Consistent indentation (2 spaces)
    - Proper line breaks
    - Consistent quote style (single or double)
    - Remove trailing whitespace
  - **Naming conventions:**
    - Components: PascalCase (SVGPreview, SVGConfigPanel)
    - Functions: camelCase (handleConvert, validateImageFile)
    - Constants: UPPER_SNAKE_CASE (MAX_FILE_SIZE, DEFAULT_OPTIONS)
    - Meaningful, descriptive names
  - **JSDoc comments:**
    - All utility functions documented
    - Parameters described
    - Return values described
    - Complex logic explained
  - **Console statements:**
    - Remove console.log (except intentional errors)
    - Use console.error for actual errors
    - Remove debug statements
  - **Unused code:**
    - Remove unused imports
    - Remove unused variables
    - Remove commented-out code
    - Remove dead code paths
- Verify files follow existing project conventions:
  - **Import order:**
    1. React/Next.js imports
    2. Third-party libraries
    3. Local components
    4. Local utilities
    5. Types
  - **Component structure:**
    - Imports
    - Type definitions
    - Component function
    - JSX return
    - Export
  - **File naming:**
    - Components: kebab-case (svg-preview.tsx)
    - Lib files: kebab-case (image-to-svg.ts)
    - Types: kebab-case (image-to-svg.ts)
- Ensure proper error handling:
  - All async functions have try-catch
  - All Promises have .catch() or try-catch
  - User-friendly error messages
  - Technical errors logged for debugging
- Verify all dependencies are installed:
  - Check package.json lists imagetracerjs
  - Run `npm install` to ensure all deps installed
  - Verify no missing peer dependencies
- Ensure TypeScript compilation succeeds:
  - No type errors
  - No missing type definitions
  - All imports resolve correctly

### 30. Documentation and Comments

- Add JSDoc comments to all utility functions:
  - `convertImageToSVG()`: Describe conversion process
  - `validateImageFile()`: Describe validation rules
  - `loadImageToCanvas()`: Describe canvas loading
  - `optimizeSVG()`: Describe optimization steps
  - Include `@param` and `@returns` tags
- Add inline comments for complex logic:
  - Image tracing algorithm setup
  - Progress calculation formulas
  - Debounce implementation
  - Memory cleanup (URL.revokeObjectURL)
- Document component props with JSDoc:
  - Describe each prop's purpose
  - Note optional vs required props
  - Include example usage
- Add comments to type definitions:
  - Explain enum values
  - Describe interface fields
  - Document constant meanings
- Ensure error messages are clear and actionable:
  - State the problem
  - Suggest solution
  - Avoid technical jargon
- Update README if needed (if project has one):
  - Add Image to SVG tool to features list
  - Document any new dependencies

### 31. Run Validation Commands

Execute validation commands to ensure the feature works correctly with zero regressions.

- Run `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm run lint`
  - Verify no ESLint errors
  - Verify no ESLint warnings (or acceptable warnings only)
  - Fix any linting issues
- Run `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm run build`
  - Verify successful build with exit code 0
  - Verify no TypeScript errors
  - Verify no type checking issues
  - Verify no build failures
  - Check bundle sizes in output
- Start dev server: `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm run dev`
- Perform comprehensive manual testing:
  - Navigate to http://localhost:3000
  - Verify Image to SVG tool card appears on homepage
  - Click tool card
  - Upload a test image (PNG logo)
  - Verify conversion completes successfully
  - Verify SVG preview displays
  - Try different presets (Logo, Photo, Icon)
  - Adjust color precision slider
  - Verify auto-conversion works
  - Download SVG file
  - Open downloaded SVG in browser
  - Verify SVG is valid and displays correctly
  - Test with different image types (JPEG, WebP)
  - Test with complex photo
  - Test error scenarios (too large file, invalid format)
  - Toggle dark mode
  - Verify all elements styled correctly
  - Test on mobile viewport (resize browser)
  - Test keyboard navigation
  - Navigate back to homepage
  - Verify no regressions to other tools (test HEIC converter, PDF merger)
  - Check browser console for any errors (should be none)

## Testing Strategy

### Unit Tests

Due to the client-side nature of this application and the current absence of a testing framework, formal unit tests are not included. However, if a testing framework is added in the future, consider testing:

- **validateImageFile()**: Test with valid files, invalid formats, files too large, edge cases
- **loadImageToCanvas()**: Test successful image loading, error handling, dimension validation
- **convertImageToSVG()**: Test conversion with various options, progress callbacks, error handling
- **optimizeSVG()**: Test that optimization reduces size without breaking validity
- **calculateCompressionRatio()**: Test calculation accuracy with various input sizes
- **getOptionsForPreset()**: Test that each preset returns expected configuration
- **Debounce logic**: Verify conversion doesn't trigger excessively during rapid setting changes
- **State management**: Verify fileState updates correctly through upload/convert/error/reset lifecycle

### Integration Tests

Manual integration tests to perform:

- **Upload to conversion flow**: Upload file → auto-convert → display result
- **Settings to conversion**: Change settings → debounced reconversion → updated preview
- **Preview to download**: Generate SVG → preview displays → download saves correct file
- **Reset integration**: Reset clears all state, returns to initial upload screen
- **Error recovery**: Error occurs → display error message → user fixes issue → conversion succeeds
- **Navigation integration**: Tool accessible from homepage, back link returns to homepage
- **Theme integration**: Dark mode toggle affects Image to SVG page consistently
- **Cross-tool integration**: Convert image in one tool, use result in another (e.g., HEIC→JPEG→SVG)

### Edge Cases

- **Empty or invalid file**: Should display validation error, not crash
- **Extremely small image** (1x1 pixel): Should convert or warn appropriately
- **Maximum size image** (10MB, 4096x4096): Should convert successfully but may be slow
- **Exceeding size limits**: Should display clear error message before attempting conversion
- **Corrupted image file**: Should handle gracefully with error message
- **Unsupported format**: Should reject with clear message listing supported formats
- **Transparent PNG**: Should handle transparency (preserve or make white background)
- **Animated GIF**: Should convert first frame only (or reject with explanation)
- **Grayscale image**: Should detect and handle appropriately
- **Image with EXIF orientation**: Should respect orientation metadata
- **Very complex image** (photo with many details): May produce very large SVG, should warn user
- **Simple image** (logo with few colors): Should produce compact, optimized SVG
- **Rapid setting changes**: Debounce should prevent excessive conversions
- **Conversion during navigation**: Should cancel or complete gracefully if user navigates away
- **Multiple rapid uploads**: Should handle file replacement correctly
- **Download before conversion complete**: Button should be disabled
- **Browser without File API support**: Should degrade gracefully with message (very rare)
- **Out of memory**: Should catch error and display helpful message
- **Network offline**: Should still work (client-side only, no network needed)

## Acceptance Criteria

1. **Tool Visibility**:
   - Image to SVG tool appears on the homepage with correct title, description, and icon
   - Tool is accessible via /tools/image-to-svg route
   - Tool card follows the same design pattern as other tools

2. **File Upload**:
   - Accepts PNG, JPEG, WebP, BMP, and GIF images
   - Supports drag-and-drop and click-to-browse upload methods
   - Validates file format and displays error for unsupported types
   - Validates file size (<10MB) and displays error if too large
   - Validates image dimensions (<4096x4096) and displays error if too large
   - Displays preview of uploaded image

3. **Image-to-SVG Conversion**:
   - Converts raster images to SVG format using image tracing
   - Conversion completes in reasonable time (1-20 seconds depending on image complexity)
   - Displays progress bar with stage indicators during conversion
   - Generated SVG is valid XML and displays correctly in browsers
   - Generated SVG maintains visual similarity to original image
   - Conversion happens client-side with no server uploads

4. **Conversion Options**:
   - Preset buttons available: Logo, Photo, Icon, Illustration
   - Each preset applies optimized settings for that use case
   - Color mode selector: Full Color, Grayscale, Black & White
   - Color precision slider: 2-64 colors
   - Path precision selector: Low, Medium, High
   - Threshold slider (for black & white mode)
   - Simplification slider for path smoothing
   - Advanced options collapsible section
   - Reset to defaults button

5. **Auto-Conversion**:
   - Auto-convert toggle enabled by default
   - When enabled, changing settings automatically reconverts after 500ms debounce
   - When disabled, manual "Convert" button appears
   - Prevents excessive conversions during rapid slider adjustments

6. **Preview and Comparison**:
   - Side-by-side preview: original image vs generated SVG
   - View mode toggle: Original Only, Split View, SVG Only
   - Zoom controls: zoom in, zoom out, reset zoom (25%-400%)
   - Displays file sizes: original size, SVG size, compression ratio
   - Shows processing time after conversion completes
   - Preview updates in real-time as conversion completes
   - Preview is responsive and maintains aspect ratio

7. **Download Functionality**:
   - Download button saves generated SVG file
   - Downloaded file has correct filename: `[original-name].svg`
   - Downloaded SVG is valid and opens in browsers and design tools
   - Downloaded SVG matches the preview
   - Download button is disabled until conversion completes

8. **Reset Functionality**:
   - Reset button clears all state and returns to upload screen
   - Reset clears uploaded file, conversion result, and errors
   - Reset optionally resets settings to defaults
   - Reset button is always accessible

9. **Validation and Error Handling**:
   - Invalid file format shows clear error message
   - File too large shows error with size limit
   - Image dimensions too large shows error with dimension limit
   - Corrupted image shows error message
   - Conversion failures are caught and displayed to user
   - All errors include suggestions for resolution
   - Errors clear when user takes corrective action

10. **User Interface**:
    - Page follows the standard tool template (header with back link, theme toggle)
    - Layout is responsive (single column on mobile, two columns on desktop)
    - All interactive elements have hover, focus, and active states
    - Typography and spacing are consistent with other tools
    - Informational section explains SVG benefits, use cases, and tips
    - Loading states are clear (spinners, progress bars)
    - Success states are indicated (checkmarks, animations)

11. **Dark Mode Support**:
    - All UI elements are visible and properly styled in dark mode
    - Text, borders, backgrounds, buttons adapt correctly to dark theme
    - Theme toggle is present and functional on the tool page
    - Preview images are visible against dark background
    - No contrast or readability issues in dark mode

12. **Accessibility**:
    - All form controls are keyboard accessible
    - Tab order is logical and intuitive
    - Focus indicators are visible on all interactive elements
    - All inputs have associated labels
    - Error messages are announced to screen readers
    - Color contrast meets WCAG AA standards in both themes
    - Buttons have clear labels or aria-labels
    - ARIA attributes used appropriately (roles, live regions)

13. **Performance**:
    - Conversion completes in reasonable time (1-20 seconds)
    - Debouncing prevents excessive reconversions
    - No memory leaks with repeated conversions
    - Object URLs are properly revoked
    - Page loads quickly
    - Smooth interactions with no lag or freezing

14. **Browser Compatibility**:
    - Works correctly in Chrome, Firefox, Safari, and Edge
    - Upload and download functionality works in all browsers
    - Canvas API supported in all browsers
    - File API supported in all browsers
    - No console errors in any browser

15. **Privacy**:
    - All processing happens client-side in the browser
    - No image data is sent to any server
    - No uploads, no tracking, no data collection
    - Privacy note is clearly stated on the page

16. **Code Quality**:
    - TypeScript types are properly defined for all components and functions
    - No ESLint errors or warnings
    - Build completes successfully with no errors
    - Code follows existing project conventions and patterns
    - All files are properly organized
    - JSDoc comments on utility functions
    - No unused imports or variables
    - Proper error handling throughout

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm run lint` - Run linting to validate code quality. Must complete with zero errors and zero warnings (or only acceptable warnings).

- `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm run build` - Build the Next.js app to validate there are no TypeScript errors, type checking issues, or build failures. Must complete successfully with exit code 0.

- `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm run dev` - Start the development server and manually test the Image to SVG feature:
  - Navigate to http://localhost:3000
  - Verify "Image to SVG" tool card appears on homepage with correct icon (Image or Sparkles) and description
  - Click on the Image to SVG card
  - Verify page loads at /tools/image-to-svg
  - Verify theme toggle appears in top-right corner
  - Verify back link navigates to homepage
  - **Upload a simple logo PNG**:
    - Drag and drop a PNG logo into upload zone
    - Verify image preview loads
    - Verify file info displays (name, size, dimensions)
  - **Test Logo preset**:
    - Click "Logo" preset button
    - Verify conversion starts automatically within 500ms
    - Watch progress bar advance through stages: Loading → Tracing → Generating → Optimizing
    - Verify conversion completes in 1-5 seconds
    - Verify SVG preview displays on right side
    - Verify side-by-side comparison shows original and SVG
    - Verify file size comparison shows (Original: X KB, SVG: Y KB, Ratio: Z%)
    - Verify SVG is smaller or similar size to PNG for simple logo
  - **Test download**:
    - Click "Download SVG" button
    - Verify SVG file downloads with correct filename (logo.svg)
    - Locate downloaded file in downloads folder
    - Open SVG in browser (drag into address bar or File > Open)
    - Verify SVG displays correctly and matches preview
    - Open SVG in text editor (VS Code, Notepad++)
    - Verify valid XML structure with `<svg>` root element
    - Verify `viewBox` attribute is present
  - **Test different presets**:
    - Click "Photo" preset
    - Verify settings change (more colors, higher detail)
    - Verify reconversion happens automatically
    - Verify SVG preview updates with more detailed output
    - Click "Icon" preset
    - Verify simplified output with fewer colors
  - **Test parameter adjustments**:
    - Adjust color precision slider from 8 to 32
    - Verify conversion triggers after 500ms (debounced)
    - Verify SVG preview updates showing more colors
    - Change color mode to "Grayscale"
    - Verify SVG converts to grayscale
    - Change color mode to "Black & White"
    - Verify threshold slider appears
    - Adjust threshold slider
    - Verify SVG updates with different edge detection
  - **Test with photo JPEG**:
    - Click "Reset" button
    - Verify upload zone reappears
    - Upload a photo JPEG image
    - Click "Photo" preset
    - Verify conversion with many colors
    - Verify processing takes 3-10 seconds (more complex)
    - Verify SVG file size may be larger than JPEG (expected for photos)
    - Compare visual quality of original vs SVG in preview
  - **Test zoom controls**:
    - Click zoom in (+) button
    - Verify both images zoom in
    - Click zoom out (-) button
    - Verify both images zoom out
    - Click reset zoom button
    - Verify return to 100%
  - **Test view modes**:
    - Click "Original Only" view mode
    - Verify only original image shows
    - Click "SVG Only" view mode
    - Verify only SVG shows
    - Click "Split View"
    - Verify both images show side-by-side
  - **Test error handling**:
    - Click "Reset"
    - Try to upload a PDF file (unsupported)
    - Verify error message: "Unsupported file format"
    - Upload a PNG image >10MB (if available)
    - Verify error message about file size limit
  - **Test auto-convert toggle**:
    - Upload an image
    - Disable "Auto-convert" checkbox
    - Change color precision slider
    - Verify conversion does NOT happen automatically
    - Verify "Convert" button appears
    - Click "Convert" button manually
    - Verify conversion happens
    - Enable "Auto-convert" checkbox again
    - Change a setting
    - Verify conversion happens automatically
  - **Test dark mode**:
    - Toggle dark mode using theme toggle in top-right
    - Verify all UI elements are visible and styled correctly:
      - Page background
      - Upload zone
      - Config panel with sliders and radio buttons
      - Preview containers
      - Buttons (Download, Reset, Convert)
      - Text and labels
      - Borders and shadows
    - Verify preview images are visible against dark background
    - Verify proper contrast throughout
    - Toggle back to light mode
    - Verify everything still works correctly
  - **Test responsive layout**:
    - Resize browser window to mobile width (375px)
    - Verify single column layout (config above, preview below)
    - Verify all controls are accessible and usable
    - Verify text is readable
    - Verify buttons are tappable
    - Resize back to desktop width (1920px)
    - Verify two-column layout (config left, preview right)
  - **Test keyboard navigation**:
    - Tab through all interactive elements
    - Verify focus indicators are visible
    - Verify logical tab order
    - Press Enter on "Convert" button (if in manual mode)
    - Verify conversion triggers
    - Press Enter on "Download" button
    - Verify download triggers
  - **Test browser console**:
    - Open browser DevTools console (F12)
    - Perform all above tests
    - Verify NO errors appear in console
    - Verify NO warnings appear (or only acceptable warnings)
  - **Test in multiple browsers**:
    - Test in Chrome: All features work
    - Test in Firefox: All features work
    - Test in Safari (if available): All features work
    - Test in Edge: All features work
  - **Test existing tools for regressions**:
    - Navigate back to homepage using back link
    - Verify homepage still displays correctly
    - Click on "HEIC to JPEG" tool
    - Verify tool loads and works correctly (no regressions)
    - Navigate back to homepage
    - Click on "PDF Merger" tool
    - Verify tool loads and works correctly (no regressions)
    - Navigate back to homepage
    - Verify "Image to SVG" tool still appears and works

## Notes

### Library Selection: imagetracerjs

The **imagetracerjs** library is recommended for this implementation because:

- **Pure JavaScript**: Works entirely in the browser, no Node.js or WebAssembly required
- **Client-side compatible**: No server-side processing needed, aligns with project's privacy-first approach
- **Good quality output**: Produces clean, accurate SVG paths with customizable precision
- **Extensive customization**: Supports color quantization, path simplification, edge detection, and more
- **Reasonable bundle size**: Approximately 50-100 KB minified, acceptable overhead
- **Active maintenance**: Regularly updated and well-documented
- **No dependencies**: Standalone library reduces dependency tree complexity
- **MIT licensed**: Permissive license suitable for all use cases

Alternative libraries considered but not chosen:
- **potrace**: Excellent quality but requires Node.js or WebAssembly build, more complex setup
- **primitive.js**: Different aesthetic (geometric primitives), produces stylized rather than accurate traces
- **vectorizer/svg-trace**: Online services requiring API calls, violates privacy-first approach

### Image-to-SVG Conversion Concepts

**How Image Tracing Works:**
1. **Image Loading**: Raster image is loaded into HTML5 Canvas
2. **Color Quantization**: Reduce colors to manageable palette (2-64 colors)
3. **Edge Detection**: Identify boundaries between color regions
4. **Path Tracing**: Convert pixel boundaries to vector paths (Bezier curves)
5. **Path Simplification**: Smooth paths by reducing control points
6. **SVG Generation**: Combine paths into SVG structure with viewBox

**Key Parameters:**
- **Number of Colors**: More colors = more accurate but larger file size
- **Path Precision**: Higher precision = smoother curves but more complex paths
- **Simplification**: Higher smoothing = cleaner paths but lost fine details
- **Threshold**: (Black & white mode) Controls edge detection sensitivity

**Trade-offs:**
- **Quality vs File Size**: More detail = larger SVG files
- **Photos vs Logos**: Photos need many colors (large SVGs), logos need few colors (small SVGs)
- **Processing Time**: Complex images with many colors take longer to trace

### SVG Benefits and Use Cases

Information to educate users on the tool page:

**When to Use SVG:**
- **Logos and branding**: Always crisp at any size, perfect for responsive design
- **Icons and UI elements**: Scalable for retina displays and various screen sizes
- **Illustrations**: Clean, vector-based artwork for web and print
- **Print materials**: Infinite resolution for posters, banners, business cards
- **Web graphics**: Smaller file sizes for simple graphics, faster page loads
- **Animations**: SVGs can be animated with CSS or JavaScript
- **SEO**: SVG text is searchable and indexable by search engines

**When NOT to Use SVG:**
- **Complex photos**: JPEG or WebP are more efficient for photographs
- **Large images with many gradients**: Raster formats are smaller and faster
- **Browser compatibility concerns**: Very old browsers (<IE9) don't support SVG

**SVG Advantages:**
- Resolution-independent (scales infinitely without quality loss)
- Smaller file sizes for simple graphics (compared to PNG)
- Editable as code (XML text format)
- Stylable with CSS
- Animatable with CSS or JavaScript
- Accessible (alt text, ARIA labels, screen reader friendly)

### Conversion Presets Explained

**Logo Preset:**
- Limited colors (8): Logos typically use brand colors only
- High path precision: Crisp, clean edges
- Black & white or grayscale: Simplest logos
- Use case: Company logos, badges, emblems
- Output: Very compact SVG, small file size

**Photo Preset:**
- Many colors (64): Attempt to preserve color richness
- High path precision: Maximum detail
- Full color mode: All color information
- Use case: Converting photos to artistic SVG renderings
- Output: Large SVG file, complex paths
- Note: Not recommended for realistic photo reproduction

**Icon Preset:**
- Moderate colors (16): Typical for flat design icons
- Medium path precision: Balance of detail and simplicity
- Simplified paths: Clean, minimal look
- Use case: UI icons, app icons, web icons
- Output: Small to medium SVG, clean shapes

**Illustration Preset:**
- Balanced colors (32): Suitable for artwork with varied palette
- Medium path precision: Good detail without excessive complexity
- Moderate simplification: Smooth but detailed
- Use case: Digital art, drawings, diagrams
- Output: Medium SVG, good visual quality

### Optimization Best Practices

**For Smaller SVG Files:**
- Reduce number of colors (use Logo or Icon preset)
- Increase simplification tolerance (smoother, fewer paths)
- Lower path precision (acceptable for simple graphics)
- Use black & white mode for line art
- Remove background if transparent output is acceptable

**For Higher Quality:**
- Increase number of colors (Photo preset)
- Increase path precision (High setting)
- Lower simplification (preserve fine details)
- Use full color mode

**General Tips:**
- Start with high-quality source images (PNG preferred over JPEG)
- Use simple, clean images (avoid noise, compression artifacts)
- Test generated SVG in target application before finalizing
- Preview at intended display size to check quality
- Compare file sizes: sometimes PNG is more efficient than SVG

### Privacy and Security

**Privacy Guarantees:**
- All processing happens client-side in the browser
- No image data is uploaded to any server
- No tracking, analytics, or data collection
- No account required, no login
- Generated SVGs are not stored or cached on any server
- Safe to use with confidential or sensitive images

**Browser Security:**
- File API used for local file reading (standard browser API)
- Canvas API used for image processing (sandboxed, secure)
- Blob URLs are temporary and cleaned up properly
- No eval() or unsafe code execution

### Future Enhancements

Potential features for future iterations:

- **Batch conversion**: Convert multiple images to SVG in one operation, download as ZIP
- **Remove background**: Automatically detect and remove solid backgrounds
- **Add logo/watermark**: Overlay custom SVG logo on output
- **Custom color palette**: Allow users to specify exact colors to use in output
- **SVG editor integration**: Basic path editing after conversion
- **Export as other formats**: Export SVG as PNG, PDF (rasterize with chosen dimensions)
- **Compare mode enhancements**: Slider to reveal original/SVG, difference highlighting
- **History/undo**: Keep conversion history, allow reverting to previous settings
- **Save presets**: Allow users to save custom preset configurations
- **Import SVG**: Upload SVG and re-vectorize at different settings
- **Advanced filters**: Posterize, blur, sharpen before conversion
- **AI-powered tracing**: Use ML models for intelligent edge detection and path generation

### Technical Implementation Notes

**Memory Management:**
Critical to avoid memory leaks when handling images and blobs:
```typescript
useEffect(() => {
  return () => {
    // Clean up object URLs when component unmounts or fileState changes
    if (fileState.imageDataUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(fileState.imageDataUrl);
    }
    if (fileState.result?.svgDataUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(fileState.result.svgDataUrl);
    }
  };
}, [fileState]);
```

**Debouncing Auto-Conversion:**
Prevent excessive conversions during rapid setting adjustments:
```typescript
useEffect(() => {
  if (!isAutoConvert || !fileState.file || fileState.status !== 'completed') {
    return;
  }

  const timer = setTimeout(() => {
    handleConvert();
  }, 500); // 500ms debounce

  return () => clearTimeout(timer);
}, [conversionOptions, isAutoConvert]);
```

**Progress Tracking:**
ImageTracer doesn't provide built-in progress callbacks, so simulate progress:
```typescript
async function convertImageToSVG(
  file: File,
  options: SVGConversionOptions,
  onProgress?: (progress: number) => void
): Promise<ConversionResult> {
  onProgress?.(10); // Start

  const canvas = await loadImageToCanvas(file);
  onProgress?.(30); // Image loaded

  // ImageTracer.imageToSVG is synchronous, so can't report progress during tracing
  // Show indeterminate progress or simulate stages
  onProgress?.(50); // Tracing...

  const svgString = ImageTracer.imageToSVG(canvas, tracerOptions);
  onProgress?.(80); // Tracing complete

  const optimized = optimizeSVG(svgString);
  onProgress?.(95); // Optimized

  const blob = new Blob([optimized], { type: 'image/svg+xml' });
  onProgress?.(100); // Done

  return { svgBlob: blob, /* ... */ };
}
```

**Canvas Size Limits:**
Browsers have limits on canvas dimensions (typically 4096x4096 or 8192x8192):
```typescript
const MAX_CANVAS_DIMENSION = 4096;

if (image.width > MAX_CANVAS_DIMENSION || image.height > MAX_CANVAS_DIMENSION) {
  // Scale down image to fit within limits while preserving aspect ratio
  const scale = Math.min(
    MAX_CANVAS_DIMENSION / image.width,
    MAX_CANVAS_DIMENSION / image.height
  );
  // Resize canvas and draw scaled image
}
```

**SVG Optimization:**
Basic optimization to reduce file size without external libraries:
```typescript
function optimizeSVG(svgString: string): string {
  return svgString
    // Remove XML declaration if present
    .replace(/<\?xml[^>]*\?>/g, '')
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove unnecessary whitespace between tags
    .replace(/>\s+</g, '><')
    // Round decimal numbers to 2 places
    .replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(2))
    // Remove default fill="black" (implied)
    .replace(/fill="black"/g, '')
    .trim();
}
```

### Testing Notes

**Sample Images for Testing:**
- **Simple logo**: PNG with 2-3 flat colors, transparency, clean edges
- **Complex logo**: PNG with gradients, shadows, multiple colors
- **Icon**: Simple flat design icon, 512x512px
- **Illustration**: Digital art with varied colors and details
- **Photo**: JPEG photograph, realistic image
- **Line art**: Black and white sketch or drawing
- **Text**: Image containing text (test readability after conversion)

**Quality Evaluation:**
- Visual comparison: Does SVG look similar to original?
- Edge sharpness: Are edges crisp or jagged?
- Color accuracy: Are colors preserved correctly?
- File size: Is SVG size reasonable for the quality?
- Scannability: Can SVG be edited in design tools?
- Browser rendering: Does SVG display correctly across browsers?

**Performance Benchmarks:**
- Small image (100KB, 500x500px): <2 seconds
- Medium image (1MB, 1000x1000px): 2-5 seconds
- Large image (5MB, 2000x2000px): 5-10 seconds
- Maximum image (10MB, 4096x4096px): 10-20 seconds

If conversions consistently take longer, consider:
- Reducing default color count
- Lowering default path precision
- Adding warning for very large images
- Implementing Web Workers for non-blocking conversion

### Browser Compatibility

**Minimum Browser Versions:**
- Chrome 90+ (Canvas API, File API, Blob API)
- Firefox 88+ (Canvas API, File API, Blob API)
- Safari 14+ (Canvas API, File API, Blob API)
- Edge 90+ (Chromium-based)

**Required APIs:**
- File API: Reading uploaded files
- Canvas API: Image processing and manipulation
- Blob API: Creating downloadable files
- URL.createObjectURL: Creating preview URLs
- FileReader API: Loading images as data URLs

**Known Issues:**
- Safari: May have stricter canvas size limits
- Mobile browsers: Limited memory may affect large image processing
- Very old browsers (<2019): Not supported, show graceful degradation message

### Bundle Size Considerations

The imagetracerjs library will add approximately 50-100 KB to the client bundle. This is acceptable given:
- Client-side processing provides privacy benefits
- No backend infrastructure or API costs
- One-time download, cached by browser
- Comparable to other tool libraries (heic2any, pdf-lib)

To minimize impact:
- Ensure tree-shaking is enabled (Next.js does this automatically)
- Consider code splitting if bundle size becomes a concern
- Only import necessary functions from imagetracerjs (if possible)
- Verify imagetracerjs is only loaded when Image to SVG tool is accessed

### Accessibility Considerations

**Screen Reader Announcements:**
- Announce file upload success: "Image uploaded: filename.png"
- Announce conversion start: "Converting image to SVG..."
- Announce conversion complete: "Conversion complete. SVG ready for download."
- Announce errors: "Error: {error message}"

**Keyboard Shortcuts (Optional):**
- Ctrl/Cmd + S: Download SVG
- Ctrl/Cmd + R: Reset
- Ctrl/Cmd + U: Upload file (focus upload zone)
- Esc: Cancel operation (if cancellation implemented)

**ARIA Live Regions:**
```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {fileState.status === 'processing' && (
    <span>Converting image, {fileState.progress}% complete</span>
  )}
  {fileState.status === 'completed' && (
    <span>Conversion complete</span>
  )}
  {fileState.status === 'error' && (
    <span>Error: {fileState.error}</span>
  )}
</div>
```

### Development Workflow

**Recommended Development Steps:**
1. Install imagetracerjs and test in isolation
2. Create type definitions first (guides implementation)
3. Build utility functions (lib/image-to-svg.ts)
4. Build components (preview, config panel) independently
5. Build main page integrating all pieces
6. Test with sample images throughout development
7. Style and polish incrementally
8. Test across browsers and devices
9. Run validation commands
10. Deploy and gather user feedback

**Debugging Tips:**
- Console.log SVG string length to verify generation
- Download SVG and inspect in text editor for validity
- Use browser DevTools to inspect canvas elements
- Monitor memory usage in DevTools Performance tab
- Test with verbose error logging enabled during development
- Keep sample images in a test folder for consistent testing
