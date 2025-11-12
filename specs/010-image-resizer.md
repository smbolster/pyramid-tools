# Feature: Image Resizer

## Feature Plan Created: specs/010-image-resizer.md

## Feature Description

Implement a server-side image resizer tool that allows users to upload images (JPEG, PNG, WebP, GIF, AVIF, TIFF) and resize them to custom dimensions or predefined presets. The tool will use the Sharp library for high-performance image processing on the server, supporting multiple resize modes (fit, fill, cover, contain, inside, outside), aspect ratio preservation, and quality settings. Users can upload multiple images at once and download either individual resized images or a ZIP archive containing all processed images. The resizer will be accessible from the existing "Image Resizer" card on the homepage and will follow the established application patterns for file upload, processing, and download.

## User Story

As a user with images that need resizing
I want to upload and resize images to specific dimensions or presets
So that I can quickly prepare images for web, social media, email attachments, or other purposes without installing desktop software

## Problem Statement

Users frequently need to resize images for various purposes such as:
- Reducing file size for email attachments or web uploads
- Preparing images for social media platforms with specific dimension requirements
- Creating thumbnails or previews
- Optimizing images for web performance
- Batch resizing multiple images consistently

Currently, users must either:
- Install desktop software (Photoshop, GIMP, Preview on macOS)
- Use online services that may have privacy concerns or require registration
- Write custom scripts or use command-line tools

The "Image Resizer" card already exists on the homepage but has no implementation, indicating this feature was planned but not yet built. Users need a simple, fast, privacy-respecting tool that can resize images without requiring software installation or complex configuration.

## Solution Statement

Implement a server-side image resizer tool that:

1. **Server-Side Processing**: Use Sharp library for fast, efficient image resizing on the server
   - Already installed as a Next.js dependency
   - High performance (fastest Node.js image processing library)
   - Supports all common image formats (JPEG, PNG, WebP, GIF, AVIF, TIFF, SVG)

2. **Flexible Resize Options**:
   - **Custom dimensions**: Enter specific width and height in pixels
   - **Predefined presets**:
     - Social Media (Instagram Post: 1080×1080, Instagram Story: 1080×1920, Twitter: 1200×675, Facebook: 1200×630)
     - Web (Thumbnail: 150×150, Small: 320×240, Medium: 640×480, Large: 1280×720, HD: 1920×1080)
     - Common Sizes (Avatar: 256×256, Icon: 512×512, Banner: 1920×480)
   - **Resize modes**: Fit (preserve aspect ratio), Fill (crop to exact dimensions), Cover, Contain, Inside, Outside
   - **Quality settings**: JPEG/WebP quality slider (1-100)
   - **Format conversion**: Optional output format selection

3. **API Endpoint** (`/api/resize-image`):
   - Accept multipart/form-data with image files and resize parameters
   - Validate files (size, type, count limits)
   - Process images using Sharp with specified parameters
   - Return resized images as base64-encoded data in JSON response
   - Support batch processing (up to 20 images)

4. **User Interface**:
   - Follow existing tool patterns (FileUploadZone, progress tracking, download)
   - Resize options panel (dimensions, mode, quality, format)
   - Live preview of resize settings
   - Display original and resized dimensions/file sizes
   - Download individual images or ZIP archive for batch resizing

5. **Privacy & Performance**:
   - All processing happens on server (consistent performance)
   - Files processed in memory (no disk storage)
   - Immediate cleanup after processing
   - Fast processing with Sharp (typically <1 second per image)

This solution provides a professional-grade image resizing tool that's fast, easy to use, and privacy-respecting, completing the planned feature indicated by the existing homepage card.

## Relevant Files

Use these files to implement the feature:

- **app/lib/tools.ts** - Contains the tools array with the existing "image-resizer" entry. The card already exists with id "image-resizer", name "Image Resizer", description "Resize images to custom dimensions", icon "Maximize2", href "/tools/image-resizer", and category "Image Editing". No changes needed to this file.

- **app/components/file-upload-zone.tsx** - Reusable file upload component used by all file-based tools. Will be used for image upload with accept="image/*" and appropriate validation. No changes needed, works as-is for image uploads.

- **app/components/conversion-progress.tsx** - Progress display component. Can be reused to show resize progress for each image. May need minor updates to show "Resizing..." status instead of "Converting...".

- **app/lib/zip-utils.ts** - ZIP archive creation utility using JSZip. Will be used to create ZIP archives when multiple images are resized. No changes needed.

- **app/app/tools/heic-to-jpeg/page.tsx** - Reference implementation for server-side image processing with file upload, progress tracking, and download. Similar patterns will be used for the image resizer page.

- **app/app/api/convert-heic/route.ts** - Reference implementation for Next.js API route with file upload handling, server-side processing, and response generation. Similar patterns will be used for the resize API endpoint.

### New Files

- **app/app/tools/image-resizer/page.tsx** - Main image resizer page component. Implements:
  - File upload zone for image selection
  - Resize options panel (dimensions, presets, mode, quality, format)
  - Preview of resize settings
  - Progress tracking during processing
  - Download functionality (single image or ZIP)
  - State management for files and resize settings
  - Integration with resize API endpoint

- **app/app/api/resize-image/route.ts** - Next.js API route handler for server-side image resizing. Implements:
  - POST endpoint accepting multipart/form-data
  - Image file validation (type, size, count)
  - Resize parameter parsing (width, height, mode, quality, format)
  - Sharp-based image processing
  - Base64-encoded JSON response with resized images
  - Comprehensive error handling
  - Support for batch processing

- **app/types/image-resizer.ts** - TypeScript type definitions for image resizer. Includes:
  - ResizeMode enum (fit, fill, cover, contain, inside, outside)
  - ImageFormat enum (jpeg, png, webp, gif, avif, tiff)
  - ResizeOptions interface (width, height, mode, quality, format)
  - ResizePreset interface for predefined presets
  - FileResizeState interface for tracking resize progress
  - API request/response types
  - Error types and constants

- **app/lib/image-resizer.ts** - Client-side utility functions for image resizing. Includes:
  - uploadAndResizeImages() - API client for uploading and resizing
  - Predefined resize presets (social media, web, common sizes)
  - Image file validation
  - base64ToBlob() conversion
  - Helper functions for format detection and filename generation

- **app/components/resize-options-panel.tsx** - Reusable component for resize settings UI. Implements:
  - Preset selector dropdown
  - Custom dimension inputs (width/height)
  - Resize mode selector (fit, fill, cover, etc.)
  - Quality slider (for JPEG/WebP)
  - Output format selector
  - Aspect ratio lock toggle
  - Preview of resulting dimensions

## Implementation Plan

### Phase 1: Foundation

1. Verify Sharp library is installed and available (already installed via Next.js)
2. Create type definitions for image resizer (ResizeMode, ImageFormat, ResizeOptions, etc.)
3. Define predefined resize presets (social media sizes, web sizes, common sizes)
4. Establish file validation rules (max size 10MB per file, 100MB total, max 20 files)
5. Create client-side utility functions (validation, API client, helpers)
6. Plan resize modes and their Sharp configuration (fit, fill, cover, contain, inside, outside)

### Phase 2: Core Implementation

1. Create API route handler at `/api/resize-image`
2. Implement file upload handling and validation
3. Implement Sharp-based image resizing with all resize modes
4. Implement format conversion support (JPEG, PNG, WebP, GIF, AVIF, TIFF)
5. Implement quality settings for lossy formats
6. Generate base64-encoded responses with metadata
7. Add comprehensive error handling

### Phase 3: Integration

1. Create image resizer page component at `/tools/image-resizer`
2. Implement resize options panel component
3. Integrate file upload zone with image validation
4. Implement API integration and progress tracking
5. Add preview functionality showing original vs. resized dimensions
6. Implement download functionality (single file or ZIP)
7. Add responsive UI for mobile and desktop
8. Test end-to-end flow and optimize user experience

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Type Definitions

- Create `app/types/image-resizer.ts`
- Define `ResizeMode` enum: fit, fill, cover, contain, inside, outside
- Define `ImageFormat` enum: jpeg, png, webp, gif, avif, tiff
- Define `ResizeOptions` interface:
  - width?: number
  - height?: number
  - mode: ResizeMode
  - quality?: number (1-100)
  - format?: ImageFormat
  - maintainAspectRatio: boolean
- Define `ResizePreset` interface:
  - id: string
  - name: string
  - width: number
  - height: number
  - category: string
- Define `FileResizeState` interface:
  - file: File
  - status: ResizeStatus (pending, resizing, success, error)
  - progress: number
  - error?: string
  - preview?: string
  - resizedBlob?: Blob
  - originalDimensions?: { width: number; height: number }
  - resizedDimensions?: { width: number; height: number }
  - originalSize: number
  - resizedSize?: number
- Define API request/response types:
  - ResizeImageRequest, ResizedImage, ResizeImageResponse, ResizeImageError
- Define error messages constants
- Export constants: MAX_FILE_SIZE (10MB), MAX_TOTAL_SIZE (100MB), SUPPORTED_FORMATS

### 2. Create Client-Side Utilities

- Create `app/lib/image-resizer.ts`
- Define resize presets array:
  - **Social Media**: Instagram Post (1080×1080), Instagram Story (1080×1920), Twitter (1200×675), Facebook (1200×630), LinkedIn (1200×627)
  - **Web**: Thumbnail (150×150), Small (320×240), Medium (640×480), Large (1280×720), HD (1920×1080)
  - **Common**: Avatar (256×256), Icon (512×512), Banner (1920×480), Logo (400×300)
- Implement `validateImageFile()` function:
  - Check file size (max 10MB)
  - Check file type (image/jpeg, image/png, image/webp, image/gif, image/avif, image/tiff)
  - Return validation error or null
- Implement `uploadAndResizeImages()` function:
  - Accept files and resize options
  - Create FormData with files and options
  - POST to /api/resize-image
  - Parse JSON response
  - Return resized images array
  - Handle errors (network, server, validation)
- Implement `base64ToBlob()` for converting response data
- Implement `generateResizedFilename()` for creating output filenames
- Implement `detectImageDimensions()` for reading image dimensions client-side

### 3. Create API Route Handler

- Create `app/app/api/resize-image/route.ts`
- Import Sharp, Next.js types, and image resizer types
- Define MAX_FILES constant (20)
- Implement `validateImageFile()` function:
  - Check file size
  - Check file type (JPEG, PNG, WebP, GIF, AVIF, TIFF, SVG)
  - Return validation result
- Implement `resizeImage()` function:
  - Accept File and ResizeOptions
  - Read file into buffer
  - Create Sharp instance
  - Apply resize operation based on mode:
    - fit: resize to fit within dimensions (default)
    - fill: resize and crop to exact dimensions
    - cover: resize to cover dimensions (may crop)
    - contain: resize to fit and add background
    - inside: resize to fit inside dimensions
    - outside: resize to fit outside dimensions
  - Apply quality setting for JPEG/WebP
  - Convert to specified output format
  - Return buffer and metadata
- Implement POST handler:
  - Extract FormData (files and options)
  - Validate files (count, size, type)
  - Parse resize options from form data
  - Process each image with Sharp
  - Collect results and errors
  - Return JSON response with base64-encoded images
  - Handle errors with appropriate HTTP status codes

### 4. Create Resize Options Panel Component

- Create `app/components/resize-options-panel.tsx`
- Import necessary UI components (Button, Select, Input, Slider, Checkbox)
- Define ResizeOptionsPanelProps interface
- Implement component with sections:
  - **Preset Selector**: Dropdown grouped by category (Social Media, Web, Common, Custom)
  - **Custom Dimensions**: Width and height number inputs with px labels
  - **Aspect Ratio Lock**: Checkbox to maintain aspect ratio when changing dimensions
  - **Resize Mode**: Select dropdown with options (Fit, Fill, Cover, Contain, Inside, Outside)
  - **Quality**: Slider (1-100) for JPEG/WebP quality (conditionally shown)
  - **Output Format**: Select dropdown (Keep Original, JPEG, PNG, WebP, GIF, AVIF, TIFF)
- Add tooltips/descriptions for each option
- Emit onChange events when options change
- Style consistently with application theme

### 5. Create Image Resizer Page Component

- Create `app/app/tools/image-resizer/page.tsx`
- Import dependencies (React, components, utilities, types)
- Define state variables:
  - files: FileResizeState[]
  - resizeOptions: ResizeOptions (default: fit mode, quality 90)
  - isResizing: boolean
  - selectedPreset: string | null
- Implement `handleFilesSelected()`:
  - Initialize file states
  - Optionally detect image dimensions client-side
  - Set files state
- Implement `handleResize()`:
  - Set isResizing to true
  - Update file statuses to "resizing"
  - Call uploadAndResizeImages() with files and options
  - Process results and update file states
  - Convert base64 to blobs and create previews
  - Handle errors per file
  - Set isResizing to false
- Implement `handleResizeOptionsChange()`:
  - Update resizeOptions state
  - Clear selectedPreset if custom dimensions entered
- Implement `handlePresetSelected()`:
  - Update resizeOptions with preset dimensions
  - Set selectedPreset state
- Implement `handleDownload()`:
  - If single file: download directly
  - If multiple files: create ZIP and download
- Implement `handleReset()`:
  - Revoke preview URLs
  - Reset all state
- Render UI:
  - Header with title and back link
  - Theme toggle
  - File upload zone (when no files)
  - Resize options panel (when files selected but not resizing)
  - Progress display (during/after resizing)
  - Download buttons (after successful resize)
  - Info section about image resizing

### 6. Integrate Progress Display

- Review `app/components/conversion-progress.tsx`
- Determine if it needs modifications for resize use case
- If needed, make it more generic (rename "Converting" to "Processing")
- Or create `app/components/resize-progress.tsx` specific to image resizing
- Display original dimensions, resized dimensions, file sizes
- Show preview thumbnails
- Show success/error status for each file

### 7. Add Image Dimension Detection

- In page component, implement client-side dimension detection:
  - Create FileReader to read image files
  - Create Image element to load the data
  - Capture naturalWidth and naturalHeight
  - Store in file state as originalDimensions
- Display original dimensions in UI
- Calculate and display resulting dimensions based on resize options
- Show size reduction percentage

### 8. Implement Aspect Ratio Lock

- Add aspect ratio calculation in resize options panel
- When aspect ratio lock is enabled:
  - Store original aspect ratio
  - When width changes, auto-calculate height
  - When height changes, auto-calculate width
- Update UI to show lock/unlock icon

### 9. Add Format Conversion Support

- In API route, handle format conversion:
  - Detect input format
  - Apply output format if specified
  - Convert using Sharp's toFormat() method
  - Handle format-specific options (quality for JPEG/WebP)
- In client, update filename extension based on output format
- Display format change in UI (e.g., "JPEG → PNG")

### 10. Add Quality Slider

- In resize options panel, add quality slider
- Only show for lossy formats (JPEG, WebP)
- Range: 1-100, default: 90
- Show current value next to slider
- Update in real-time as slider moves
- Include description of quality levels (Low, Medium, High, Maximum)

### 11. Style and Polish

- Apply consistent styling with Tailwind CSS
- Use application theme colors (green primary)
- Add hover effects and transitions
- Ensure mobile responsiveness
- Add loading states and skeletons
- Implement proper spacing and layout
- Add helpful tooltips for resize modes
- Include examples of resize mode differences

### 12. Add Info Section

- Create info section at bottom of page (similar to HEIC converter)
- Include sections:
  - **Server-Side Processing**: Explain fast processing with Sharp
  - **Resize Modes**: Explain fit, fill, cover, etc. with visual examples
  - **Supported Formats**: List JPEG, PNG, WebP, GIF, AVIF, TIFF
  - **File Limits**: 10MB per file, 100MB total, 20 files max
  - **Quality Settings**: Explain quality slider effect on file size
  - **Privacy**: Files processed in memory, immediately deleted

### 13. Implement Error Handling

- Handle validation errors client-side (file size, type)
- Handle API errors (network, server, processing)
- Display clear error messages per file
- Allow retry for failed resizes
- Handle edge cases (invalid dimensions, unsupported formats)
- Log errors for debugging (console.error)

### 14. Add Download Functionality

- For single file:
  - Generate appropriate filename with new dimensions (e.g., "photo_1280x720.jpg")
  - Trigger direct blob download
- For multiple files:
  - Create ZIP using zip-utils
  - Name ZIP "resized-images.zip"
  - Include all successfully resized images
  - Trigger ZIP download

### 15. Test Client-Side Validation

- Test with valid image files (JPEG, PNG, WebP)
- Test with invalid file types (PDF, TXT, etc.)
- Test with oversized files (>10MB)
- Test with too many files (>20)
- Test with total size exceeding limit (>100MB)
- Verify error messages are clear and helpful

### 16. Test API Endpoint

- Use curl or Postman to test /api/resize-image
- Test successful single file resize
- Test successful batch resize
- Test with different resize modes (fit, fill, cover, etc.)
- Test with different output formats
- Test with quality settings
- Test error cases (invalid file, missing parameters, etc.)
- Verify response format and status codes

### 17. Test Resize Modes

- Test **Fit**: Image fits within dimensions, aspect ratio preserved
- Test **Fill**: Image fills dimensions exactly, may crop
- Test **Cover**: Image covers dimensions, may overflow
- Test **Contain**: Image contained within dimensions with background
- Test **Inside**: Image fits inside dimensions
- Test **Outside**: Image fits outside dimensions
- Verify each mode produces expected results

### 18. Test Format Conversion

- Test JPEG → PNG conversion
- Test PNG → JPEG conversion (lossy)
- Test WebP output
- Test GIF output
- Test AVIF output
- Test TIFF output
- Verify converted images are valid
- Verify file sizes change as expected

### 19. Test Quality Settings

- Test quality 100 (maximum, large file size)
- Test quality 90 (high quality, recommended)
- Test quality 75 (good quality, smaller size)
- Test quality 50 (medium quality)
- Test quality 25 (low quality, small size)
- Verify quality affects file size as expected
- Verify quality affects visual quality as expected

### 20. Test Preset Functionality

- Select each preset and verify dimensions are applied
- Test Instagram Post (1080×1080)
- Test Instagram Story (1080×1920)
- Test HD (1920×1080)
- Test Thumbnail (150×150)
- Verify preset overrides custom dimensions
- Verify switching presets updates dimensions

### 21. Test Aspect Ratio Lock

- Enable aspect ratio lock
- Change width, verify height auto-updates
- Change height, verify width auto-updates
- Disable lock, verify independent changes work
- Test with various aspect ratios (1:1, 16:9, 4:3, 9:16)

### 22. Test Batch Resizing

- Upload 2 images, verify both resize
- Upload 10 images, verify all resize
- Upload 20 images (max), verify all resize
- Test mixed success/failure scenarios
- Verify progress tracking for each file
- Verify ZIP download contains all files

### 23. Test Edge Cases

- Upload image with unusual dimensions (very wide, very tall)
- Upload very small image (upscale test)
- Upload very large image (downscale test)
- Test 0 width or height (should reject)
- Test negative dimensions (should reject)
- Test extremely large dimensions (10000×10000)
- Test aspect ratio calculations with edge cases
- Test format conversion edge cases

### 24. Test Performance

- Test single image resize time (<1 second expected)
- Test batch resize of 10 images (<10 seconds expected)
- Test with various image sizes (1MB, 5MB, 10MB)
- Verify Sharp performs efficiently
- Monitor memory usage during processing
- Verify no memory leaks after multiple operations

### 25. Test UI/UX

- Test file upload via drag-and-drop
- Test file upload via click and select
- Test preset selection from dropdown
- Test custom dimension input
- Test resize mode selection
- Test quality slider interaction
- Test format selection
- Verify all controls are accessible
- Verify loading states display correctly
- Verify error states display correctly

### 26. Test Mobile Responsiveness

- Test on mobile viewport (DevTools or real device)
- Verify file upload works on mobile
- Verify resize options panel is usable
- Verify all controls fit on small screens
- Test touch interactions
- Verify downloads work on mobile
- Test in portrait and landscape orientations

### 27. Test Browser Compatibility

- Test in Chrome (latest)
- Test in Firefox (latest)
- Test in Safari (latest)
- Test in Edge (latest)
- Verify all features work consistently
- Verify no console errors
- Verify downloads work in each browser

### 28. Test Dark Mode

- Enable dark mode
- Verify page renders correctly
- Verify resize options panel is readable
- Verify progress display is visible
- Verify all text has proper contrast
- Verify images/previews display well
- Test theme toggle during resize operation

### 29. Test Accessibility

- Test keyboard navigation (Tab, Enter, Space)
- Test with screen reader (VoiceOver, NVDA)
- Verify all buttons have proper labels
- Verify form inputs have labels
- Verify ARIA attributes are correct
- Test focus management
- Verify color contrast meets WCAG standards
- Test with keyboard only (no mouse)

### 30. Integration Testing

- Navigate from homepage to image resizer
- Verify tool card link works
- Upload and resize images end-to-end
- Download results
- Use "Resize More Images" to reset
- Test multiple resize operations in sequence
- Verify no state pollution between operations
- Test navigation away and back to tool

### 31. Regression Testing

- Verify other tools still work (HEIC converter, PDF merger, etc.)
- Verify homepage displays correctly
- Verify dark mode works globally
- Verify navigation works throughout app
- Run linting to check for code quality issues
- Run build to verify no TypeScript errors

### 32. Performance Optimization

- Verify Sharp is using native binaries (check install logs)
- Ensure no unnecessary re-renders in React
- Optimize preview generation
- Consider lazy loading resize options panel
- Verify bundle size impact is minimal
- Test with production build

### 33. Documentation

- Add JSDoc comments to API route functions
- Add JSDoc comments to utility functions
- Add inline comments explaining resize logic
- Document resize modes in code comments
- Document Sharp configuration choices

### 34. Final Validation

- Run all validation commands (lint, build)
- Perform complete end-to-end test
- Verify zero regressions
- Verify all acceptance criteria met
- Test critical user paths
- Verify error handling is comprehensive

## Testing Strategy

### Unit Tests

While the application doesn't currently have formal unit tests, these would be valuable to add:

- **API Route Handler Tests** (`app/api/resize-image/route.ts`):
  - Test successful single image resize
  - Test successful batch image resize
  - Test each resize mode (fit, fill, cover, contain, inside, outside)
  - Test format conversion (JPEG, PNG, WebP, etc.)
  - Test quality settings for JPEG/WebP
  - Test file validation (size, type, count)
  - Test error handling (invalid files, missing parameters, processing errors)
  - Mock Sharp library for predictable results

- **Client Utility Tests** (`app/lib/image-resizer.ts`):
  - Test uploadAndResizeImages() with various options
  - Test validateImageFile() with valid and invalid files
  - Test generateResizedFilename() with various inputs
  - Test base64ToBlob() conversion
  - Mock fetch API for testing

- **Resize Options Panel Tests**:
  - Test preset selection updates dimensions
  - Test aspect ratio lock calculations
  - Test custom dimension inputs
  - Test quality slider updates
  - Test format selection

### Integration Tests

Manual integration tests to perform:

- **Full Resize Flow**:
  - Upload single image → resize with custom dimensions → download
  - Upload multiple images → resize with preset → download ZIP
  - Test all resize modes produce expected results
  - Verify format conversion works correctly

- **UI Integration**:
  - File upload zone → resize options → progress display → download
  - Preset selection updates all related fields
  - Aspect ratio lock affects dimension inputs
  - Quality slider affects output file size

- **Error Flow**:
  - Upload invalid file → see error message
  - Upload oversized file → see error message
  - Network error → see error message
  - Processing error → see per-file error

### Edge Cases

- **File Validation Edge Cases**:
  - File with image extension but wrong MIME type
  - Corrupted image file
  - Image file with no extension
  - File exactly at size limit (10MB)
  - File 1 byte over size limit
  - 20 files (at limit)
  - 21 files (over limit)

- **Dimension Edge Cases**:
  - Width: 0 (should reject)
  - Height: 0 (should reject)
  - Negative dimensions (should reject)
  - Very large dimensions (10000×10000)
  - Upscaling small image (e.g., 50×50 → 1000×1000)
  - Extreme aspect ratios (1:100, 100:1)

- **Resize Mode Edge Cases**:
  - Fit mode with image larger than target
  - Fit mode with image smaller than target
  - Fill mode requiring crop
  - Cover mode with extreme aspect ratio difference
  - Contain mode with background fill

- **Format Conversion Edge Cases**:
  - PNG with transparency → JPEG (transparency lost)
  - GIF animation → static format (first frame only)
  - SVG input (should handle or reject gracefully)
  - TIFF multi-page (first page only)

- **Quality Edge Cases**:
  - Quality 1 (minimum)
  - Quality 100 (maximum)
  - Quality for PNG (should ignore, lossless)
  - Quality for GIF (should ignore)

- **Performance Edge Cases**:
  - 20 images × 10MB each (200MB, should reject)
  - Single 10MB image resize time
  - Batch resize 20 images simultaneously
  - Memory usage during processing

## Acceptance Criteria

### Functional Requirements

- [ ] Image resizer tool is accessible from homepage "Image Resizer" card at `/tools/image-resizer`
- [ ] API endpoint at `/api/resize-image` accepts POST requests with image files and resize parameters
- [ ] Supports common image formats: JPEG, PNG, WebP, GIF, AVIF, TIFF, SVG
- [ ] Validates files: max 10MB per file, 100MB total, 20 files max
- [ ] Implements all resize modes: fit, fill, cover, contain, inside, outside
- [ ] Provides predefined presets: Social Media (5), Web (5), Common (3)
- [ ] Allows custom dimension input (width and height in pixels)
- [ ] Supports aspect ratio lock for maintaining proportions
- [ ] Provides quality slider for JPEG/WebP (1-100)
- [ ] Supports format conversion to JPEG, PNG, WebP, GIF, AVIF, TIFF
- [ ] Displays original image dimensions and file size
- [ ] Displays resized image dimensions and file size
- [ ] Shows size reduction percentage
- [ ] Provides preview thumbnails of resized images
- [ ] Downloads single resized image directly
- [ ] Downloads ZIP archive for multiple resized images
- [ ] Shows progress during resize operation
- [ ] Displays clear error messages for validation and processing errors
- [ ] Processes images on server using Sharp library
- [ ] Returns base64-encoded images in JSON response

### Performance Requirements

- [ ] Single image resize completes in <1 second (typical case)
- [ ] Batch resize of 10 images completes in <10 seconds
- [ ] Page loads and is interactive within 2 seconds
- [ ] No memory leaks after multiple resize operations
- [ ] Sharp uses native binaries for optimal performance

### User Experience Requirements

- [ ] File upload works via drag-and-drop and click to select
- [ ] Preset selection automatically updates dimensions
- [ ] Custom dimension inputs update in real-time
- [ ] Aspect ratio lock maintains proportions when enabled
- [ ] Quality slider shows current value
- [ ] Format selector shows current selection
- [ ] Progress indicators show during processing
- [ ] Success states show preview thumbnails
- [ ] Error messages are specific and actionable
- [ ] Download buttons clearly labeled with file count
- [ ] "Resize More Images" button resets state
- [ ] UI is responsive on mobile devices (320px+)
- [ ] All controls are touch-friendly on mobile

### Technical Requirements

- [ ] Code follows existing project patterns and conventions
- [ ] TypeScript types are properly defined for all interfaces
- [ ] API route handles errors gracefully
- [ ] Sharp is used efficiently (no unnecessary operations)
- [ ] Files are processed in memory (no disk I/O)
- [ ] Resources are cleaned up after processing
- [ ] No console errors during normal operation
- [ ] ESLint passes with no new warnings
- [ ] Application builds successfully

### Quality Requirements

- [ ] Works in Chrome, Firefox, Safari, Edge (latest versions)
- [ ] Works on mobile devices (iOS Safari, Android Chrome)
- [ ] Dark mode works correctly throughout
- [ ] Keyboard navigation works for all controls
- [ ] Screen readers can navigate and understand states
- [ ] ARIA labels are descriptive
- [ ] Color contrast meets WCAG standards
- [ ] Focus management is logical
- [ ] No regressions to existing tools

### Documentation Requirements

- [ ] API route has JSDoc comments
- [ ] Utility functions have JSDoc comments
- [ ] Resize modes are documented in code
- [ ] Sharp configuration is explained in comments
- [ ] Info section explains resize modes to users

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

### Build and Lint Validation

- `cd app && npm run lint` - Run ESLint to ensure code quality. Must complete with zero errors. Verify no new warnings are introduced by the image resizer implementation.

- `cd app && npm run build` - Build the Next.js application to validate there are no TypeScript errors, build failures, or configuration issues. Must complete successfully with exit code 0. Verify the new API route appears in build output.

### End-to-End Manual Testing

Since the application doesn't have automated E2E tests, perform these manual tests:

1. **Navigate to Image Resizer**:
   - Start dev server: `cd app && npm run dev`
   - Open http://localhost:3050 in browser
   - Verify "Image Resizer" card appears on homepage
   - Click "Image Resizer" card
   - Verify navigation to http://localhost:3050/tools/image-resizer
   - Verify page loads without errors

2. **Test Single Image Resize with Preset**:
   - Upload a single JPEG image (e.g., a photo)
   - Select "HD (1920×1080)" preset from dropdown
   - Verify dimensions update to 1920×1080
   - Click "Resize" button
   - Verify progress indicator appears
   - Verify resize completes successfully
   - Verify preview thumbnail appears
   - Verify original and resized dimensions displayed
   - Verify original and resized file sizes displayed
   - Click "Download" button
   - Verify JPEG file downloads with filename like "photo_1920x1080.jpg"
   - Open downloaded image and verify it's 1920×1080 pixels
   - Verify image quality is good

3. **Test Multiple Image Resize with Custom Dimensions**:
   - Click "Resize More Images" to reset
   - Upload 3-5 JPEG images
   - Enter custom width: 800
   - Enter custom height: 600
   - Select "Fit" mode (maintain aspect ratio)
   - Click "Resize" button
   - Verify all images show progress
   - Verify all images complete successfully
   - Verify all show preview thumbnails
   - Click "Download ZIP Archive" button
   - Verify ZIP file downloads
   - Extract ZIP file
   - Verify ZIP contains correct number of resized images
   - Open images and verify they fit within 800×600 (maintaining aspect ratio)

4. **Test Format Conversion**:
   - Reset and upload a PNG image
   - Select "Small (640×480)" preset
   - Select output format: "JPEG"
   - Click "Resize"
   - Verify conversion completes
   - Download image
   - Verify downloaded file has .jpg extension
   - Verify it's a valid JPEG file

5. **Test Quality Settings**:
   - Reset and upload a JPEG image
   - Select "Medium (640×480)" preset
   - Move quality slider to 50
   - Click "Resize"
   - Download image (quality 50)
   - Note file size
   - Reset and repeat with quality 90
   - Download image (quality 90)
   - Compare file sizes (quality 90 should be larger)

6. **Test Aspect Ratio Lock**:
   - Reset and upload an image
   - Enable aspect ratio lock
   - Enter width: 1000
   - Verify height auto-updates to maintain aspect ratio
   - Enter height: 500
   - Verify width auto-updates to maintain aspect ratio
   - Disable lock
   - Enter width: 1000, height: 500
   - Verify both can be set independently

7. **Test Error Handling**:
   - Attempt to upload a non-image file (e.g., .txt)
   - Verify error message appears: "File must be an image"
   - Attempt to upload an image >10MB
   - Verify error message appears: "File size exceeds limit"
   - Attempt to resize without selecting files
   - Verify appropriate message or disabled state

8. **Test All Resize Modes**:
   - For each mode (Fit, Fill, Cover, Contain, Inside, Outside):
     - Upload an image with different aspect ratio than target
     - Select mode
     - Enter dimensions (e.g., 800×600)
     - Resize
     - Download and verify mode behavior is correct

9. **Test Mobile Responsiveness**:
   - Open DevTools and enable device emulation
   - Select iPhone or Android device
   - Navigate to image resizer
   - Verify UI is usable on mobile viewport
   - Test file upload on mobile
   - Test resize options on mobile
   - Verify download works on mobile

10. **Test Dark Mode**:
    - Enable dark mode using theme toggle
    - Navigate to image resizer
    - Verify page renders correctly in dark mode
    - Upload and resize images
    - Verify all UI elements are visible and readable
    - Verify previews display well in dark mode

11. **Test Browser Compatibility**:
    - Repeat core tests in Chrome
    - Repeat core tests in Firefox
    - Repeat core tests in Safari (if available)
    - Repeat core tests in Edge
    - Verify consistent behavior across browsers

12. **Test Accessibility**:
    - Use Tab key to navigate through all controls
    - Verify all buttons are keyboard accessible
    - Verify form inputs can be filled via keyboard
    - Press Enter/Space to activate buttons
    - Verify focus is visible on all elements
    - If possible, test with screen reader
    - Verify ARIA labels are read correctly

### Regression Testing

13. **Verify Other Tools Still Work**:
    - Navigate to HEIC to JPEG converter
    - Upload and convert a file
    - Verify it works correctly
    - Navigate to PDF Merger
    - Test merging PDFs
    - Verify it works correctly
    - Test QR Code Generator
    - Verify it works correctly
    - Navigate back to homepage
    - Verify all tool cards display correctly

14. **Verify No Console Errors**:
    - Open browser DevTools Console
    - Navigate through image resizer flow
    - Verify no errors appear in console
    - Verify no warnings appear (except pre-existing)

15. **Verify Build Output**:
    - Check build output from `npm run build`
    - Verify `/api/resize-image` appears as dynamic route
    - Verify `/tools/image-resizer` appears in routes
    - Verify no build errors or warnings

### API Testing

16. **Test API Endpoint Directly** (optional, using curl):
    ```bash
    # Test with sample image
    curl -X POST http://localhost:3050/api/resize-image \
      -F "files=@/path/to/sample.jpg" \
      -F "width=800" \
      -F "height=600" \
      -F "mode=fit" \
      -F "quality=90" \
      -o response.json
    ```
    - Verify response status is 200
    - Verify response contains resized image data
    - Verify response JSON structure is correct

### Final Checklist

- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] Image resizer accessible from homepage
- [ ] Single image resize and download works
- [ ] Multiple image resize and ZIP download works
- [ ] All resize modes work correctly (fit, fill, cover, contain, inside, outside)
- [ ] Presets apply correct dimensions
- [ ] Custom dimensions work
- [ ] Aspect ratio lock works
- [ ] Quality slider affects output
- [ ] Format conversion works
- [ ] Error handling works for invalid files
- [ ] Progress tracking displays correctly
- [ ] Preview thumbnails display
- [ ] Original and resized dimensions/sizes shown
- [ ] Works on mobile viewports
- [ ] Works in dark mode
- [ ] Keyboard navigation works
- [ ] Works in all major browsers
- [ ] No console errors
- [ ] No regressions to other tools
- [ ] API endpoint processes images correctly
- [ ] Sharp library performs efficiently
- [ ] Memory is managed properly

## Notes

### Library Usage

**Sharp** is already installed as a Next.js dependency and is widely regarded as the fastest and most powerful image processing library for Node.js. Key features:

- **Performance**: Uses libvips library for optimal speed (typically 4-5x faster than ImageMagick)
- **Format Support**: JPEG, PNG, WebP, GIF, AVIF, TIFF, SVG input; JPEG, PNG, WebP, GIF, AVIF, TIFF output
- **Resize Modes**: Comprehensive set of resize operations with various fit modes
- **Quality Control**: Precise control over output quality for lossy formats
- **Zero Dependencies**: Native binaries included, no external dependencies needed
- **Memory Efficient**: Streams data, handles large images efficiently

### Resize Mode Explanations

1. **Fit**: Resize to fit within specified dimensions while preserving aspect ratio (default, most common)
2. **Fill**: Resize and crop to fill exact dimensions, may crop parts of image
3. **Cover**: Resize to cover dimensions, may overflow, preserves aspect ratio
4. **Contain**: Resize to fit within dimensions, adds background if needed
5. **Inside**: Resize to fit inside dimensions, similar to fit
6. **Outside**: Resize to fit outside dimensions

### Preset Rationale

**Social Media Presets**:
- Instagram Post: 1080×1080 (square format)
- Instagram Story: 1080×1920 (vertical 9:16)
- Twitter: 1200×675 (horizontal 16:9)
- Facebook: 1200×630 (Open Graph standard)
- LinkedIn: 1200×627 (LinkedIn standard)

**Web Presets**:
- Thumbnail: 150×150 (small previews)
- Small: 320×240 (mobile-friendly)
- Medium: 640×480 (standard web)
- Large: 1280×720 (HD-ready)
- HD: 1920×1080 (Full HD)

**Common Presets**:
- Avatar: 256×256 (profile pictures)
- Icon: 512×512 (app icons)
- Banner: 1920×480 (website headers)

### File Size Limits

- **Per File**: 10MB maximum (reasonable for web images, prevents abuse)
- **Total**: 100MB maximum (allows 10 files at max size)
- **Count**: 20 files maximum (prevents excessive batch processing)

These limits are more generous than HEIC converter because image resizing is typically faster than HEIC conversion.

### Performance Expectations

- **Single Image**: <1 second typical (depending on size and complexity)
- **Batch Processing**: Linear scaling, ~0.5-1 second per image
- **Memory Usage**: Sharp is memory-efficient, processes images in streams
- **CPU Usage**: Sharp uses native code, efficient CPU usage

### Privacy Considerations

- All processing happens on server (consistent performance, no browser limitations)
- Files processed entirely in memory (no disk I/O)
- Images immediately discarded after processing
- No logging of image contents
- No storage of uploaded or resized images
- HTTPS encryption for file uploads (in production)

### Quality Settings

- **Quality 100**: Maximum quality, largest file size, minimal compression artifacts
- **Quality 90**: High quality, recommended default, good balance
- **Quality 75**: Good quality, smaller file size, slight artifacts
- **Quality 50**: Medium quality, significantly smaller, noticeable artifacts
- **Quality 25**: Low quality, very small, significant artifacts

### Format Conversion Considerations

- **PNG → JPEG**: Transparency will be lost (replaced with white or specified background)
- **GIF → static format**: Animation will be lost (first frame only)
- **SVG → raster**: Vector will be rasterized (not ideal, but supported)
- **TIFF multi-page**: First page only

### Future Enhancements

Potential improvements for future iterations (not in current scope):

1. **Advanced Features**:
   - Batch apply watermarks
   - Border/padding options
   - Background color selection
   - Image rotation
   - Flip/mirror options
   - Crop before resize

2. **Output Options**:
   - Multiple size outputs (generate thumbnail + full size)
   - Progressive JPEG output
   - Metadata preservation options
   - Custom compression algorithms

3. **Performance**:
   - Client-side preview before upload
   - Real-time dimension preview
   - Progress percentage for each file
   - Parallel processing optimization

4. **UX Improvements**:
   - Visual comparison (before/after slider)
   - Batch editing (apply same settings to all)
   - Save settings as custom preset
   - Recent presets history

5. **Enterprise Features**:
   - API key authentication
   - Higher file size limits for authenticated users
   - Batch processing API
   - Webhook notifications for large jobs

### Error Handling Strategy

**Client-Side**:
- Pre-validate files before upload (size, type)
- Display clear error messages
- Allow individual file removal
- Retry failed resizes

**Server-Side**:
- Validate all inputs
- Handle Sharp processing errors
- Return specific error codes
- Log errors for debugging
- Clean up resources on error

### Testing Notes

- Focus on resize mode differences (most complex feature)
- Test format conversion thoroughly (many edge cases)
- Verify Sharp performance (should be very fast)
- Test memory usage with large batches
- Ensure no memory leaks

### Development Tips

- Use Sharp documentation extensively: https://sharp.pixelplumbing.com/
- Test with real-world images (not just test patterns)
- Verify output quality visually
- Check file sizes before/after
- Monitor server resource usage during development

This comprehensive implementation will provide users with a professional-grade image resizing tool that's fast, flexible, and easy to use, filling the gap indicated by the existing homepage card.
