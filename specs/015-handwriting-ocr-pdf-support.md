# Feature: PDF Support for Handwriting to Text OCR

## Feature Plan Created: specs/015-handwriting-ocr-pdf-support.md

## Feature Description

Extend the existing Handwriting to Text OCR tool to accept PDF files in addition to images. This enhancement allows users to upload PDF documents containing handwritten content and extract text from them using the same AI-powered OCR capabilities. The tool will convert PDF pages to images and process each page through OpenAI's GPT-4o vision API to extract handwritten text, providing a seamless experience for users with scanned handwritten documents in PDF format.

## User Story

As a user with handwritten documents in PDF format
I want to upload PDF files directly to the Handwriting to Text tool
So that I can extract text from scanned handwritten notes without manually converting PDFs to images first

## Problem Statement

Currently, the Handwriting to Text tool only accepts image files (JPEG, PNG, WebP, HEIC). Many users have handwritten documents that have been scanned to PDF format - a common workflow for archiving handwritten notes, forms, and letters. These users must:

- Manually convert PDF pages to images using another tool
- Process each page individually
- Keep track of extracted text across multiple conversions
- Deal with potential quality loss during manual conversion

This creates unnecessary friction for users who have scanned handwritten documents as PDFs, which is a very common format for document archives.

## Solution Statement

Extend the Handwriting to Text tool to:

- Accept PDF files (`.pdf`, `application/pdf`) alongside existing image formats
- Convert PDF pages to high-quality images using pdfjs-dist (already installed in the project)
- Process each page through the existing OpenAI GPT-4o OCR pipeline
- Display extracted text for each page with page number indicators
- Allow downloading individual page results or all pages combined
- Maintain the same file size limits and error handling as the current implementation

The implementation will leverage existing libraries in the project (pdfjs-dist, pdf-lib) for PDF processing on the client side, then send converted page images to the existing API route for OCR processing.

## Relevant Files

Use these files to implement the feature:

- **app/types/handwriting-ocr.ts** - Type definitions and constants. Needs to be updated to include PDF MIME type in SUPPORTED_IMAGE_FORMATS and add constants for PDF-specific limits (max pages per PDF).

- **app/lib/handwriting-ocr.ts** - Client-side utility functions. Needs new functions for PDF detection, PDF-to-image conversion, and updated validation to handle PDFs.

- **app/app/tools/handwriting-to-text/page.tsx** - Main tool page component. Needs updated file upload zone to accept PDFs, updated UI to show page-by-page results for PDFs, and logic to handle multi-page PDFs.

- **app/components/file-upload-zone.tsx** - File upload component. Reference for how file upload and validation works. May need minor updates to accept prop for PDF-specific messaging.

- **app/components/file-processing-card.tsx** - File processing card component. May need updates to display page numbers for PDF results.

- **app/app/api/extract-handwriting/route.ts** - Server-side API route. No changes needed as PDFs will be converted to images client-side before upload.

- **app/lib/pdf-preview.ts** - Existing PDF preview utilities (used by PDF splitter). Contains `generatePdfPreview` function that can be adapted for converting PDF pages to images for OCR.

- **app/lib/pdf-splitter.ts** - Existing PDF splitter utilities. Reference for PDF validation and page count extraction patterns.

- **app/types/pdf-splitter.ts** - Existing PDF types. Reference for PDF-related type patterns.

### New Files

- **app/lib/pdf-to-images.ts** - New utility module for PDF-to-image conversion:
  - `convertPdfToImages(file: File): Promise<ConvertedPage[]>` - Converts all pages of a PDF to high-quality images
  - `getPdfInfo(file: File): Promise<{ pageCount: number }>` - Gets PDF metadata
  - `ConvertedPage` interface for representing converted pages with image data

## Implementation Plan

### Phase 1: Foundation

1. Update type definitions to support PDF files
2. Add PDF-specific constants (max pages, etc.)
3. Create PDF-to-image conversion utility using pdfjs-dist
4. Add PDF detection and validation functions

### Phase 2: Core Implementation

1. Update client-side validation to accept PDFs
2. Implement PDF page conversion workflow
3. Update page component to handle PDF file selection
4. Modify processing flow to handle multi-page PDFs
5. Update results display for page-by-page extraction

### Phase 3: Integration

1. Update file upload zone to show PDF-specific messaging
2. Add page progress indicators for multi-page PDFs
3. Implement combined text download for multi-page PDFs
4. Test with various PDF sizes and page counts
5. Verify responsive layout and dark mode compatibility

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Type Definitions

- Read `app/types/handwriting-ocr.ts`
- Add `'application/pdf'` to `SUPPORTED_IMAGE_FORMATS` array (rename to `SUPPORTED_FORMATS` for accuracy)
- Add new constant:
  ```typescript
  export const MAX_PDF_PAGES = 10; // Process up to 10 pages per PDF
  ```
- Add new type for converted PDF pages:
  ```typescript
  export interface ConvertedPdfPage {
    pageNumber: number;
    imageData: string; // base64
    mimeType: string;
  }
  ```
- Update error messages to include PDF-specific errors:
  ```typescript
  TOO_MANY_PAGES: 'PDF has too many pages. Maximum 10 pages per PDF',
  PDF_CONVERSION_FAILED: 'Failed to convert PDF page to image',
  ```

### 2. Create PDF-to-Image Conversion Utility

- Create new file `app/lib/pdf-to-images.ts`
- Import pdfjs-dist (already in project)
- Set the worker source for pdfjs:
  ```typescript
  import * as pdfjsLib from 'pdfjs-dist';
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  ```
- Implement `getPdfPageCount(file: File): Promise<number>`:
  - Load PDF using pdfjs-dist
  - Return the number of pages
- Implement `convertPdfPageToImage(file: File, pageNumber: number): Promise<ConvertedPdfPage>`:
  - Load PDF using pdfjs-dist
  - Get the specified page
  - Render to canvas at high DPI (2x scale for OCR quality)
  - Convert canvas to base64 PNG data
  - Return ConvertedPdfPage object
- Implement `convertPdfToImages(file: File, maxPages?: number): Promise<ConvertedPdfPage[]>`:
  - Get page count
  - Validate against MAX_PDF_PAGES
  - Convert each page to image using convertPdfPageToImage
  - Return array of ConvertedPdfPage objects
- Add JSDoc comments explaining each function

### 3. Update Client-Side Validation

- Read `app/lib/handwriting-ocr.ts`
- Update `validateImageFile` function (rename to `validateFile`):
  - Check if file is PDF (`application/pdf`)
  - For PDFs: validate file size (50MB limit)
  - For images: keep existing validation logic
- Add new function `isPdfFile(file: File): boolean`:
  - Check if file.type is 'application/pdf' or filename ends with '.pdf'
- Import the new PDF conversion functions from pdf-to-images.ts
- Export all new functions

### 4. Update File Upload Zone Props

- Read `app/app/tools/handwriting-to-text/page.tsx`
- Update the FileUploadZone component usage:
  - Change `accept` prop to include PDF: `accept="image/*,application/pdf,.pdf"`
  - Update `title` prop to mention PDFs: "Drop handwritten document images or PDFs here"
  - Update `description` prop: "or click the button below to select up to 5 files (JPEG, PNG, WebP, HEIC, PDF)"
- Add state for tracking PDF pages:
  ```typescript
  interface PdfFileState extends FileOCRState {
    isPdf: boolean;
    pageCount?: number;
    pageResults?: Array<{
      pageNumber: number;
      text?: string;
      error?: string;
    }>;
  }
  ```

### 5. Update File Selection Handler

- In `handleFilesSelected` callback:
  - Check if any selected files are PDFs using `isPdfFile()`
  - For PDF files:
    - Get page count using `getPdfPageCount()`
    - Validate against MAX_PDF_PAGES
    - Store page count in file state
  - For image files: keep existing logic
  - Initialize file states with isPdf flag

### 6. Update Text Extraction Handler

- In `handleExtractText` callback:
  - Separate files into PDFs and images
  - For PDF files:
    - Convert each page to image using `convertPdfToImages()`
    - Create array of images with page-specific filenames (e.g., "document.pdf_page1")
    - Track which images belong to which PDF
  - For image files: keep existing logic
  - Combine all images (from PDFs and direct uploads) for API call
  - Map results back to original files, grouping PDF pages together
  - Update file states with page-by-page results for PDFs

### 7. Update FileProcessingCard Component

- Read `app/components/file-processing-card.tsx`
- Add support for displaying PDF page results:
  - If file is PDF with multiple page results, show expandable section
  - Display each page's extracted text with page number label
  - Add copy/download buttons for individual pages
  - Add "Copy All" and "Download All" buttons for combined text
- Update progress display to show page-by-page progress for PDFs
- Style page sections consistently with existing design

### 8. Add Combined Text Download for PDFs

- In the page component, add new handler `handleDownloadAllText`:
  - For PDF files with multiple pages:
    - Combine all page texts with page separators
    - Download as single text file with all pages
- Add "Download All Pages as Text" button when PDF has multiple page results
- Format combined text with clear page breaks:
  ```
  === Page 1 ===
  [extracted text]

  === Page 2 ===
  [extracted text]
  ```

### 9. Update Informational Content

- Update the "About This Tool" section in the page:
  - Add PDF to "Supported Formats" list
  - Add note about multi-page PDF processing
  - Update limitations section with PDF page limit (10 pages)
- Update any file size references to clarify they apply to both images and PDFs

### 10. Handle PDF Conversion Progress

- Add state for tracking PDF conversion progress:
  ```typescript
  const [conversionProgress, setConversionProgress] = useState<Map<string, number>>(new Map());
  ```
- Show progress indicator during PDF-to-image conversion phase
- Update status message: "Converting PDF pages..." → "Extracting text..."
- Display conversion progress for each page being processed

### 11. Add Error Handling for PDF Issues

- Handle common PDF errors gracefully:
  - Password-protected PDFs → Show clear error message
  - Corrupted PDFs → Show error with suggestion to re-scan
  - PDFs with no renderable pages → Show appropriate error
- Update FileProcessingCard to show PDF-specific error messages
- Ensure partial success is handled (some pages succeed, some fail)

### 12. Test PDF Upload Flow

- Test uploading single-page PDF:
  - Select PDF via file picker
  - Drag and drop PDF
  - Verify PDF is accepted
  - Verify page count is detected
  - Verify conversion to image works
  - Verify OCR extracts text correctly
- Test uploading multi-page PDF (2-5 pages):
  - Verify all pages are converted
  - Verify progress shows for each page
  - Verify results show for each page
  - Verify copy/download works for individual pages
  - Verify "Download All" combines pages
- Test mixing PDFs and images:
  - Upload 1 PDF and 2 images in same batch
  - Verify all are processed correctly
  - Verify results are displayed appropriately

### 13. Test PDF Validation

- Test with oversized PDF (> 50MB):
  - Should show file size error
  - Should not attempt conversion
- Test with too many pages (> 10 pages):
  - Upload PDF with 15+ pages
  - Should show "too many pages" error
  - Should not attempt processing
- Test with unsupported file:
  - Upload .docx or other file type
  - Should reject with format error
- Test with password-protected PDF:
  - Should show appropriate error message

### 14. Test PDF OCR Accuracy

- Test with scanned handwritten document PDF:
  - High quality scan → should extract accurately
  - Medium quality → may have some errors
  - Low quality → should still attempt with warnings
- Test with multi-page handwritten notes:
  - Verify each page is processed separately
  - Verify formatting is preserved
  - Verify combined download maintains page separation
- Test with mixed content PDF:
  - Pages with handwriting and printed text
  - Verify AI extracts handwriting appropriately

### 15. Test Responsive Design

- Test PDF upload on mobile (375px):
  - File picker works for PDFs
  - Progress indicators visible
  - Page results readable
  - Copy/download buttons usable
- Test on tablet (768px):
  - Layout adapts appropriately
  - Multi-page results display well
- Test on desktop (1920px):
  - Good use of space
  - Page results easy to navigate

### 16. Test Dark Mode Compatibility

- Toggle dark mode with PDF results displayed
- Verify all new elements styled correctly:
  - Page number labels
  - Page separators
  - Progress indicators
  - Error messages for PDF-specific errors
- Verify text contrast is adequate

### 17. Performance Optimization

- Optimize PDF-to-image conversion:
  - Use appropriate scale factor (2x for good OCR, not higher)
  - Process pages in batches if needed
  - Free memory after each page conversion
- Monitor browser memory usage with large PDFs:
  - Test with 10-page PDF at 50MB
  - Ensure no memory leaks
  - Ensure browser remains responsive
- Consider lazy loading page results for large PDFs

### 18. Code Quality Review

- Review all new TypeScript types:
  - Ensure proper typing for PDF-related functions
  - No `any` types in new code
- Check error handling:
  - All async functions have try/catch
  - User-facing errors are clear
  - Technical errors logged to console
- Verify naming conventions:
  - Functions in camelCase
  - Types in PascalCase
  - Constants in UPPER_SNAKE_CASE
- Remove any debug console.log statements
- Add JSDoc comments to new functions

### 19. Run Validation Commands

Execute validation commands to ensure the feature works correctly with zero regressions.

- Run `cd app && npm run lint`:
  - Verify zero ESLint errors
  - Fix any linting issues in new/modified code
  - Ensure imports are correctly ordered

- Run `cd app && npm run build`:
  - Verify successful build
  - Verify zero TypeScript errors
  - Check for any build warnings

- Run `cd app && npm run dev`:
  - Start development server
  - Navigate to http://localhost:3050
  - Test complete PDF workflow:
    - Upload single-page PDF → verify extraction works
    - Upload multi-page PDF → verify all pages processed
    - Test copy functionality for PDF results
    - Test download for individual pages and combined
    - Test error scenarios (large PDF, too many pages)
    - Test mixing PDFs and images
  - Toggle dark mode and verify appearance
  - Test responsive design
  - Verify no console errors
  - Navigate back to homepage
  - Test 2-3 other tools to confirm no regressions

## Testing Strategy

### Unit Tests

Since this application doesn't currently have a testing framework, unit tests are not included. However, if testing is added in the future, consider testing:

- **PDF Detection**: Test `isPdfFile()` with various file types and names
- **PDF Page Count**: Test `getPdfPageCount()` with single and multi-page PDFs
- **Page Conversion**: Test `convertPdfPageToImage()` produces valid image data
- **Validation**: Test validation functions accept PDFs and reject invalid files
- **Combined Text**: Test combined text formatting with page separators

### Integration Tests

Manual integration tests to perform:

- **PDF Upload to Conversion**: Verify PDF files are correctly converted to images
- **Conversion to OCR**: Verify converted images are sent to API correctly
- **OCR to Results**: Verify results are properly grouped by PDF pages
- **Results to Download**: Verify downloads contain correct text content
- **Mixed File Types**: Verify PDFs and images can be processed together
- **Error Propagation**: Verify PDF-specific errors display correctly

### Edge Cases

- **Single Page PDF**: PDF with exactly 1 page → treated like single image
- **Maximum Pages**: PDF with exactly 10 pages → should process successfully
- **Over Page Limit**: PDF with 11+ pages → should reject with clear error
- **Maximum Size**: PDF at 50MB → should process (may be slow)
- **Over Size Limit**: PDF at 51MB → should reject with size error
- **Empty PDF**: PDF with 0 pages or blank pages → handle gracefully
- **Password Protected**: PDF requiring password → show clear error
- **Corrupted PDF**: Malformed PDF file → show error, don't crash
- **Scanned at Angle**: Rotated pages → should still attempt OCR
- **Mixed Orientation**: Some landscape, some portrait pages → handle both
- **Very Small Pages**: PDF with small dimensions → may affect OCR quality
- **Very Large Pages**: PDF with large dimensions → may need scaling
- **PDF + Images Together**: Upload mix of types → process all correctly
- **Multiple PDFs**: Upload several PDFs at once (within file limit) → process all
- **No Text in PDF**: PDF with only images/diagrams → return "no text detected"

## Acceptance Criteria

1. **PDF Upload Support**:
   - Tool accepts PDF files (`.pdf`, `application/pdf`)
   - PDFs can be selected via file picker or drag-and-drop
   - File upload zone indicates PDF support in messaging
   - PDFs validated for size (50MB limit) and page count (10 pages limit)

2. **PDF Conversion**:
   - PDF pages converted to high-quality images client-side
   - Conversion uses pdfjs-dist (existing dependency)
   - Progress indicator shown during conversion
   - Conversion happens before API call (no PDF sent to server)

3. **Multi-Page Handling**:
   - Each PDF page processed separately through OCR
   - Results displayed page-by-page with page numbers
   - Individual page results can be copied/downloaded
   - Combined text can be downloaded for all pages

4. **OCR Accuracy**:
   - Conversion produces images suitable for OCR (high DPI)
   - OCR accuracy comparable to direct image upload
   - Formatting and line breaks preserved per page

5. **Error Handling**:
   - Clear error for PDFs over 50MB
   - Clear error for PDFs with more than 10 pages
   - Clear error for password-protected PDFs
   - Clear error for corrupted/unreadable PDFs
   - Partial success handled (some pages succeed, some fail)

6. **User Interface**:
   - File upload zone mentions PDF support
   - PDF page count shown after selection
   - Progress shows conversion and OCR phases
   - Results clearly indicate page numbers
   - Copy/download available per page and combined

7. **Mixed File Types**:
   - PDFs and images can be uploaded together
   - Each file processed according to its type
   - Results displayed appropriately for each type
   - File count limit (5) applies to total files

8. **Performance**:
   - PDF conversion completes in reasonable time
   - Browser remains responsive during conversion
   - Memory usage managed (cleanup after conversion)
   - 10-page PDF processes within 60 seconds

9. **Code Quality**:
   - No ESLint errors
   - No TypeScript errors
   - Proper types for PDF functions
   - Error handling comprehensive
   - JSDoc comments on new functions

10. **Compatibility**:
    - Works in Chrome, Firefox, Safari, Edge
    - Dark mode fully supported
    - Responsive design maintained
    - No regressions to existing image-only functionality

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `cd app && npm run lint` - Run linting to validate code quality. Must pass with zero errors.

- `cd app && npm run build` - Build the Next.js app to validate there are no TypeScript errors or build failures. Must complete successfully.

- `cd app && npm run dev` - Start development server and perform comprehensive manual testing:
  - Navigate to http://localhost:3050
  - Click on "Handwriting to Text" tool
  - **Test PDF single page**:
    - Upload a single-page PDF with handwriting
    - Verify PDF is accepted
    - Verify conversion happens (progress shown)
    - Verify text is extracted correctly
    - Test copy to clipboard
    - Test download as text
  - **Test PDF multi-page**:
    - Upload a 3-5 page PDF with handwriting
    - Verify page count is detected and shown
    - Verify each page is converted (progress for each)
    - Verify each page's text is extracted
    - Verify page numbers shown in results
    - Test copy/download for individual pages
    - Test "Download All" for combined text
  - **Test PDF validation**:
    - Try uploading PDF > 50MB → should show size error
    - Try uploading PDF > 10 pages → should show page limit error
  - **Test mixed files**:
    - Upload 1 PDF + 2 images together
    - Verify all are processed
    - Verify results displayed correctly for each
  - **Test existing image functionality**:
    - Upload JPEG/PNG image (no PDF)
    - Verify still works exactly as before
    - No regressions
  - **Test dark mode**:
    - Toggle dark mode
    - Verify PDF-related UI elements styled correctly
  - **Test responsive**:
    - Resize to mobile viewport
    - Verify PDF results display correctly
  - Navigate back to homepage
  - Test 2-3 other tools to confirm no regressions

## Notes

### Using pdfjs-dist for PDF Conversion

The project already has `pdfjs-dist` installed (version 5.4.394) for the PDF Splitter tool. We'll reuse this dependency for PDF-to-image conversion:

**Worker Setup**: PDF.js requires a worker for parsing. The worker should be loaded from the same version:
```typescript
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
```

The worker file needs to be copied to the public directory or use a CDN. Check existing PDF Splitter implementation for how this is handled.

**Rendering to Canvas**: PDF.js can render pages to a canvas element, which can then be exported as image data:
```typescript
const page = await pdfDoc.getPage(pageNumber);
const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for OCR quality
const canvas = document.createElement('canvas');
canvas.width = viewport.width;
canvas.height = viewport.height;
const context = canvas.getContext('2d');
await page.render({ canvasContext: context, viewport }).promise;
const imageData = canvas.toDataURL('image/png').split(',')[1];
```

### Scale Factor for OCR Quality

Using a 2x scale factor (DPI approximately 144-150 depending on original PDF DPI) provides a good balance between:
- **OCR accuracy**: Higher resolution helps AI read handwriting
- **File size**: 2x is usually sufficient without being excessive
- **Processing time**: Larger images take longer to process
- **Memory usage**: Very large canvases can cause browser issues

If users report accuracy issues, this could be made configurable in the future.

### Page Limit Rationale

The 10-page limit per PDF is chosen because:
- **API costs**: Each page requires a separate GPT-4o vision call (~$0.01 per page)
- **Processing time**: 10 pages at ~5 seconds each = ~50 seconds total
- **User experience**: Waiting more than a minute is poor UX
- **Memory**: Converting many pages to images uses significant memory

For users with larger documents, they can split the PDF first using the PDF Splitter tool.

### Memory Management

PDF-to-image conversion can use significant memory. Best practices:
- Release canvas and image data after conversion
- Process pages sequentially or in small batches (not all at once)
- Use smaller scale factor if memory issues occur
- Consider using OffscreenCanvas for better memory handling

### Existing PDF Utilities Reference

The project has existing PDF utilities that can be referenced:
- `app/lib/pdf-preview.ts` - Has `generatePdfPreview()` function for thumbnails
- `app/lib/pdf-splitter.ts` - Has PDF validation and parsing functions
- `app/types/pdf-splitter.ts` - Has PDF-related type definitions

These provide patterns for PDF handling that should be followed for consistency.

### Future Enhancements

After initial implementation, consider:
- **Progress per page**: Show "Processing page 3 of 5..." during OCR
- **Selective pages**: Let users choose which pages to OCR (like PDF Splitter)
- **Quality settings**: Let users choose conversion quality (faster vs. more accurate)
- **Batch PDF processing**: Upload multiple PDFs at once
- **Combine with PDF Splitter**: Extract pages from PDF, then OCR selected pages
- **Parallel processing**: Process multiple pages in parallel (with rate limiting)

### Cost Considerations

With PDF support, costs may increase:
- Each PDF page is a separate image sent to GPT-4o
- 10-page PDF = ~$0.10 in API costs
- Users should be aware that multi-page PDFs cost more
- Consider adding cost estimate before processing

Currently the tool doesn't show cost estimates, but this could be a future enhancement if usage grows.
