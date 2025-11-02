# Feature: HEIC to JPEG Converter

## Feature Description
A client-side web application that converts HEIC (High Efficiency Image Container) format images to JPEG format. The tool enables users to upload single or multiple HEIC files, convert them in the browser without server upload, and download the converted images either as individual JPEG files (for single images) or as a ZIP archive (for multiple images). This provides a privacy-focused, fast conversion experience that works entirely in the browser.

## User Story
As a user with HEIC photos from my iPhone
I want to convert them to JPEG format in bulk
So that I can share them across platforms that don't support HEIC and maintain compatibility with older devices and applications

## Problem Statement
HEIC is Apple's proprietary image format introduced in iOS 11, offering better compression than JPEG while maintaining quality. However, many platforms, applications, and devices don't support HEIC format, creating compatibility issues when users want to share photos. Users need a simple, secure way to convert HEIC files to the universally-supported JPEG format without uploading sensitive photos to external servers.

## Solution Statement
Implement a client-side HEIC to JPEG converter using the `heic2any` library that processes conversions entirely in the browser. The solution will:
- Accept single or multiple HEIC file uploads via drag-and-drop or file selection
- Convert HEIC files to JPEG using WebAssembly-based processing (no server required)
- Display conversion progress with preview thumbnails
- Enable single JPEG download for one file, or ZIP archive download for multiple files using JSZip
- Provide a responsive, accessible UI consistent with the existing Pyramid Tools design system
- Maintain user privacy by processing all data client-side

## Relevant Files
Use these files to implement the feature:

- **app/lib/tools.ts** - Contains the tools configuration array. The HEIC to JPEG tool is already defined with id "heic-to-jpeg", name, description, icon, and href pointing to "/tools/heic-to-jpeg". This entry links the homepage to the converter page.

- **app/components/ui/button.tsx** - Existing shadcn/ui button component used throughout the application. Will be used for upload triggers, download buttons, and action controls.

- **app/app/globals.css** - Global styles with the green McKim & Creed color theme. The converter UI will inherit these styles for consistency.

- **app/components/tool-card.tsx** - Shows how the existing component pattern works. Will help maintain consistency in any shared components.

### New Files

- **app/app/tools/heic-to-jpeg/page.tsx** - Main converter page component. Handles file upload, manages conversion state, orchestrates the conversion process, and triggers downloads. This is the primary feature entry point.

- **app/lib/heic-converter.ts** - Core conversion logic utility. Wraps the heic2any library, handles file conversion, error handling, and provides a clean API for the page component.

- **app/lib/zip-utils.ts** - ZIP archive creation utility. Uses JSZip to bundle multiple converted JPEG files into a downloadable ZIP file.

- **app/components/file-upload-zone.tsx** - Reusable drag-and-drop file upload component. Handles file selection, drag events, validation (file type, size), and displays upload state with visual feedback.

- **app/components/conversion-progress.tsx** - Conversion progress display component. Shows individual file conversion status, progress indicators, preview thumbnails, and any error messages.

- **app/types/heic-converter.ts** - TypeScript type definitions for the converter feature. Includes types for file state, conversion status, error types, and component props.

## Implementation Plan

### Phase 1: Foundation
1. Install required dependencies: `heic2any` for HEIC conversion and `jszip` for ZIP file creation
2. Create type definitions for file conversion state, progress tracking, and error handling
3. Set up the Next.js route structure at `/tools/heic-to-jpeg`
4. Create utility functions for HEIC conversion and ZIP file generation
5. Establish error handling patterns and validation rules

### Phase 2: Core Implementation
1. Implement the file upload zone with drag-and-drop functionality
2. Build the conversion engine that processes HEIC files using heic2any
3. Create progress tracking and preview display components
4. Implement single file JPEG download functionality
5. Implement multi-file ZIP archive download functionality
6. Add comprehensive error handling and user feedback

### Phase 3: Integration
1. Ensure the tool is properly linked from the homepage (already configured in tools.ts)
2. Test the full user flow from homepage to conversion to download
3. Verify responsive design across mobile, tablet, and desktop
4. Test dark mode compatibility
5. Validate accessibility features (keyboard navigation, screen readers, ARIA labels)
6. Performance testing with various file sizes and quantities

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Install Dependencies
- Install `heic2any` library: `cd app && npm install heic2any`
- Install `jszip` library for creating ZIP archives: `npm install jszip`
- Install type definitions: `npm install --save-dev @types/jszip`
- Verify installations and check for any peer dependency warnings

### 2. Create Type Definitions
- Create `app/types/heic-converter.ts`
- Define `ConversionStatus` enum (pending, converting, success, error)
- Define `FileConversionState` interface with file, status, progress, error, preview, convertedBlob
- Define `ConversionError` type with error codes and messages
- Export all types for use across components

### 3. Create Core Conversion Utility
- Create `app/lib/heic-converter.ts`
- Implement `convertHeicToJpeg` function that:
  - Accepts a File object and quality parameter (default 0.9)
  - Uses heic2any to convert HEIC to JPEG blob
  - Returns Promise with converted Blob
  - Handles conversion errors with descriptive messages
- Implement `createPreviewUrl` function for thumbnail generation
- Add file validation (check HEIC format, max size limits)

### 4. Create ZIP Utility
- Create `app/lib/zip-utils.ts`
- Implement `createZipFromFiles` function that:
  - Accepts array of {name: string, blob: Blob} objects
  - Uses JSZip to create archive
  - Returns Promise with ZIP blob
  - Handles filename conflicts (append numbers)
- Implement `downloadBlob` helper for triggering browser downloads

### 5. Create File Upload Zone Component
- Create `app/components/file-upload-zone.tsx`
- Implement drag-and-drop area with visual feedback
- Add file input trigger button
- Validate files on selection (HEIC format, size limits)
- Display selected file count and total size
- Handle multiple file selection
- Add proper ARIA labels and keyboard accessibility
- Style with Tailwind classes consistent with theme

### 6. Create Conversion Progress Component
- Create `app/components/conversion-progress.tsx`
- Display list of files being converted
- Show individual file progress with loading indicators
- Display preview thumbnails for converted images
- Show success/error states with appropriate icons
- Include file size information
- Add remove/retry options for individual files
- Make responsive for mobile and desktop views

### 7. Implement Main Converter Page
- Create `app/app/tools/heic-to-jpeg/page.tsx`
- Set up page metadata (title, description)
- Implement state management for:
  - Selected files array
  - Conversion state map
  - Overall conversion progress
- Create file upload handler
- Implement batch conversion logic:
  - Process files in parallel (with concurrency limit)
  - Update progress for each file
  - Generate previews
  - Handle individual file errors gracefully
- Add download functionality:
  - Single file: direct JPEG download
  - Multiple files: ZIP archive download
- Include "Convert Another" reset functionality
- Add helpful instructions and examples

### 8. Style and Polish
- Apply consistent styling with the green theme from globals.css
- Add hover effects and transitions
- Ensure proper spacing and layout
- Add loading states and skeleton screens
- Implement toast notifications for errors/success
- Add file size and format information display
- Optimize for mobile touch interactions

### 9. Error Handling and Edge Cases
- Handle unsupported file formats gracefully
- Add file size limits (e.g., 50MB per file, 500MB total)
- Handle out-of-memory errors for very large files
- Provide clear error messages for each failure scenario
- Add retry mechanism for failed conversions
- Handle browser compatibility issues
- Test with corrupted HEIC files

### 10. Accessibility and UX Enhancements
- Add keyboard navigation for all interactive elements
- Implement proper focus management
- Add screen reader announcements for status changes
- Ensure sufficient color contrast
- Add loading announcements for conversions
- Test with keyboard-only navigation
- Verify ARIA labels are descriptive

### 11. Testing and Validation
- Test with single HEIC file conversion and download
- Test with multiple HEIC files (2, 5, 10, 20 files)
- Test ZIP download with multiple converted files
- Test drag-and-drop functionality
- Test on mobile devices (iOS Safari, Android Chrome)
- Test on desktop browsers (Chrome, Firefox, Safari, Edge)
- Test with various HEIC file sizes (small, medium, large)
- Test dark mode appearance
- Run accessibility audit with browser tools
- Verify homepage link works correctly

### 12. Run Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

## Testing Strategy

### Unit Tests
- **heic-converter.ts**:
  - Test successful HEIC to JPEG conversion
  - Test error handling for invalid files
  - Test preview URL generation
  - Test file validation logic
- **zip-utils.ts**:
  - Test ZIP creation with single file
  - Test ZIP creation with multiple files
  - Test filename conflict resolution
  - Test download trigger functionality

### Integration Tests
- **Full conversion flow**:
  - Upload single HEIC file → Convert → Download JPEG
  - Upload multiple HEIC files → Convert → Download ZIP
  - Mixed success/failure scenarios
- **Component integration**:
  - FileUploadZone passes files to parent
  - ConversionProgress displays correct states
  - Download buttons trigger correct download type

### Edge Cases
- **File validation edge cases**:
  - Upload non-HEIC file (should reject)
  - Upload empty file
  - Upload file exceeding size limit
  - Upload file with no extension
  - Upload file with wrong extension but HEIC content
- **Conversion edge cases**:
  - Very small HEIC files (< 10KB)
  - Very large HEIC files (> 20MB)
  - HEIC files with transparency
  - Corrupted HEIC files
  - HEIC files with EXIF data
- **Browser edge cases**:
  - Test in browser with limited memory
  - Test with slow network (for library loading)
  - Test with JavaScript disabled (graceful degradation message)
  - Test in incognito/private mode
- **UI edge cases**:
  - Upload 1 file (single download)
  - Upload 2 files (ZIP download)
  - Upload 50+ files (performance test)
  - Cancel conversion mid-process
  - Navigate away during conversion
  - Rapid repeated uploads

## Acceptance Criteria
- [ ] User can access the HEIC to JPEG converter from the homepage by clicking the tool card
- [ ] User can upload HEIC files via drag-and-drop or file selection
- [ ] User can upload multiple HEIC files at once (at least 20 files)
- [ ] Conversion happens entirely client-side without server uploads
- [ ] Conversion progress is displayed for each file with visual feedback
- [ ] Preview thumbnails are shown for converted images
- [ ] Single HEIC file converts and downloads as JPEG automatically
- [ ] Multiple HEIC files convert and download as a ZIP archive
- [ ] ZIP file contains all converted JPEGs with original filenames (changed to .jpg)
- [ ] Error messages are clear and actionable when conversion fails
- [ ] Invalid file types are rejected with helpful messages
- [ ] UI is responsive and works on mobile devices (320px+)
- [ ] UI is consistent with the Pyramid Tools green theme
- [ ] Dark mode works correctly
- [ ] All interactive elements are keyboard accessible
- [ ] Screen readers can navigate and understand all states
- [ ] Page loads and is interactive within 3 seconds on standard broadband
- [ ] Conversion of 10 average-sized HEIC files (3MB each) completes within 30 seconds
- [ ] No console errors during normal operation
- [ ] Browser back button works correctly
- [ ] Page works in Chrome, Firefox, Safari, and Edge latest versions

## Validation Commands
Execute every command to validate the feature works correctly with zero regressions.

- `cd app && npm run lint` - Ensure no ESLint errors in new code
- `cd app && npm run build` - Verify application builds successfully with new feature
- `cd app && npm run dev` - Start development server for manual testing
- Manual validation checklist:
  - Navigate to http://localhost:3000 and verify HEIC to JPEG card appears
  - Click on HEIC to JPEG card and verify navigation to /tools/heic-to-jpeg
  - Upload single HEIC file and verify conversion and download
  - Upload 5 HEIC files and verify batch conversion and ZIP download
  - Test drag-and-drop with HEIC files
  - Attempt to upload non-HEIC file and verify error message
  - Test on mobile viewport (DevTools responsive mode)
  - Toggle dark mode and verify appearance
  - Navigate with keyboard only (Tab, Enter, Space)
  - Verify no console errors or warnings
  - Test in different browsers (Chrome, Firefox, Safari if available)

## Notes

### Library Selection Rationale
- **heic2any**: Well-maintained library with 1M+ weekly downloads, uses WebAssembly for fast client-side conversion, supports all modern browsers
- **JSZip**: Industry-standard library for creating ZIP files in JavaScript, 3M+ weekly downloads, excellent browser support

### Performance Considerations
- Client-side conversion means no server costs and better privacy
- WebAssembly-based conversion is fast but still CPU-intensive
- Recommend processing files with concurrency limit (e.g., 3 at a time) to prevent browser freezing
- Large files (>10MB) may take 5-10 seconds each to convert
- Consider showing estimated time remaining based on average conversion speed

### Browser Compatibility
- heic2any requires modern browsers with WebAssembly support
- Works in Chrome 57+, Firefox 52+, Safari 11+, Edge 16+
- iOS Safari 11+ (native HEIC support means iOS users may not need this tool, but still useful for sharing)
- Consider adding browser compatibility check and graceful degradation message

### Future Enhancements (Not in Scope)
- Add quality slider for JPEG compression (90%, 80%, 70%)
- Support other output formats (PNG, WebP)
- Add batch resize option during conversion
- Preserve EXIF metadata option
- Add watermarking during conversion
- Progress persistence (resume interrupted conversions)
- Desktop drag-and-drop from OS file explorer
- Cloud storage integration (Google Drive, Dropbox)
- Conversion history with re-download capability

### Privacy and Security
- All conversion happens client-side - files never leave the user's device
- No analytics or tracking on file contents
- No file uploads to external servers
- Consider adding privacy notice on the page to highlight this benefit
- Files are processed in memory and cleared when page is closed

### Dependencies to Install
```bash
cd app
npm install heic2any jszip
npm install --save-dev @types/jszip
```

### Estimated Implementation Time
- Phase 1 (Foundation): 1-2 hours
- Phase 2 (Core Implementation): 3-4 hours
- Phase 3 (Integration & Testing): 2-3 hours
- Total: 6-9 hours for a complete, polished implementation
