# Feature: PDF Merger

## Feature Description

A client-side web application that allows users to merge multiple PDF files into a single PDF document. The tool enables users to upload multiple PDF files, arrange them in their desired order using drag-and-drop functionality, preview each PDF, and download the merged result. All processing happens entirely in the browser without uploading files to any server, ensuring complete privacy and security. This provides a fast, user-friendly PDF merging experience with visual feedback and full control over document ordering.

## User Story

As a user who needs to combine multiple PDF documents
I want to upload multiple PDFs, arrange them in my preferred order, and merge them into one file
So that I can create organized document packages, combine reports, or consolidate related documents without compromising privacy or paying for online services

## Problem Statement

Users frequently need to combine multiple PDF files into a single document for various purposes: creating comprehensive reports, packaging documentation, combining invoices, or organizing academic papers. Existing solutions often require uploading sensitive documents to third-party servers (raising privacy concerns), charge subscription fees, or have complex interfaces. Users need a simple, secure, and free way to merge PDFs while maintaining full control over file order and ensuring their documents never leave their device.

## Solution Statement

Implement a client-side PDF merger using the `pdf-lib` library that processes all operations entirely in the browser. The solution will:

- Accept multiple PDF file uploads via drag-and-drop or file selection
- Display uploaded PDFs with previews showing the first page of each document
- Enable drag-and-drop reordering of PDFs to control the final merge sequence
- Allow users to remove unwanted PDFs from the merge list
- Merge all PDFs in the specified order using pdf-lib (client-side processing only)
- Generate and download the merged PDF file with a meaningful filename
- Provide real-time file count and total size information
- Display a responsive, accessible UI consistent with the existing Pyramid Tools design system
- Maintain user privacy by processing all data client-side with no server uploads

## Relevant Files

Use these files to implement the feature:

- **app/lib/tools.ts** - Contains the tools configuration array. The PDF Merger tool is already defined with id "pdf-merger", name, description, icon ("FileText"), and href pointing to "/tools/pdf-merger". This entry links the homepage to the merger page.

- **app/components/ui/button.tsx** - Existing shadcn/ui button component used throughout the application. Will be used for upload triggers, merge buttons, download controls, and remove actions.

- **app/app/globals.css** - Global styles with the green McKim & Creed color theme. The merger UI will inherit these styles for consistency.

- **app/components/tool-card.tsx** - Shows the existing component pattern. Helps maintain consistency in shared components and demonstrates the established design language.

- **app/components/file-upload-zone.tsx** - Existing reusable drag-and-drop file upload component. Can be adapted for PDF file uploads with PDF-specific validation (file type, size limits).

- **app/lib/zip-utils.ts** - Existing ZIP utility with `downloadBlob` function. The `downloadBlob` function will be reused for triggering PDF downloads without modification.

- **app/types/heic-converter.ts** - Example of type definition patterns. Provides a reference for creating PDF merger type definitions following the same structure.

### New Files

- **app/app/tools/pdf-merger/page.tsx** - Main PDF merger page component. Handles file upload, manages PDF list state, orchestrates drag-and-drop reordering, controls the merge process, and triggers downloads. This is the primary feature entry point.

- **app/lib/pdf-merger.ts** - Core PDF merging logic utility. Wraps the pdf-lib library, handles PDF merging, page extraction, error handling, and provides a clean API for the page component.

- **app/lib/pdf-preview.ts** - PDF preview generation utility. Uses pdf-lib or pdfjs-dist to generate thumbnail previews (first page) of uploaded PDFs for visual feedback in the UI.

- **app/components/pdf-file-list.tsx** - Sortable PDF file list component. Displays uploaded PDFs with drag-and-drop reordering, shows previews/thumbnails, displays file metadata (name, size, page count), and includes remove buttons.

- **app/components/pdf-file-item.tsx** - Individual PDF file item component. Renders a single PDF entry with preview, metadata, drag handle, and remove button. Handles drag events and user interactions.

- **app/types/pdf-merger.ts** - TypeScript type definitions for the PDF merger feature. Includes types for PDF file state, merge status, file metadata, error types, and component props.

## Implementation Plan

### Phase 1: Foundation

1. Research and select appropriate PDF library (pdf-lib for merging, potentially pdfjs-dist for previews)
2. Install required dependencies: `pdf-lib` for PDF merging and potentially `pdfjs-dist` for generating previews
3. Create type definitions for PDF file state, merge status, and metadata tracking
4. Set up the Next.js route structure at `/tools/pdf-merger`
5. Create utility functions for PDF merging and preview generation
6. Establish error handling patterns and validation rules for PDF files

### Phase 2: Core Implementation

1. Adapt the existing file upload zone component for PDF-specific uploads with validation
2. Build the PDF file list component with drag-and-drop reordering functionality
3. Implement PDF preview generation to show thumbnails of the first page
4. Create the core PDF merging engine using pdf-lib
5. Implement file removal functionality from the merge list
6. Add merge progress tracking and user feedback
7. Implement merged PDF download functionality with appropriate filename generation
8. Add comprehensive error handling for corrupted PDFs, merge failures, and browser limitations

### Phase 3: Integration

1. Ensure the tool is properly linked from the homepage (already configured in tools.ts)
2. Test the full user flow from homepage to upload to reordering to merge to download
3. Verify responsive design across mobile, tablet, and desktop viewports
4. Test dark mode compatibility for all new components
5. Validate accessibility features (keyboard navigation for reordering, screen readers, ARIA labels, focus management)
6. Performance testing with various file sizes, page counts, and quantities of PDFs
7. Cross-browser testing (Chrome, Firefox, Safari, Edge) for PDF processing compatibility

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Install Dependencies

- Research PDF libraries: evaluate `pdf-lib` for merging and `pdfjs-dist` for previews
- Install `pdf-lib` library: `cd app && npm install pdf-lib`
- Install `pdfjs-dist` for preview generation if needed: `npm install pdfjs-dist` (or use pdf-lib for previews)
- Install any necessary type definitions: `npm install --save-dev @types/pdfjs-dist` if using pdfjs-dist
- Verify installations and check for any peer dependency warnings or compatibility issues

### 2. Create Type Definitions

- Create `app/types/pdf-merger.ts`
- Define `MergeStatus` enum (idle, merging, success, error)
- Define `PdfFileState` interface with:
  - `id`: unique identifier
  - `file`: File object
  - `name`: filename
  - `size`: file size in bytes
  - `pageCount`: number of pages (if available)
  - `preview`: preview image URL or null
  - `error`: error message or null
- Define `PdfMergerError` type with error codes and messages
- Define constants for max file size (e.g., 100MB per file) and max total size (e.g., 500MB)
- Export all types and constants for use across components

### 3. Create PDF Preview Utility

- Create `app/lib/pdf-preview.ts`
- Implement `generatePdfPreview` function that:
  - Accepts a File object (PDF)
  - Loads the PDF using pdf-lib or pdfjs-dist
  - Extracts the first page
  - Renders it to a canvas or generates a data URL
  - Returns Promise with preview image URL or null on failure
  - Handles errors gracefully (corrupted PDFs, unsupported formats)
- Implement `getPdfPageCount` function to extract page count from PDF metadata
- Add helper function to validate PDF file (check file type, magic bytes if possible)

### 4. Create Core PDF Merger Utility

- Create `app/lib/pdf-merger.ts`
- Implement `mergePdfs` function that:
  - Accepts an array of File objects (PDFs) in the desired order
  - Creates a new PDFDocument using pdf-lib
  - Iterates through each PDF file:
    - Loads the PDF using PDFDocument.load()
    - Copies all pages from source to destination using copyPages()
    - Appends pages to the merged document
  - Serializes the merged PDF to Uint8Array
  - Converts to Blob for download
  - Returns Promise with merged PDF Blob
  - Provides detailed error handling for merge failures
- Implement `validatePdfFile` function for type and size checking
- Add `generateMergedFilename` function to create meaningful output filename (e.g., "merged-pdfs-[timestamp].pdf")

### 5. Adapt File Upload Zone for PDFs

- Create or modify upload zone to accept PDF files
- Update accepted file types to: `accept=".pdf,application/pdf"`
- Implement PDF-specific validation:
  - Check file type is application/pdf or ends with .pdf
  - Validate file size (max 100MB per file suggested)
  - Validate total size doesn't exceed limit (500MB suggested)
- Update UI text to reference PDFs instead of images
- Update error messages for PDF-specific issues
- Consider reusing existing `FileUploadZone` component with props for customization

### 6. Create PDF File Item Component

- Create `app/components/pdf-file-item.tsx`
- Implement component that displays:
  - Drag handle icon (GripVertical from lucide-react) for reordering
  - PDF preview thumbnail (use placeholder icon if preview fails)
  - Filename with truncation for long names
  - File size formatted (KB/MB)
  - Page count if available
  - Remove button (X icon)
- Make the component draggable using HTML5 drag and drop:
  - Add `draggable` attribute
  - Handle `onDragStart`, `onDragEnd` events
  - Pass drag data including file ID
- Add visual feedback for drag state (opacity, border highlight)
- Implement remove callback to notify parent component
- Add appropriate ARIA labels for accessibility

### 7. Create PDF File List Component

- Create `app/components/pdf-file-list.tsx`
- Implement sortable list component that:
  - Displays array of PdfFileState objects
  - Renders PdfFileItem for each PDF
  - Handles drag-and-drop reordering:
    - `onDragOver`: prevent default and allow drop
    - `onDrop`: handle reordering logic
  - Emits reorder events to parent via callback
  - Shows empty state when no PDFs are uploaded
  - Displays aggregate info (total files, total size)
- Implement reordering logic:
  - Track drag source and drop target
  - Update array order based on drop position
  - Provide visual feedback during drag (drop zones, insertion indicators)
- Add keyboard accessibility for reordering (up/down arrows with modifier keys)
- Include ARIA live region for announcing reorder actions to screen readers

### 8. Create Main PDF Merger Page

- Create `app/app/tools/pdf-merger/page.tsx`
- Set up page structure with:
  - Header with title "PDF Merger" and back link to home
  - Description of the tool
  - File upload zone (shown when no files uploaded)
  - PDF file list (shown when files are uploaded)
  - Action buttons (Merge PDFs, Clear All, Download)
- Implement state management:
  - `pdfFiles`: array of PdfFileState objects
  - `mergeStatus`: current merge status
  - `mergedPdf`: Blob of merged result or null
- Implement `handleFilesSelected` callback:
  - Create PdfFileState objects with unique IDs
  - Generate previews asynchronously for each PDF
  - Extract page counts
  - Add to state
  - Handle validation errors
- Implement `handleReorder` callback to update PDF order in state
- Implement `handleRemove` callback to remove PDF from list
- Implement `handleMerge` callback:
  - Set merge status to "merging"
  - Call mergePdfs utility with ordered file list
  - Store merged PDF in state
  - Set status to "success"
  - Handle errors by setting status to "error" with message
- Implement `handleDownload` callback:
  - Use downloadBlob from zip-utils
  - Generate filename with timestamp
  - Trigger browser download
- Implement `handleReset` callback to clear all state and start over
- Add info/about section explaining the feature

### 9. Implement Preview Generation

- In the `handleFilesSelected` callback, for each uploaded PDF:
  - Call `generatePdfPreview` asynchronously
  - Update the PdfFileState with the preview URL when ready
  - Handle preview generation failures gracefully (show file icon instead)
  - Call `getPdfPageCount` to get page count
  - Update state with metadata
- Ensure preview URLs are revoked when files are removed or component unmounts to prevent memory leaks

### 10. Add Error Handling and User Feedback

- Display errors from:
  - File upload validation (invalid file type, size exceeded)
  - Preview generation failures
  - Merge operation failures (corrupted PDFs, out of memory)
- Show error messages in appropriate locations:
  - Per-file errors in PDF file items
  - Global errors in alert/banner component
- Provide helpful error messages:
  - "This file is not a valid PDF"
  - "File size exceeds the 100MB limit"
  - "Failed to merge PDFs. One or more files may be corrupted."
- Add loading states:
  - Show spinner during preview generation
  - Show progress indicator during merge operation
  - Disable UI during merge to prevent conflicting actions

### 11. Implement Merge Progress and Success State

- During merge operation:
  - Show loading spinner or progress indicator
  - Disable all interactive elements (add more files, reorder, remove)
  - Display "Merging PDFs..." message
- After successful merge:
  - Show success message with merged file information
  - Enable "Download Merged PDF" button prominently
  - Show options to "Merge More Files" or "Clear and Start Over"
  - Display metadata about merged PDF (total pages, estimated file size)

### 12. Add Responsive Design and Mobile Support

- Ensure PDF file list is touch-friendly on mobile devices
- Adjust drag-and-drop for touch events (consider react-dnd or similar if needed)
- Make preview thumbnails appropriately sized for different screen sizes
- Stack action buttons vertically on mobile
- Test on various screen sizes: mobile (320px+), tablet (768px+), desktop (1024px+)
- Ensure all touch targets are at least 44x44px for accessibility

### 13. Add Accessibility Features

- Ensure all interactive elements are keyboard accessible:
  - Tab navigation through upload zone, file list, buttons
  - Enter/Space to activate buttons
  - Arrow keys for reordering (with instructions)
- Add ARIA labels:
  - `aria-label` on remove buttons ("Remove [filename]")
  - `aria-label` on drag handles ("Drag to reorder [filename]")
  - `role="list"` and `role="listitem"` for PDF file list
- Add ARIA live region for dynamic updates:
  - Announce when files are added
  - Announce when reordering occurs
  - Announce merge status changes
- Ensure sufficient color contrast for all text and UI elements
- Add visible focus indicators for keyboard navigation

### 14. Create Info/About Section

- Add informational section below the main tool area with:
  - **Privacy First**: All merging happens in your browser. PDFs never leave your device.
  - **How It Works**: Upload PDFs, arrange them in your preferred order, and merge them into a single document.
  - **File Limits**: Maximum 100MB per file, 500MB total recommended. Works with multiple files.
  - **Browser Compatibility**: Works in modern browsers with JavaScript enabled.
  - **Tips**: Drag and drop files to reorder them before merging. Remove unwanted files with the X button.

### 15. Test File Upload and Validation

- Test uploading single PDF file
- Test uploading multiple PDF files (2, 5, 10, 20)
- Test drag-and-drop file upload
- Test file selection via button/input
- Test uploading non-PDF files (should show error)
- Test uploading oversized files (should show error)
- Test uploading corrupted PDF files (should handle gracefully)
- Test total size limit enforcement

### 16. Test PDF Reordering

- Test dragging PDFs to reorder
- Test reordering with keyboard (if implemented)
- Test reordering on touch devices
- Verify visual feedback during drag
- Verify order is maintained correctly after drop
- Test edge cases: dragging first item to last, last to first, etc.

### 17. Test PDF Merging

- Test merging 2 PDFs
- Test merging many PDFs (10+)
- Test merging PDFs with different page sizes
- Test merging PDFs with different orientations (portrait/landscape)
- Test merging large PDFs (many pages)
- Test merge failure handling with corrupted PDFs
- Verify merged PDF contains all pages in correct order
- Verify merged PDF opens correctly in PDF readers

### 18. Test Download Functionality

- Test downloading merged PDF
- Verify filename is meaningful and includes timestamp
- Test opening downloaded PDF in various PDF readers (browser, Adobe, Preview, etc.)
- Verify all pages are present and in correct order
- Verify content integrity (no corruption)

### 19. Test Edge Cases and Error Scenarios

- Test with no files uploaded (merge button should be disabled)
- Test with only one PDF uploaded (should still merge/work)
- Test removing all files one by one
- Test uploading files, merging, then uploading more files
- Test browser memory limits with very large PDFs
- Test browser compatibility (Chrome, Firefox, Safari, Edge)
- Test with PDFs that have unusual characteristics (encrypted, form fields, annotations)

### 20. Test Responsive Design

- Test on mobile devices (iOS Safari, Chrome Mobile)
- Test on tablets (iPad, Android tablets)
- Test on desktop (various screen sizes)
- Verify touch interactions work correctly
- Verify layout doesn't break at different viewport sizes
- Test landscape and portrait orientations on mobile

### 21. Test Accessibility

- Test keyboard navigation through entire workflow
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Verify all images have appropriate alt text
- Verify form controls have labels
- Test focus indicators are visible
- Verify color contrast meets WCAG AA standards
- Test with browser zoom at 200%

### 22. Final Integration Testing

- Test complete workflow: home → upload → reorder → merge → download
- Test back navigation and browser history
- Test dark mode (if applicable)
- Verify all text content is clear and helpful
- Check for console errors or warnings
- Verify performance with typical use cases (3-5 PDFs)

### 23. Run Validation Commands

Execute validation commands to ensure the feature works correctly with zero regressions.

## Testing Strategy

### Unit Tests

Due to the client-side nature of this application and the current project structure (no testing framework set up), formal unit tests are not included in this specification. However, manual testing procedures are detailed in the step-by-step tasks. If a testing framework is added in the future, consider testing:

- PDF validation functions (file type checking, size validation)
- Filename generation utility
- Reorder logic (array manipulation)
- Error handling paths

### Integration Tests

Manual integration tests to perform:

- Complete user workflow from upload to download
- File state management through the entire lifecycle
- Preview generation and display
- Drag-and-drop reordering functionality
- PDF merging with various inputs
- Error handling across all operations

### Edge Cases

- **Empty state**: No files uploaded
- **Single file**: Uploading and "merging" just one PDF (should work)
- **Maximum files**: Testing with many PDFs (e.g., 50+) to identify performance limits
- **Large files**: PDFs with hundreds of pages or very large file sizes
- **Corrupted PDFs**: Files that appear to be PDFs but are corrupted or invalid
- **Mixed content**: PDFs with images, text, forms, annotations, encryption
- **Browser limits**: Testing memory constraints and browser-specific PDF handling quirks
- **Duplicate filenames**: Uploading multiple PDFs with the same filename
- **Special characters**: Filenames with Unicode, emojis, or special characters
- **Rapid interactions**: Quickly adding/removing files, reordering, or triggering merge multiple times

## Acceptance Criteria

1. **File Upload**:

   - Users can upload multiple PDF files via drag-and-drop or file selection
   - System validates files are PDFs and within size limits
   - Clear error messages appear for invalid files
   - Upload zone is intuitive and responsive

2. **File Management**:

   - All uploaded PDFs are displayed in a list with previews (first page thumbnail)
   - Each PDF shows filename, file size, and page count (if available)
   - Users can remove individual PDFs from the list
   - File list shows aggregate information (total files, total size)

3. **Reordering**:

   - Users can drag and drop PDFs to reorder them
   - Visual feedback indicates drag state and drop position
   - Order changes are immediately reflected in the UI
   - Reordering works on both desktop and mobile/touch devices

4. **Merging**:

   - Users can merge all uploaded PDFs in the displayed order
   - Merge operation shows progress/loading indicator
   - Merge completes successfully for valid PDFs
   - Errors are handled gracefully with helpful messages

5. **Download**:

   - Successfully merged PDF can be downloaded
   - Downloaded file is a valid PDF containing all pages in correct order
   - Filename is meaningful and includes timestamp
   - Download works across different browsers

6. **Performance**:

   - Preview generation completes within reasonable time (< 2s per PDF)
   - Merge operation completes within reasonable time (< 10s for typical use)
   - UI remains responsive during processing
   - No memory leaks or browser crashes with typical usage

7. **Privacy & Security**:

   - All processing happens client-side in the browser
   - No files are uploaded to any server
   - No network requests are made with user PDF data
   - Preview URLs are properly cleaned up to prevent memory leaks

8. **Design & UX**:

   - UI is consistent with existing Pyramid Tools design system
   - Color scheme matches the green McKim & Creed theme
   - Layout is responsive across mobile, tablet, and desktop
   - Dark mode works correctly (if applicable)
   - Loading states and progress indicators provide clear feedback

9. **Accessibility**:

   - All functionality is keyboard accessible
   - Screen reader compatible with proper ARIA labels
   - Sufficient color contrast for all elements
   - Focus indicators are clearly visible
   - Touch targets are appropriately sized (min 44x44px)

10. **Error Handling**:
    - Invalid file types show helpful error messages
    - Oversized files show clear size limit information
    - Corrupted PDFs are detected and reported
    - Merge failures provide actionable feedback
    - All error states allow users to recover and continue

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `cd app && npm run build` - Build the application to ensure no TypeScript errors, linting issues, or build failures. Must complete successfully with no errors.
- `cd app && npm run dev` - Start the development server and manually test the PDF merger feature:
  - Navigate to http://localhost:3000 and verify the PDF Merger card appears on the homepage
  - Click the PDF Merger card and verify navigation to /tools/pdf-merger
  - Test file upload via drag-and-drop with multiple PDFs
  - Test file upload via file selection button
  - Verify PDF previews are generated and displayed
  - Test reordering PDFs using drag-and-drop
  - Test removing PDFs from the list
  - Test merging PDFs and downloading the result
  - Open the downloaded PDF and verify all pages are present in correct order
  - Test error cases: non-PDF files, oversized files
  - Test responsive design by resizing browser window
  - Test keyboard navigation through all interactive elements
  - Verify no console errors appear during any operation

## Notes

### Library Selection: pdf-lib

- **pdf-lib** is recommended for PDF merging as it's a lightweight, pure JavaScript library that works entirely in the browser without dependencies on external services
- Supports creating, modifying, and merging PDFs
- Works with TypeScript and has good type definitions
- No native dependencies, making it ideal for client-side web applications

### Preview Generation Options

- **Option 1 - pdf-lib**: Can extract first page and render to canvas (more complex)
- **Option 2 - pdfjs-dist**: Mozilla's PDF.js library specifically designed for rendering PDFs in browsers (more straightforward for previews)
- **Recommendation**: Use pdfjs-dist for preview generation if previews are critical to UX. If previews are optional, consider showing a PDF icon instead to reduce bundle size.

### Performance Considerations

- Large PDFs (100+ pages or 50MB+ file size) may cause performance issues or memory constraints in browsers
- Consider implementing file/size warnings to set user expectations
- Batch processing or chunked operations may be needed for very large merges
- Memory cleanup (revoking object URLs) is critical to prevent browser slowdown

### Future Enhancements

- **Page Range Selection**: Allow users to select specific page ranges from each PDF rather than merging entire documents
- **PDF Splitting**: Add ability to split a single PDF into multiple documents
- **Page Deletion**: Remove specific pages from PDFs before merging
- **PDF Rotation**: Rotate pages before merging
- **Bookmarks/TOC**: Preserve or generate table of contents in merged PDF
- **Compression**: Option to compress the merged PDF to reduce file size
- **Batch Processing**: Queue system for processing very large merge operations
- **Save to Cloud**: Integration with cloud storage providers (Google Drive, Dropbox) while maintaining privacy

### Browser Compatibility Notes

- pdf-lib and pdfjs-dist work in all modern browsers (Chrome, Firefox, Safari, Edge)
- Ensure users have JavaScript enabled
- File API and Blob support are required (available in all modern browsers)
- Large file handling may vary by browser and available system memory
- Test thoroughly on Safari/iOS as it sometimes has stricter memory limits
