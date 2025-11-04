# Feature: PDF Splitter

## Feature Plan Created: /Users/sbolster/projects/corporate/pyramid-tools/specs/004-pdf-splitter.md

## Feature Description

Create a PDF Splitter tool that allows users to split PDF documents into separate files. Users can upload a single PDF, visualize all pages with thumbnails, select specific pages or page ranges, choose splitting methods (individual pages, ranges, extract specific pages, or split by page count), and download the resulting PDF files. The tool will be entirely client-side, requiring no backend processing, ensuring complete privacy. It will provide an intuitive interface with drag-and-drop support, page previews, and flexible splitting options. This feature complements the existing PDF Merger tool, giving users complete control over their PDF documents for combining and separating content.

## User Story

As a user of Pyramid Tools
I want to split PDF documents into separate files using flexible selection options
So that I can extract specific pages, create multiple documents from one PDF, or organize content without needing external software or compromising my privacy

## Problem Statement

Users frequently need to split PDF documents for various purposes: extracting specific pages from large documents, separating chapters or sections, removing unwanted pages, creating individual files for distribution, or reorganizing document content. While many online PDF splitters exist, they often have limitations such as requiring file uploads to servers (privacy concerns), limiting file sizes or page counts, requiring account registration or payment, adding watermarks, or providing inflexible splitting options. Users need a fast, private, and flexible PDF splitting tool that works entirely in the browser, respects their privacy, supports various splitting methods, and provides visual feedback through page previews. The Pyramid Tools application currently has a PDF Merger but lacks the complementary ability to split PDFs, leaving users with only half the PDF management capabilities they need.

## Solution Statement

Implement a client-side PDF Splitter tool that:
- Accepts single PDF file uploads via drag-and-drop or file selector
- Displays all pages as thumbnail previews for easy visualization
- Provides multiple splitting methods:
  - Extract specific selected pages into a new PDF
  - Split into individual pages (one PDF per page)
  - Split by page ranges (user defines custom ranges)
  - Split by fixed page count (e.g., every 5 pages)
  - Split by file size (create PDFs under a target size)
- Allows multi-select page selection with visual feedback (checkboxes, click-to-select)
- Shows page numbers and page count for each resulting PDF
- Generates downloadable PDF files with descriptive filenames
- Handles large PDFs efficiently with lazy loading and pagination
- Validates PDF files and provides helpful error messages
- Works entirely client-side with no server requests for maximum privacy
- Follows established design patterns from existing tools (PDF Merger, HEIC Converter)
- Includes dark mode support consistent with the rest of the application
- Provides educational information about splitting methods and use cases

## Relevant Files

Use these files to implement the feature:

- **app/lib/tools.ts** (lines 10-59) - Tool registry where all tools are defined. Need to add new entry for the PDF Splitter with id "pdf-splitter", name "PDF Splitter", description, icon (Scissors or FileSlice from lucide-react), href "/tools/pdf-splitter", and category "PDF Tools" to group with PDF Merger.

- **app/app/page.tsx** - Homepage that displays all tools as cards. Once registered in tools.ts, the PDF Splitter will automatically appear. No direct changes needed.

- **app/app/layout.tsx** - Root layout with theme provider. No changes needed, but relevant for understanding app structure and dark mode support.

- **app/components/ui/button.tsx** - Reusable button component with variants. Will be used for upload, download, split, reset, and selection buttons.

- **app/components/theme-toggle.tsx** - Theme toggle component to include in the tool page header for consistency.

- **app/lib/utils.ts** - Utility functions including cn() helper for merging Tailwind classes.

- **app/lib/zip-utils.ts** - Contains downloadBlob() utility function for downloading generated PDF files. May need to add downloadMultipleBlobs() for batch downloads if splitting into many files.

- **app/lib/pdf-merger.ts** (lines 1-69) - Reference for PDF operations using pdf-lib. Shows patterns for loading PDFs, copying pages, creating documents, and error handling. Similar patterns will be used in pdf-splitter.ts.

- **app/lib/pdf-preview.ts** - Contains validatePdfFile(), generatePdfPreview(), and getPdfPageCount() functions. Will be reused for PDF validation and preview generation in the splitter tool.

- **app/types/pdf-merger.ts** - Reference for type definitions including PdfFileState, error messages, and constants. Similar structure needed for pdf-splitter types.

- **app/app/tools/pdf-merger/page.tsx** (lines 1-432) - Excellent reference for PDF tool page structure including drag-and-drop, file handling, state management, error handling, and UI layout patterns.

### New Files

- **app/app/tools/pdf-splitter/page.tsx** - Main tool page component. Client-side component ("use client") that includes:
  - PDF file upload with drag-and-drop support
  - Page thumbnail grid display with lazy loading for performance
  - Page selection interface (multi-select with checkboxes or click-to-toggle)
  - Splitting method selector (radio buttons or tabs):
    - Extract selected pages
    - Split into individual pages
    - Split by custom ranges (input fields)
    - Split by page count (number input)
    - Split by file size (size input with unit selector)
  - Preview of resulting PDFs (how many files, page counts, estimated sizes)
  - Split button to process the PDF
  - Download buttons for each resulting PDF (or batch download)
  - Reset button to clear and start over
  - Loading states and progress indicators
  - Validation and error handling
  - Info section explaining splitting methods and use cases
  - Consistent header with back link and theme toggle
  - Responsive layout for mobile/tablet/desktop

- **app/types/pdf-splitter.ts** - TypeScript type definitions including:
  - SplitMethod enum or type: 'extract' | 'individual' | 'ranges' | 'page-count' | 'file-size'
  - PdfSplitterState interface (file, pages, selectedPages, splitMethod, config, results, status, error)
  - PdfPageState interface (pageNumber, thumbnail, selected, width, height)
  - SplitRange interface (start: number, end: number, name?: string)
  - SplitResult interface (blob: Blob, filename: string, pageCount: number, pageNumbers: number[])
  - SplitConfig interface (method, ranges, pageCount, targetFileSize, etc.)
  - Constants: MAX_FILE_SIZE, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, DEFAULT_SPLIT_METHOD, ERROR_MESSAGES
  - SplitStatus enum: IDLE | LOADING | SPLITTING | SUCCESS | ERROR

- **app/lib/pdf-splitter.ts** - Core business logic for PDF splitting including:
  - splitPdf(file: File, config: SplitConfig): Promise<SplitResult[]> - Main splitting function
  - splitBySelectedPages(pdf: PDFDocument, pageNumbers: number[]): Promise<SplitResult> - Extract specific pages
  - splitIntoIndividualPages(pdf: PDFDocument): Promise<SplitResult[]> - One PDF per page
  - splitByRanges(pdf: PDFDocument, ranges: SplitRange[]): Promise<SplitResult[]> - Split by custom ranges
  - splitByPageCount(pdf: PDFDocument, pagesPerFile: number): Promise<SplitResult[]> - Fixed page count per file
  - splitByFileSize(pdf: PDFDocument, targetSizeBytes: number): Promise<SplitResult[]> - Target file size (advanced)
  - generateSplitFilename(originalName: string, part: number, total: number, pageRange?: string): string - Filename generation
  - validateSplitConfig(config: SplitConfig, totalPages: number): Error | null - Configuration validation
  - estimateSplitResults(config: SplitConfig, totalPages: number): number - Estimate number of resulting files
  - Helper functions for page range parsing and validation

- **app/components/pdf-page-grid.tsx** - Reusable component for displaying PDF pages in a grid:
  - Accepts pages array with thumbnails and metadata
  - Renders responsive grid of page thumbnails
  - Supports multi-select with checkboxes or click-to-toggle
  - Shows page numbers and selection state
  - Lazy loading for performance with large PDFs
  - Hover effects and visual feedback
  - "Select All" and "Select None" controls
  - Page range selection (shift-click to select range)
  - Responsive grid (adjusts columns based on viewport)
  - Dark mode compatible styling

- **app/components/split-method-selector.tsx** - Reusable component for selecting splitting method:
  - Tab-style or radio button interface
  - Options: Extract Selected, Individual Pages, Custom Ranges, By Page Count, By File Size
  - Description for each method
  - Dynamic configuration inputs based on selected method:
    - Custom Ranges: Multiple range inputs (start-end pairs)
    - By Page Count: Number input for pages per file
    - By File Size: Size input with MB/KB selector
  - Validation feedback for invalid configurations
  - Clear visual indication of selected method
  - Responsive layout

- **app/components/split-results-preview.tsx** - Component to preview split results before processing:
  - Shows how many files will be created
  - Lists each resulting PDF with page count and page numbers
  - Displays estimated file sizes
  - Allows editing/removing result previews before splitting
  - Provides clear visualization of the split outcome
  - Updates dynamically as configuration changes

## Implementation Plan

### Phase 1: Foundation

1. Analyze existing PDF Merger implementation to understand patterns and utilities
2. Research pdf-lib documentation for page extraction and document creation APIs
3. Create TypeScript type definitions for splitting methods, state, and configuration
4. Define constants for validation rules, default values, and error messages
5. Set up the basic file structure for the PDF Splitter tool
6. Create reusable component skeletons (page grid, method selector, results preview)

### Phase 2: Core Implementation

1. Implement core PDF splitting logic in lib/pdf-splitter.ts:
   - Main splitPdf() function that routes to specific split methods
   - splitBySelectedPages() for extracting specific pages
   - splitIntoIndividualPages() for one-page-per-file
   - splitByRanges() for custom page ranges
   - splitByPageCount() for fixed page count splits
   - Filename generation with appropriate naming conventions
2. Implement validation functions for split configurations
3. Create PDF page extraction and new document creation logic using pdf-lib
4. Build the PDF page grid component with thumbnail display and selection
5. Create the split method selector component with dynamic configuration inputs
6. Implement the split results preview component
7. Build the main tool page with file upload, state management, and UI integration
8. Add file validation and PDF loading with preview generation
9. Implement split execution with progress feedback
10. Add download functionality for individual and batch downloads

### Phase 3: Integration

1. Register the tool in lib/tools.ts so it appears on the homepage
2. Integrate all components into the main page with proper state management
3. Add comprehensive error handling for various failure scenarios
4. Implement loading states and progress indicators for long operations
5. Optimize performance with lazy loading, pagination, and efficient rendering
6. Ensure dark mode compatibility for all UI elements
7. Test responsive layout on mobile, tablet, and desktop
8. Validate accessibility (keyboard navigation, screen readers, focus indicators)
9. Add informational content about splitting methods, use cases, and best practices
10. Test with various PDF files (small, large, complex, simple, scanned, text-based)

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Research PDF Splitting Requirements

- Review pdf-lib documentation for page manipulation APIs (getPages, copyPages, removePage)
- Study the existing PDF Merger implementation to understand patterns
- Research common PDF splitting use cases and user expectations
- Identify technical constraints (browser memory limits, file size limits, performance considerations)
- Document API methods needed: PDFDocument.load(), getPages(), copyPages(), addPage(), save()

### 2. Create Type Definitions File

- Create `app/types/pdf-splitter.ts`
- Define `SplitMethod` type: 'extract' | 'individual' | 'ranges' | 'page-count' | 'file-size'
- Define `SplitStatus` enum: IDLE | LOADING_PDF | SPLITTING | SUCCESS | ERROR
- Define `PdfPageState` interface:
  - pageNumber: number
  - thumbnail: string | null
  - selected: boolean
  - width: number
  - height: number
  - isLoading: boolean
- Define `SplitRange` interface:
  - start: number (1-indexed)
  - end: number (1-indexed)
  - name?: string (optional custom name for the output file)
- Define `SplitResult` interface:
  - blob: Blob
  - filename: string
  - pageCount: number
  - pageNumbers: number[] (which pages are included)
  - size: number (bytes)
- Define `SplitConfig` interface:
  - method: SplitMethod
  - selectedPages?: number[] (for 'extract' method)
  - ranges?: SplitRange[] (for 'ranges' method)
  - pagesPerFile?: number (for 'page-count' method)
  - targetSizeBytes?: number (for 'file-size' method - advanced feature)
- Define `PdfSplitterState` interface:
  - file: File | null
  - originalFilename: string | null
  - totalPages: number
  - pages: PdfPageState[]
  - selectedPages: Set<number>
  - splitMethod: SplitMethod
  - config: SplitConfig
  - results: SplitResult[]
  - status: SplitStatus
  - error: string | null
  - progress: number (0-100 for progress bar)
- Define constants:
  - MAX_FILE_SIZE = 100 * 1024 * 1024 (100MB)
  - THUMBNAIL_WIDTH = 150
  - THUMBNAIL_HEIGHT = 200
  - DEFAULT_SPLIT_METHOD: SplitMethod = 'extract'
  - DEFAULT_PAGES_PER_FILE = 5
  - MAX_PAGES_PER_FILE = 100
  - MIN_PAGES_PER_FILE = 1
  - ERROR_MESSAGES with various error scenarios (file too large, invalid PDF, no pages selected, invalid ranges, etc.)
- Export all types and constants

### 3. Create PDF Splitting Utility Functions

- Create `app/lib/pdf-splitter.ts`
- Import PDFDocument from 'pdf-lib'
- Import types from types/pdf-splitter.ts
- Implement `validatePdfFile(file: File): Error | null`:
  - Check file size against MAX_FILE_SIZE
  - Verify file type is PDF
  - Return null if valid, Error object if invalid
- Implement `splitBySelectedPages(pdfDoc: PDFDocument, pageNumbers: number[], originalFilename: string): Promise<SplitResult>`:
  - Create new PDFDocument
  - Copy selected pages in order
  - Save to bytes
  - Create blob
  - Generate filename with page numbers
  - Return SplitResult
- Implement `splitIntoIndividualPages(pdfDoc: PDFDocument, originalFilename: string): Promise<SplitResult[]>`:
  - Get total page count
  - Loop through each page
  - For each page, create new PDF with single page
  - Generate filename like "document-page-5.pdf"
  - Return array of SplitResults
- Implement `splitByRanges(pdfDoc: PDFDocument, ranges: SplitRange[], originalFilename: string): Promise<SplitResult[]>`:
  - Validate ranges (start <= end, within total pages)
  - For each range, create new PDF with pages in range
  - Use custom range name if provided, otherwise use page range in filename
  - Return array of SplitResults
- Implement `splitByPageCount(pdfDoc: PDFDocument, pagesPerFile: number, originalFilename: string): Promise<SplitResult[]>`:
  - Calculate number of resulting files: Math.ceil(totalPages / pagesPerFile)
  - Loop and create PDFs with specified page count
  - Last PDF may have fewer pages
  - Generate filenames with part numbers
  - Return array of SplitResults
- Implement `generateSplitFilename(originalName: string, part: number, total: number, pageRange?: string): string`:
  - Remove .pdf extension from original name
  - Add part numbers or page ranges
  - Format: "document-part-1-of-3.pdf" or "document-pages-1-5.pdf"
  - Return formatted filename
- Implement `validateSplitConfig(config: SplitConfig, totalPages: number): Error | null`:
  - Validate based on split method
  - Check selected pages are within range
  - Check ranges are valid and non-overlapping
  - Check pagesPerFile is within allowed range
  - Return Error with specific message if invalid
- Implement `estimateResultCount(config: SplitConfig, totalPages: number): number`:
  - Based on method and config, estimate how many files will be created
  - Used for UI preview before splitting
- Implement `parsePdfFile(file: File): Promise<PDFDocument>`:
  - Read file as array buffer
  - Load with PDFDocument.load()
  - Return PDFDocument instance
  - Throw meaningful errors for corrupted files
- Add JSDoc comments explaining each function
- Export all functions

### 4. Create PDF Page Grid Component

- Create `app/components/pdf-page-grid.tsx`
- Make it a client component ("use client")
- Define props interface: PdfPageGridProps with:
  - pages: PdfPageState[]
  - selectedPages: Set<number>
  - onPageSelect: (pageNumber: number) => void
  - onSelectAll: () => void
  - onSelectNone: () => void
  - onSelectRange: (start: number, end: number) => void
  - disabled?: boolean
- Import Check, Square from lucide-react
- Implement component that:
  - Renders responsive grid (grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5)
  - Shows thumbnail image for each page
  - Displays page number overlay
  - Shows checkbox or selection indicator
  - Highlights selected pages with border/background
  - Supports click to toggle selection
  - Supports shift-click to select range (track last clicked page)
  - Shows loading skeleton for pages without thumbnails yet
  - Includes "Select All" and "Select None" buttons at the top
  - Displays selection count: "5 of 20 pages selected"
  - Responsive sizing of thumbnails
  - Hover effects on page cards
  - Dark mode compatible colors
- Implement lazy loading: only render thumbnails when in viewport (use IntersectionObserver or simple scroll-based logic)
- Style with Tailwind classes matching existing design patterns
- Export component

### 5. Create Split Method Selector Component

- Create `app/components/split-method-selector.tsx`
- Make it a client component ("use client")
- Define props interface: SplitMethodSelectorProps with:
  - selectedMethod: SplitMethod
  - onMethodChange: (method: SplitMethod) => void
  - config: SplitConfig
  - onConfigChange: (config: Partial<SplitConfig>) => void
  - totalPages: number
  - selectedPageCount: number
- Import icons from lucide-react (Scissors, FileStack, ListOrdered, etc.)
- Implement tab-style or card-based method selector
- Five method options:
  1. **Extract Selected Pages**:
     - Icon: Scissors
     - Description: "Create a new PDF from selected pages"
     - Show selected page count
     - Disabled if no pages selected
  2. **Split into Individual Pages**:
     - Icon: FileStack
     - Description: "Create separate PDFs for each page"
     - Show resulting file count (equals total pages)
     - Warning if page count is very high (>50 files)
  3. **Split by Custom Ranges**:
     - Icon: ListOrdered
     - Description: "Define custom page ranges"
     - Show input fields for ranges:
       - Multiple range inputs: Start Page, End Page, Optional Name
       - "Add Range" button to add more ranges
       - "Remove" button for each range
       - Validation: ranges within page count, no overlaps
  4. **Split by Page Count**:
     - Icon: LayoutGrid
     - Description: "Split into files with fixed page count"
     - Number input: Pages per file (default 5, min 1, max 100)
     - Show estimated file count
  5. **Split by File Size** (optional advanced feature):
     - Icon: HardDrive
     - Description: "Split into files under target size"
     - Size input with unit selector (MB, KB)
     - Note: "Approximate - actual size may vary"
     - Show estimated file count
- Highlight selected method with border and background color
- Disable methods that aren't applicable (e.g., Extract if no pages selected)
- Show validation errors inline for invalid configurations
- Update config onChange when inputs change
- Responsive layout (stack vertically on mobile)
- Dark mode compatible
- Export component

### 6. Create Split Results Preview Component

- Create `app/components/split-results-preview.tsx`
- Make it a client component ("use client")
- Define props interface: SplitResultsPreviewProps with:
  - results: SplitResult[] | null
  - isProcessing: boolean
  - onDownload: (index: number) => void
  - onDownloadAll: () => void
- Import Download, FileText, Loader2 from lucide-react
- Implement component that:
  - Shows count of resulting files: "This will create 3 PDF files"
  - Lists each result with:
    - Filename
    - Page count and page numbers
    - File size
    - Download button (if already split)
  - Shows "Download All" button if multiple results
  - Loading state with spinner during processing
  - Empty state: "Configure split method to see preview"
  - Success state: "Split complete! Download your files below."
  - Organized in a scrollable list or grid
  - Dark mode compatible styling
- Export component

### 7. Create Main PDF Splitter Page Structure

- Create `app/app/tools/pdf-splitter/page.tsx`
- Add "use client" directive at the top
- Import necessary dependencies:
  - React hooks: useState, useCallback, useEffect, useRef
  - Next.js Link component
  - Icons: ArrowLeft, Upload, Scissors, Download, RefreshCw, Loader2 from lucide-react
  - Button component
  - ThemeToggle component
  - PdfPageGrid component
  - SplitMethodSelector component
  - SplitResultsPreview component
  - Types from types/pdf-splitter.ts
  - Utilities from lib/pdf-splitter.ts and lib/pdf-preview.ts
  - downloadBlob from lib/zip-utils.ts
- Initialize state using useState:
  - pdfFile: File | null = null
  - originalFilename: string | null = null
  - totalPages: number = 0
  - pages: PdfPageState[] = []
  - selectedPages: Set<number> = new Set()
  - splitMethod: SplitMethod = 'extract'
  - splitConfig: SplitConfig = { method: 'extract' }
  - results: SplitResult[] = []
  - status: SplitStatus = SplitStatus.IDLE
  - error: string | null = null
  - isDragging: boolean = false
- Implement file upload handlers (drag-and-drop and file input)
- Implement PDF loading and page extraction for previews
- Implement page selection handlers (single, all, none, range)
- Implement split method and config change handlers
- Implement split execution function
- Implement download handlers (single file, batch)
- Implement reset function
- Create JSX structure following standard tool page template
- Export default component

### 8. Implement File Upload and PDF Loading

- Implement `handleFileSelected(file: File)`:
  - Validate file using validatePdfFile
  - Set error if invalid
  - Set status to LOADING_PDF
  - Reset previous state (pages, selections, results)
  - Parse PDF using parsePdfFile from lib/pdf-splitter.ts
  - Get page count
  - Initialize pages array with loading state
  - Set status to IDLE
  - Start generating thumbnails asynchronously
- Implement `generatePageThumbnails()`:
  - For each page, generate thumbnail using generatePdfPreview
  - Update pages array incrementally as thumbnails load
  - Use batch updates to avoid excessive re-renders
  - Handle errors gracefully (show placeholder for failed thumbnails)
- Implement drag-and-drop handlers:
  - handleDragOver: prevent default, set isDragging true
  - handleDragLeave: set isDragging false
  - handleDrop: extract file, call handleFileSelected
- Implement file input change handler:
  - Extract file from event
  - Call handleFileSelected
  - Reset input value for re-selection
- Show loading indicator while PDF is being processed
- Show error message if PDF loading fails

### 9. Implement Page Selection Logic

- Implement `handlePageSelect(pageNumber: number)`:
  - Toggle selection state for the page
  - Update selectedPages Set
  - Update pages array to reflect selection
  - If splitMethod is 'extract', update config.selectedPages
- Implement `handleSelectAll()`:
  - Add all page numbers to selectedPages Set
  - Update pages array to mark all as selected
  - Update config if method is 'extract'
- Implement `handleSelectNone()`:
  - Clear selectedPages Set
  - Update pages array to mark all as unselected
  - Update config if method is 'extract'
- Implement `handleSelectRange(start: number, end: number)`:
  - Add all pages in range to selectedPages Set
  - Update pages array
  - Update config if method is 'extract'
- Track last clicked page for shift-click range selection
- Provide visual feedback for selected pages

### 10. Implement Split Method and Configuration

- Implement `handleMethodChange(method: SplitMethod)`:
  - Update splitMethod state
  - Reset splitConfig to defaults for new method
  - Clear results
  - Set appropriate default config based on method:
    - 'extract': selectedPages from current selection
    - 'individual': no additional config needed
    - 'ranges': empty ranges array with one default range
    - 'page-count': default pagesPerFile = 5
    - 'file-size': default target size (optional)
- Implement `handleConfigChange(updates: Partial<SplitConfig>)`:
  - Merge updates into splitConfig
  - Validate new config
  - Update state
  - Clear previous results if config changed
- Validate config before enabling split button:
  - Check required fields are present
  - Validate values are within allowed ranges
  - Ensure configuration makes sense for the PDF
- Show validation errors inline in the method selector

### 11. Implement PDF Splitting Execution

- Implement `handleSplit()`:
  - Validate config one more time
  - Set status to SPLITTING
  - Clear previous results and errors
  - Load PDF document (already parsed earlier, or re-load)
  - Call appropriate split function based on method:
    - 'extract': splitBySelectedPages
    - 'individual': splitIntoIndividualPages
    - 'ranges': splitByRanges
    - 'page-count': splitByPageCount
  - Store results in state
  - Set status to SUCCESS
  - Handle errors: set error message and status to ERROR
- Show progress indicator during splitting
- Disable UI interactions while splitting
- Estimate time for large operations (show progress percentage if possible)
- Handle cancellation (optional: add cancel button for long operations)

### 12. Implement Download Functionality

- Implement `handleDownloadSingle(index: number)`:
  - Get result from results array by index
  - Use downloadBlob utility to trigger download
  - Log success/failure
- Implement `handleDownloadAll()`:
  - If only 1 result, just download it
  - If multiple results, consider:
    - Option 1: Download each file sequentially with small delay
    - Option 2: Create ZIP file with all PDFs (requires jszip, already in dependencies)
    - Recommendation: Create ZIP for better UX with multiple files
  - If using ZIP:
    - Import JSZip
    - Create new ZIP instance
    - Add each PDF blob to ZIP with filename
    - Generate ZIP blob
    - Download ZIP with name like "split-pdfs-{timestamp}.zip"
  - Show progress indicator for batch download
- Add download state tracking to show which files are being downloaded
- Provide feedback when download completes

### 13. Implement Reset and Clear Functionality

- Implement `handleReset()`:
  - Clear pdfFile
  - Reset originalFilename
  - Clear pages array
  - Clear selectedPages Set
  - Reset splitMethod to default
  - Clear splitConfig
  - Clear results
  - Reset status to IDLE
  - Clear error
  - Reset isDragging
- Add confirmation dialog for reset if results exist (optional)
- Revoke any object URLs created for thumbnails to prevent memory leaks
- Ensure clean state for fresh upload

### 14. Build Page Layout and UI

- Create page structure with:
  - Fixed theme toggle in top-right corner
  - Container with gradient background (matching other tools)
  - Header section:
    - Back link to homepage
    - Title: "PDF Splitter"
    - Decorative divider
    - Description text
  - Main content area with sections:
    1. **Upload Section** (when no file loaded):
       - Drag-and-drop zone
       - File input button
       - File size limits info
    2. **PDF Preview Section** (when file loaded):
       - PDF filename and info (page count, file size)
       - PdfPageGrid component
       - Quick selection buttons (Select All, None)
    3. **Split Configuration Section**:
       - SplitMethodSelector component
       - Validation messages
    4. **Results Preview Section**:
       - SplitResultsPreview component (before and after splitting)
       - Split button (or Download buttons after splitting)
    5. **Action Buttons**:
       - Split button (when configured)
       - Reset button (always available when file loaded)
    6. **Info Section** at bottom:
       - About PDF Splitter
       - Splitting methods explained
       - Privacy note
- Style with Tailwind classes matching PDF Merger and other tools
- Ensure responsive layout (stack sections on mobile)
- Add proper spacing, borders, shadows, and gradients

### 15. Add Error Handling and Validation

- Display validation errors prominently:
  - Use alert-style div with red/destructive border
  - Show specific error message from error state
  - Position at top of relevant section
- Add inline validation feedback:
  - Show red border on invalid inputs
  - Show warning icon when configuration invalid
  - Disable split button when invalid
- Handle various error scenarios:
  - Invalid PDF file
  - Corrupted PDF
  - File too large
  - No pages selected (for extract method)
  - Invalid ranges
  - PDF parsing errors
  - Memory errors (very large PDFs)
  - Browser limitations
- Provide actionable error messages:
  - "Please select at least one page to extract"
  - "Page range 5-10 exceeds total page count (8 pages)"
  - "File size exceeds 100MB limit"
- Log technical errors to console for debugging
- Clear errors when user corrects input

### 16. Add Informational Content

- Create "About This Tool" section at the bottom of the page
- Style as a card with rounded border and padding (matching other tools)
- Include information about:
  - **What is PDF Splitting?**
    - Explanation of splitting vs. merging
    - Common use cases (extracting chapters, removing pages, organizing content)
  - **Splitting Methods Explained**:
    - **Extract Selected Pages**: Choose specific pages to keep
    - **Individual Pages**: Create one PDF per page (useful for distribution)
    - **Custom Ranges**: Define multiple sections (e.g., chapters)
    - **By Page Count**: Split evenly into smaller documents
    - **By File Size** (if implemented): Keep PDFs under size limit for email attachments
  - **Best Practices**:
    - Preview pages before splitting to ensure correct selection
    - Use descriptive custom names for range-based splits
    - Consider file size for email attachments (typically <10MB)
    - Test split PDFs to ensure they contain expected content
  - **Privacy Note**: "All processing happens in your browser. Your PDFs are never uploaded to any server."
  - **Tips**:
    - Hold Shift to select multiple pages quickly
    - Use "Select All" then deselect unwanted pages for inverse selection
    - Custom ranges can overlap if you want pages in multiple output files
- Use proper typography and spacing
- Add icons if appropriate for visual interest

### 17. Style and Polish the Page

- Ensure consistent spacing using Tailwind spacing utilities (p-4, mb-6, etc.)
- Apply proper typography hierarchy:
  - text-4xl font-bold for main title
  - text-lg font-semibold for section headings
  - text-sm text-muted-foreground for descriptions
- Add subtle shadows and borders to sections (border, rounded-lg, shadow-sm)
- Ensure all interactive elements have hover and focus states:
  - Buttons: hover:bg-primary/90 focus:ring-2
  - Cards: hover:border-primary/50
  - Page thumbnails: hover:scale-105 transition-transform
- Verify dark mode styles for all elements:
  - Test background colors (bg-card, bg-background)
  - Test text colors (text-foreground, text-muted-foreground)
  - Test borders (border-border)
  - Test component backgrounds
- Make layout responsive:
  - Single column on mobile (<640px)
  - Two columns on tablet (640-1024px)
  - Three columns on desktop (>1024px) for page grid
  - Stack preview sections vertically on mobile
- Add smooth transitions for interactive elements (transition-colors, transition-transform)
- Ensure proper contrast ratios for accessibility (WCAG AA)
- Test all spacing and alignment
- Add loading skeletons for thumbnails (animated pulse)

### 18. Optimize Performance

- Implement lazy loading for page thumbnails:
  - Only generate thumbnails for visible pages
  - Use IntersectionObserver or scroll event
  - Load in batches (e.g., 10 pages at a time)
- Optimize thumbnail generation:
  - Use lower resolution for previews (150x200px)
  - Cache thumbnails in memory
  - Consider using canvas pooling to reduce memory
- Debounce config changes to avoid excessive re-renders
- Use React.memo for expensive components (PdfPageGrid, page cards)
- Batch state updates where possible
- Implement pagination for very large PDFs (>100 pages):
  - Show 50 pages at a time
  - Add "Load More" button or infinite scroll
- Monitor memory usage in DevTools:
  - Clean up blob URLs when components unmount
  - Revoke object URLs after use
  - Clear thumbnail cache on reset
- Test with large PDFs (100+ pages, 50MB+ files)
- Ensure smooth interactions with no lag

### 19. Register Tool in Tools Registry

- Open `app/lib/tools.ts`
- Add new entry to the tools array:
  ```typescript
  {
    id: "pdf-splitter",
    name: "PDF Splitter",
    description: "Split PDF documents into separate files",
    icon: "Scissors",
    href: "/tools/pdf-splitter",
    category: "PDF Tools",
  }
  ```
- Ensure icon "Scissors" is available in lucide-react
- Position in array near PDF Merger for logical grouping
- Verify category "PDF Tools" matches PDF Merger
- Save the file

### 20. Test PDF Splitting with Various Methods

- Test **Extract Selected Pages** method:
  - Upload a PDF with 10 pages
  - Select pages 1, 3, 5, 7, 9
  - Split and verify resulting PDF has exactly those 5 pages in order
  - Download and open PDF to confirm content
  - Test with single page selection
  - Test with all pages selected (should create duplicate of original)
- Test **Individual Pages** method:
  - Upload a PDF with 5 pages
  - Select Individual Pages method
  - Verify preview shows 5 files
  - Split and verify 5 separate PDFs created
  - Download all and verify each contains one page
  - Test download all as ZIP
- Test **Custom Ranges** method:
  - Upload a PDF with 20 pages
  - Define ranges: 1-5 (Intro), 6-15 (Main), 16-20 (Conclusion)
  - Verify preview shows 3 files
  - Split and verify each PDF contains correct page range
  - Test overlapping ranges (pages can appear in multiple outputs)
  - Test invalid ranges (end before start, out of bounds)
- Test **By Page Count** method:
  - Upload a PDF with 23 pages
  - Set pages per file to 5
  - Verify preview shows 5 files (5+5+5+5+3 pages)
  - Split and verify correct distribution
  - Test with page count of 1 (same as Individual Pages)
  - Test with page count equal to total (no split)
  - Test with various page counts (2, 10, 50, 100)

### 21. Test File Handling and Edge Cases

- Test file upload methods:
  - Drag and drop PDF onto drop zone
  - Click and select PDF from file picker
  - Test with same file twice
  - Test with non-PDF files (should show error)
- Test file size limits:
  - Upload PDF under 100MB (should work)
  - Upload PDF over 100MB (should show error)
  - Upload very small PDF (1 page, <100KB)
- Test various PDF types:
  - Text-based PDFs
  - Image-based PDFs (scanned documents)
  - PDFs with forms and annotations
  - Password-protected PDFs (should fail gracefully)
  - Corrupted PDFs (should show error)
  - PDFs with different page sizes (mixed portrait/landscape)
- Test page counts:
  - Single page PDF (limited split options)
  - Small PDF (5 pages)
  - Medium PDF (50 pages)
  - Large PDF (200+ pages) - test performance
- Test empty states:
  - No file uploaded
  - No pages selected
  - No split method configured

### 22. Test Selection and Interaction Features

- Test page selection:
  - Click single page to select
  - Click selected page to deselect
  - Shift-click to select range
  - Select All button
  - Select None button
  - Select pages, then change selection
- Test selection persistence:
  - Select pages, switch split method, switch back
  - Verify selection maintained
- Test keyboard navigation (if implemented):
  - Tab through page grid
  - Arrow keys to navigate pages
  - Space to toggle selection
  - Ctrl+A to select all
- Test hover effects and visual feedback:
  - Hover over pages shows highlight
  - Selected pages show clear indication
  - Disabled states show reduced opacity
- Test responsive page grid:
  - Resize browser window
  - Verify grid adjusts column count
  - Test on mobile viewport (2 columns)
  - Test on tablet viewport (3-4 columns)
  - Test on desktop viewport (5-6 columns)

### 23. Test Download Functionality

- Test single file download:
  - Split PDF into multiple files
  - Click download button for one file
  - Verify file downloads with correct filename
  - Open file and verify content
- Test batch download:
  - Split PDF into 3-5 files
  - Click "Download All" button
  - If ZIP: Verify ZIP file downloads
  - If ZIP: Extract and verify all PDFs present
  - If sequential: Verify all files download in order
- Test filename generation:
  - Verify filenames include part numbers: "document-part-1-of-3.pdf"
  - Verify filenames include page ranges: "document-pages-1-5.pdf"
  - Verify filenames for single page: "document-page-5.pdf"
  - Verify custom range names used if provided
  - Test with special characters in original filename
- Test download edge cases:
  - Download immediately after split
  - Download multiple times (should work repeatedly)
  - Split again and verify old results cleared
- Test in different browsers (Chrome, Firefox, Safari, Edge)

### 24. Test Performance with Large PDFs

- Test with medium PDF (50 pages, 10MB):
  - Measure load time (should be < 5 seconds)
  - Measure thumbnail generation time
  - Measure split operation time (should be < 10 seconds)
  - Verify no UI lag or freezing
- Test with large PDF (200 pages, 50MB):
  - Verify lazy loading works (not all thumbnails at once)
  - Verify page grid is responsive
  - Test memory usage in DevTools (should stay reasonable)
  - Split into individual pages and measure time
  - Verify browser doesn't crash or freeze
- Test rapid interactions:
  - Rapidly select/deselect pages
  - Quickly switch split methods
  - Upload, split, reset, and repeat
  - Verify no memory leaks (check DevTools Memory tab)
- Test concurrent operations (if applicable):
  - Upload while thumbnails loading
  - Split while still generating thumbnails
- Monitor performance metrics:
  - Time to interactive
  - First contentful paint
  - Bundle size impact (check build output)

### 25. Test Error Handling and Recovery

- Test error scenarios:
  - Upload invalid PDF (corrupted file)
  - Upload non-PDF file disguised as PDF
  - Upload encrypted/password-protected PDF
  - Select no pages with Extract method (should disable split button)
  - Define invalid ranges (end < start, out of bounds)
  - Set invalid page count (0, negative, > total pages)
  - Simulate network failure (offline mode) - should still work since client-side
  - Close browser tab during split (shouldn't cause issues on reload)
- Verify error messages:
  - Clear and specific
  - Actionable (tell user how to fix)
  - Properly styled (red border, destructive color)
  - Positioned correctly (near the issue)
- Test error recovery:
  - Trigger error, then upload valid file
  - Verify error clears
  - Trigger error, fix config, verify error clears
  - Test multiple errors in sequence
- Verify no console errors during normal operation:
  - Open DevTools console
  - Perform all operations
  - Check for errors, warnings, or failed requests

### 26. Test Dark Mode Compatibility

- Enable dark mode using theme toggle
- Verify all UI elements are visible and styled correctly:
  - Page background gradient
  - Section backgrounds and borders
  - Text colors (headings, labels, descriptions, body text)
  - Upload drop zone (border, background)
  - Page grid thumbnails (borders, selection indicators)
  - Split method selector (cards, borders, selected state)
  - Buttons (all variants: default, outline, destructive)
  - Results preview (cards, text)
  - Info section (background, text)
  - Error messages (red but still visible)
  - Success messages (green but still visible)
- Verify proper contrast in dark mode:
  - Text on backgrounds (should meet WCAG AA: 4.5:1)
  - Borders visible but not harsh
  - Interactive elements clearly distinguishable
- Test thumbnail visibility:
  - PDF page thumbnails visible against dark background
  - Selection overlay visible in dark mode
- Switch between light and dark mode multiple times:
  - Verify no layout shifts
  - Verify no visual glitches or flashing
  - Verify theme toggle works correctly

### 27. Test Responsive Layout and Mobile Experience

- Test on mobile viewport (375px width):
  - Verify single column layout
  - Verify page grid shows 2 columns
  - Verify all controls are accessible
  - Verify text is readable (not too small)
  - Verify buttons are tappable (not too small, min 44x44px)
  - Verify thumbnail size appropriate
  - Test drag-and-drop file upload (may not work on mobile)
  - Test file picker (should work on mobile)
  - Verify split method selector stacks vertically
  - Verify results preview scrollable
- Test on tablet viewport (768px width):
  - Verify page grid shows 3-4 columns
  - Verify two-column or transitional layout
  - Verify proper spacing and alignment
- Test on desktop viewport (1920px width):
  - Verify page grid shows 5-6 columns
  - Verify content is not stretched too wide (max-width container)
  - Verify good use of space
- Test landscape orientation on mobile
- Test zooming in/out (browser zoom):
  - Verify layout adapts
  - Verify text remains readable
  - Verify no horizontal scrolling
- Test on actual mobile devices (iOS, Android):
  - iPhone Safari
  - Android Chrome
  - Verify touch interactions work smoothly
  - Verify file picker works
  - Verify downloads work

### 28. Test Accessibility

- **Keyboard navigation**:
  - Tab through all interactive elements:
    - File input button
    - Back link
    - Theme toggle
    - Page thumbnails
    - Select All/None buttons
    - Split method options
    - Config inputs
    - Split button
    - Download buttons
    - Reset button
  - Verify visible focus indicators on all elements (focus ring)
  - Verify logical tab order (top to bottom, left to right)
  - Press Enter or Space to activate buttons
  - Test arrow keys in page grid (if implemented)
  - Verify no keyboard traps
- **Screen reader testing**:
  - Use screen reader (NVDA, JAWS, or VoiceOver)
  - Navigate the page
  - Verify all labels are announced correctly
  - Verify page numbers announced
  - Verify selection state announced ("selected" / "not selected")
  - Verify error messages are announced
  - Verify button purposes are clear
  - Verify form controls have associated labels
  - Check that thumbnails have alt text or aria-labels
  - Verify instructions are readable
- **Color contrast**:
  - Use browser DevTools or WebAIM Contrast Checker
  - Verify all text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
  - Verify button text is readable
  - Verify error messages have sufficient contrast
  - Verify in both light and dark modes
- **Focus management**:
  - Verify focus rings are visible and clear
  - Verify focus doesn't get lost during interactions
  - After split completes, focus moves to download buttons (optional enhancement)
- **ARIA attributes**:
  - Check that interactive elements have appropriate roles
  - Verify aria-labels used where text labels aren't visible
  - Check aria-describedby for error messages
  - Verify aria-disabled on disabled buttons
- **Semantic HTML**:
  - Verify proper heading hierarchy (h1 > h2 > h3)
  - Verify buttons are <button> elements (not divs)
  - Verify links are <a> elements
  - Verify form inputs have <label> elements

### 29. Test Integration and Navigation

- Test from homepage:
  - Navigate to homepage (/)
  - Verify "PDF Splitter" tool card appears
  - Verify card has:
    - Correct title: "PDF Splitter"
    - Correct description: "Split PDF documents into separate files"
    - Scissors icon
    - Category badge: "PDF Tools"
  - Verify card hover effects work
  - Click on the card
  - Verify navigates to /tools/pdf-splitter
  - Verify page loads correctly
- Test back navigation:
  - From PDF Splitter page, click "Back to Tools" link
  - Verify navigates back to homepage
  - Verify homepage displays correctly
  - Verify no state preserved (clean slate)
- Test theme persistence:
  - Enable dark mode on homepage
  - Navigate to PDF Splitter
  - Verify dark mode is applied
  - Toggle theme on PDF Splitter page
  - Navigate back to homepage
  - Verify theme toggle persisted
- Test browser navigation:
  - Use browser back button
  - Use browser forward button
  - Verify correct pages load
  - Verify state doesn't cause issues
- Test direct URL access:
  - Navigate directly to /tools/pdf-splitter
  - Verify page loads correctly
  - Verify all functionality works

### 30. Test with Other Tools (Regression Testing)

- Verify PDF Merger still works:
  - Navigate to PDF Merger
  - Upload multiple PDFs
  - Merge them
  - Download merged PDF
  - Verify no errors or regressions
- Verify HEIC Converter still works:
  - Navigate to HEIC Converter
  - Upload HEIC image (if available)
  - Convert to JPEG
  - Download image
  - Verify no errors
- Verify QR Code Generator still works (if implemented):
  - Navigate to QR Code Generator
  - Generate QR code
  - Download image
  - Verify no errors
- Verify homepage:
  - All tools display correctly
  - Tool cards clickable
  - Theme toggle works
  - No layout issues
  - PDF Splitter appears in correct category
- Check for CSS conflicts:
  - Verify styles from PDF Splitter don't affect other pages
  - Verify global styles still applied correctly
- Test transitions between tools:
  - Navigate from PDF Splitter to PDF Merger
  - Navigate from PDF Merger to PDF Splitter
  - Verify clean state transitions

### 31. Code Quality and Cleanup

- Review all new code for:
  - Proper TypeScript types (no `any` types unless absolutely necessary)
  - Consistent formatting and indentation (Prettier/ESLint)
  - Meaningful variable and function names
  - JSDoc comments on utility functions
  - No console.log statements (except intentional error logging)
  - No unused imports or variables
  - No commented-out code
  - No TODOs or FIXMEs
- Verify all files follow existing project conventions:
  - Import order: React, Next.js, third-party, local components, local utilities, types
  - Component structure: props interface, component function, export
  - File naming conventions (kebab-case for files, PascalCase for components)
- Ensure proper error handling in all async functions:
  - Try-catch blocks where appropriate
  - Meaningful error messages
  - Errors logged to console for debugging
- Run ESLint:
  - Fix all errors
  - Fix all warnings
  - Verify no linting issues remain
- Check TypeScript compilation:
  - Verify no type errors
  - Verify no implicit any
  - Verify all types properly defined
- Check dependencies:
  - Verify all imports resolve correctly
  - Verify no missing dependencies
  - Verify no unused dependencies

### 32. Documentation and Comments

- Add JSDoc comments to all functions in lib/pdf-splitter.ts:
  - Function purpose
  - Parameter descriptions
  - Return value description
  - Example usage (optional)
  - Throws information
- Document props interfaces with JSDoc comments:
  - Component purpose
  - Prop descriptions
  - Default values
- Add inline comments explaining non-obvious code:
  - Complex logic
  - Performance optimizations
  - Browser quirks or workarounds
  - Business logic decisions
- Ensure error messages are clear and actionable:
  - Tell user what went wrong
  - Suggest how to fix it
  - Use friendly, non-technical language
- Verify informational section on the page is accurate and helpful:
  - Splitting methods explained clearly
  - Use cases described
  - Best practices listed
  - Privacy note prominent
- Check that all constants have descriptive names:
  - MAX_FILE_SIZE, not LIMIT
  - THUMBNAIL_WIDTH, not SIZE
  - ERROR_MESSAGES, not ERRORS
- Ensure type definitions are clear and well-organized:
  - Logical grouping
  - Alphabetical order within groups
  - Exports at the end

### 33. Final Build and Validation

- Run `cd app && npm run lint`:
  - Verify zero linting errors
  - Verify zero warnings
  - Fix any issues found
- Run `cd app && npm run build`:
  - Verify successful build with no errors
  - Verify no TypeScript type errors
  - Verify no missing dependencies
  - Check build output size (bundle analysis)
  - Verify exit code 0
- Run `cd app && npm run dev`:
  - Start development server
  - Verify server starts without errors
  - Navigate to http://localhost:3050
  - Perform comprehensive end-to-end test:
    - Homepage loads correctly
    - PDF Splitter tool card visible
    - Click and navigate to PDF Splitter
    - Upload a PDF (use a real multi-page PDF for testing)
    - Verify thumbnails generate
    - Test page selection (select 3-5 pages)
    - Select Extract method
    - Click Split button
    - Verify splitting completes successfully
    - Download the extracted PDF
    - Open and verify it contains the correct pages
    - Click Reset
    - Upload the same PDF again
    - Select Individual Pages method
    - Split and verify multiple files created
    - Download all (as ZIP or individually)
    - Verify all files correct
    - Test dark mode toggle
    - Verify all UI elements visible in dark mode
    - Test responsive design (resize browser)
    - Verify no console errors or warnings
    - Navigate back to homepage
    - Test PDF Merger to ensure no regressions
    - Verify theme persists across navigation
  - Stop dev server

## Testing Strategy

### Unit Tests

Due to the client-side nature of this application and the current absence of a testing framework, formal unit tests are not included. However, if a testing framework is added in the future, consider testing:

- **validatePdfFile()**: Test with valid PDF, invalid file type, oversized file, null file
- **splitBySelectedPages()**: Test with single page, multiple pages, all pages, edge page numbers (first, last)
- **splitIntoIndividualPages()**: Test with 1 page PDF, 5 page PDF, 100 page PDF
- **splitByRanges()**: Test with single range, multiple ranges, overlapping ranges, invalid ranges (out of bounds, end < start)
- **splitByPageCount()**: Test with various page counts (1, 5, 10), test when pages don't divide evenly, test with page count > total pages
- **generateSplitFilename()**: Test filename generation with various inputs, special characters, long names
- **validateSplitConfig()**: Test all split methods with valid and invalid configs
- **estimateResultCount()**: Test estimation accuracy for all methods
- **Page selection logic**: Test select, deselect, select all, select none, range selection
- **State management**: Verify state updates correctly for all user actions

### Integration Tests

Manual integration tests to perform:

- **Upload to preview integration**: Verify uploaded PDF displays thumbnails correctly
- **Selection to config integration**: Verify selected pages update split config for extract method
- **Method to config integration**: Verify changing split method updates config appropriately
- **Config to preview integration**: Verify results preview updates based on config changes
- **Split to results integration**: Verify splitting produces correct number of files with correct content
- **Results to download integration**: Verify downloaded files match split results and are valid PDFs
- **Reset integration**: Verify reset clears all state and allows fresh start
- **Navigation integration**: Verify tool accessible from homepage and back link works
- **Theme integration**: Verify dark mode toggle affects entire page consistently
- **Multi-tool workflow**: Test splitting a PDF, then merging some results back together

### Edge Cases

- **Empty or invalid inputs**:
  - No file selected (shouldn't be able to proceed)
  - Invalid file type (show error)
  - Corrupted PDF (show meaningful error)
  - No pages selected with Extract method (disable split button)
  - Empty ranges array with Ranges method (show validation error)
- **Boundary conditions**:
  - Single page PDF (limited split options, Individual Pages would create 1 file)
  - Very large PDF (200+ pages, 50MB+, test performance and memory)
  - Minimum file size (empty or 1KB PDF)
  - Maximum file size (100MB limit, show error if exceeded)
  - Page count exactly divisible by split count vs. with remainder
- **Special PDF types**:
  - Mixed page sizes (portrait and landscape)
  - PDFs with images, forms, annotations
  - Scanned PDFs (image-based vs. text-based)
  - Password-protected PDFs (should fail gracefully with clear message)
  - PDFs with JavaScript or embedded files (should still split pages)
- **Selection edge cases**:
  - Select first page only
  - Select last page only
  - Select non-contiguous pages (1, 5, 9)
  - Select all then deselect one
  - Shift-click from last to first (reverse order)
- **Range edge cases**:
  - Range 1-1 (single page range)
  - Range covering all pages (1-100)
  - Overlapping ranges (1-10 and 5-15)
  - Invalid ranges (5-3, 100-200 when only 50 pages)
  - Zero-indexed vs. one-indexed confusion (ensure proper handling)
- **Download edge cases**:
  - Download single file
  - Download many files (50+ individual pages)
  - Download immediately after split
  - Download multiple times (should work repeatedly)
  - Browser blocks multiple downloads (handle gracefully)
- **Performance edge cases**:
  - Rapid file uploads
  - Rapid selection changes
  - Splitting while thumbnails still loading
  - Multiple splits without reset
  - Browser tab backgrounded during split
- **Network and environment**:
  - Offline mode (should work - client-side only)
  - Low memory device (may fail with large PDFs, show error)
  - Older browsers (should degrade gracefully or show browser upgrade message)
  - Mobile devices (limited memory, slower processing)

## Acceptance Criteria

1. **Tool Visibility**:
   - PDF Splitter tool appears on the homepage with correct title, description, and icon
   - Tool is accessible via /tools/pdf-splitter route
   - Tool card follows the same design pattern as other tools
   - Tool is grouped in "PDF Tools" category with PDF Merger

2. **File Upload Functionality**:
   - Accepts PDF files via drag-and-drop
   - Accepts PDF files via file picker
   - Validates file type (only PDFs accepted)
   - Validates file size (max 100MB)
   - Shows clear error messages for invalid files
   - Displays file name and metadata (page count, file size) after upload
   - Replaces previous file if new file uploaded

3. **PDF Preview and Thumbnails**:
   - Displays thumbnail preview for each page
   - Shows page numbers on thumbnails
   - Thumbnails are clear and readable
   - Lazy loading for large PDFs (doesn't load all thumbnails at once)
   - Loading state shows skeleton or spinner while thumbnails generate
   - Thumbnails generate within reasonable time (< 5 seconds for 50 pages)
   - Grid layout is responsive (adjusts columns based on viewport)

4. **Page Selection**:
   - Click to select/deselect individual pages
   - Shift-click to select range of pages
   - "Select All" button selects all pages
   - "Select None" button clears selection
   - Selected pages have clear visual indication (border, checkbox, background)
   - Selection count displayed (e.g., "5 of 20 pages selected")
   - Selection persists when switching between compatible split methods

5. **Split Methods Available**:
   - **Extract Selected Pages**: Creates single PDF with selected pages
   - **Split into Individual Pages**: Creates one PDF per page
   - **Split by Custom Ranges**: User defines multiple page ranges
   - **Split by Page Count**: Fixed number of pages per file
   - All methods clearly labeled with descriptions
   - Selected method visually highlighted
   - Incompatible methods disabled with explanation (e.g., Extract requires page selection)

6. **Split Configuration**:
   - Extract method: Uses currently selected pages
   - Individual Pages: No additional config needed
   - Custom Ranges: Input fields for start/end page, optional name, add/remove ranges
   - Page Count: Number input for pages per file (1-100)
   - Config validates in real-time
   - Validation errors shown inline
   - Invalid configs disable split button

7. **Results Preview**:
   - Shows number of files that will be created before splitting
   - Displays each resulting file with page count and page numbers
   - Updates dynamically as config changes
   - Clear and easy to understand
   - Helps user verify split will produce expected results

8. **Splitting Execution**:
   - Split button enabled only when config is valid
   - Loading indicator shows during processing
   - UI disabled during splitting to prevent concurrent operations
   - Splitting completes within reasonable time (< 10 seconds for typical PDFs)
   - Progress indicator for lengthy operations (optional enhancement)
   - Success message shown when complete
   - Results display with download options

9. **Download Functionality**:
   - Individual download button for each resulting PDF
   - "Download All" button for batch download
   - Batch download creates ZIP file with all PDFs (if multiple files)
   - Filenames are descriptive and include page info:
     - "document-part-1-of-3.pdf"
     - "document-pages-1-5.pdf"
     - "document-page-5.pdf"
   - Custom range names used in filenames if provided
   - Downloaded PDFs are valid and openable
   - Downloaded PDFs contain correct pages in correct order

10. **Validation and Error Handling**:
    - Clear error messages for all failure scenarios
    - Validation prevents invalid operations
    - Errors displayed prominently with red/destructive styling
    - Errors are actionable (tell user how to fix)
    - Errors clear when user corrects the issue
    - Handles edge cases gracefully (single page PDF, very large PDF, corrupted PDF)
    - No unhandled exceptions in console

11. **Reset Functionality**:
    - Reset button always accessible when file is loaded
    - Clears uploaded file
    - Clears page selection
    - Resets split method and config to defaults
    - Clears results
    - Clears errors
    - Returns to initial upload state

12. **User Interface**:
    - Page follows standard tool template (header with back link, theme toggle)
    - Layout is responsive (single column on mobile, multi-column on desktop)
    - All interactive elements have hover and focus states
    - Typography and spacing consistent with other tools
    - Informational section explains splitting methods and best practices
    - Privacy note prominently displayed
    - Clean, professional appearance

13. **Dark Mode Support**:
    - All UI elements visible and properly styled in dark mode
    - Text, borders, backgrounds adapt correctly to dark theme
    - Theme toggle present and functional on the tool page
    - Thumbnails visible against dark background
    - No contrast or readability issues in dark mode
    - Selection indicators visible in both themes

14. **Responsive Design**:
    - Works on mobile devices (375px width minimum)
    - Works on tablets (768px width)
    - Works on desktops (1920px width)
    - Layout adapts appropriately at all breakpoints
    - Page grid shows 2 columns on mobile, 3-4 on tablet, 5-6 on desktop
    - No horizontal scrolling at any viewport size
    - All buttons and interactive elements are tappable on mobile (min 44x44px)

15. **Accessibility**:
    - All form controls are keyboard accessible
    - Tab order is logical and intuitive
    - Focus indicators visible on all interactive elements
    - All inputs have associated labels
    - Error messages announced to screen readers
    - Color contrast meets WCAG AA standards in both themes
    - Page thumbnails have appropriate alt text or aria-labels
    - Buttons have clear labels or aria-labels

16. **Performance**:
    - PDF loads and displays thumbnails within 5 seconds (for typical 20-page PDF)
    - Splitting operation completes within 10 seconds (for typical PDF)
    - Large PDFs (100+ pages) handled with lazy loading
    - No UI lag or freezing during operations
    - Smooth interactions and transitions
    - Memory usage remains reasonable (no excessive consumption)
    - No memory leaks with repeated operations

17. **Browser Compatibility**:
    - Works correctly in Chrome, Firefox, Safari, and Edge (latest versions)
    - File upload works in all supported browsers
    - Download functionality works in all browsers
    - Thumbnails render correctly in all browsers
    - No console errors in any browser

18. **Privacy**:
    - All processing happens client-side
    - No data sent to any server
    - No network requests during file processing
    - Privacy note clearly stated on the page
    - User files never leave their device

19. **Code Quality**:
    - TypeScript types properly defined for all components and functions
    - No ESLint errors or warnings
    - Build completes successfully with no errors
    - Code follows existing project conventions and patterns
    - All files properly organized in appropriate directories
    - Functions well-documented with JSDoc comments

20. **Integration**:
    - PDF Splitter accessible from homepage
    - Back link returns to homepage correctly
    - Theme toggle integrates with global theme
    - No regressions to existing tools (PDF Merger, HEIC Converter, etc.)
    - Tool works seamlessly as part of the overall application

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `cd app && npm run lint` - Run linting to validate code quality. Must complete with zero errors and zero warnings.

- `cd app && npm run build` - Build the Next.js app to validate there are no TypeScript errors, type checking issues, or build failures. Must complete successfully with exit code 0.

- `cd app && npm run dev` - Start the development server and manually test the PDF Splitter feature end-to-end:
  - Navigate to http://localhost:3050
  - Verify "PDF Splitter" tool card appears on homepage with Scissors icon and "PDF Tools" category
  - Click on the PDF Splitter card
  - Verify page loads at /tools/pdf-splitter
  - Verify theme toggle appears in top-right corner
  - Verify back link navigates to homepage
  - **Test Extract Selected Pages method**:
    - Upload a multi-page PDF (use any PDF with 10+ pages for testing)
    - Verify thumbnails generate for all pages within 5 seconds
    - Select pages 1, 3, 5, 7, 9 by clicking thumbnails
    - Verify selected pages show visual indication (border/checkbox)
    - Verify "Extract Selected Pages" method is selected by default
    - Verify results preview shows "1 file will be created with 5 pages"
    - Click "Split PDF" button
    - Verify splitting completes within 5 seconds
    - Verify success message appears
    - Click "Download" button
    - Verify PDF file downloads with name like "filename-pages-1-3-5-7-9.pdf"
    - Open downloaded PDF and verify it contains exactly pages 1, 3, 5, 7, 9 in order
  - **Test Split into Individual Pages method**:
    - Click "Reset" button
    - Upload a PDF with 5 pages
    - Select "Split into Individual Pages" method
    - Verify results preview shows "5 files will be created"
    - Click "Split PDF" button
    - Verify splitting completes
    - Verify 5 separate download buttons appear (or one "Download All as ZIP" button)
    - Click "Download All" button
    - Verify ZIP file downloads
    - Extract ZIP and verify it contains 5 PDFs, each with 1 page
    - Open each PDF and verify content is correct page
  - **Test Split by Page Count method**:
    - Click "Reset" button
    - Upload a PDF with 23 pages
    - Select "Split by Page Count" method
    - Set pages per file to 5
    - Verify results preview shows "5 files will be created: 5+5+5+5+3 pages"
    - Click "Split PDF" button
    - Verify splitting completes
    - Download all PDFs
    - Verify 5 files created with correct page distribution (5, 5, 5, 5, 3 pages)
  - **Test Custom Ranges method**:
    - Click "Reset" button
    - Upload a PDF with 20 pages
    - Select "Split by Custom Ranges" method
    - Define first range: Start=1, End=5, Name="Introduction"
    - Click "Add Range" button
    - Define second range: Start=6, End=15, Name="Main Content"
    - Define third range: Start=16, End=20, Name="Conclusion"
    - Verify results preview shows "3 files will be created"
    - Click "Split PDF" button
    - Download all PDFs
    - Verify 3 files with names including custom names: "filename-Introduction.pdf", etc.
    - Verify each PDF contains correct page ranges
  - **Test validation and error handling**:
    - Try uploading non-PDF file (e.g., .txt, .jpg) - verify error message
    - Try uploading PDF > 100MB (if available) - verify file size error
    - Upload valid PDF but select Extract method with no pages selected - verify split button is disabled
    - Select Custom Ranges method and define invalid range (end < start) - verify validation error
    - Define range exceeding page count (e.g., 1-100 when only 20 pages) - verify validation error
  - **Test page selection features**:
    - Upload 20-page PDF
    - Click page 5 to select, click again to deselect - verify toggle works
    - Click "Select All" button - verify all 20 pages selected
    - Click "Select None" button - verify all pages deselected
    - Select page 5, then shift-click page 10 - verify pages 5-10 all selected
    - Verify selection count updates correctly (e.g., "6 of 20 pages selected")
  - **Test dark mode**:
    - Toggle dark mode using theme toggle in top-right corner
    - Verify all UI elements are visible and properly styled:
      - Page background adapts to dark theme
      - Text colors are readable
      - Borders are visible
      - Thumbnails are visible against dark background
      - Selected page indicators are visible
      - Buttons are properly styled
      - Error messages are readable
    - Toggle back to light mode and verify styles revert correctly
  - **Test responsive design**:
    - Resize browser window to mobile width (~375px)
    - Verify layout switches to single column
    - Verify page grid shows 2 columns
    - Verify all controls are accessible and tappable
    - Resize to tablet width (~768px)
    - Verify page grid shows 3-4 columns
    - Resize to desktop width (~1920px)
    - Verify page grid shows 5-6 columns
    - Verify content uses max-width container (not stretched full width)
  - **Test keyboard accessibility**:
    - Use Tab key to navigate through all interactive elements
    - Verify visible focus indicators (focus rings) on all elements
    - Verify tab order is logical (top to bottom, left to right)
    - Use Enter or Space to activate buttons
    - Verify no keyboard traps (can tab through entire page)
  - **Test performance**:
    - Upload a large PDF (50-100 pages if available)
    - Verify thumbnails load progressively (lazy loading)
    - Verify page remains responsive while thumbnails load
    - Select "Individual Pages" and split
    - Verify splitting completes in reasonable time (< 30 seconds)
    - Check browser console for memory warnings
  - **Test browser console**:
    - Open DevTools console
    - Perform all operations above
    - Verify zero errors in console
    - Verify zero warnings in console
    - Verify no failed network requests
  - **Test integration and navigation**:
    - Navigate back to homepage using back link
    - Verify homepage displays correctly
    - Verify PDF Splitter card is still present
    - Click PDF Merger card
    - Verify PDF Merger loads and works correctly (no regressions)
    - Navigate back to homepage
    - Verify theme persists across navigation
  - **Test multi-browser support** (perform key tests in at least 2 browsers):
    - Test in Chrome
    - Test in Firefox (or Safari if on Mac)
    - Verify upload, split, and download work in both browsers

## Notes

### Library Usage: pdf-lib

The PDF Splitter will use the existing `pdf-lib` library (already installed as a dependency for PDF Merger):
- **Why pdf-lib**: Powerful, well-maintained, browser-compatible, MIT licensed
- **Key APIs used**:
  - `PDFDocument.load(arrayBuffer)` - Load existing PDF
  - `PDFDocument.create()` - Create new PDF document
  - `pdfDoc.getPages()` - Get all pages
  - `pdfDoc.copyPages(srcDoc, pageIndices)` - Copy pages from another PDF
  - `pdfDoc.addPage(page)` - Add page to document
  - `pdfDoc.save()` - Serialize to bytes
- **No additional dependencies needed** - pdf-lib handles all PDF operations

### Thumbnail Generation

Thumbnails will be generated using the existing `generatePdfPreview()` function from `lib/pdf-preview.ts`:
- Uses `pdfjs-dist` (already a dependency) to render PDF pages to canvas
- Generates thumbnail images at lower resolution (150x200px) for performance
- Returns data URL for display in img tags
- Existing function is reusable without modifications

### Filename Generation Strategy

Filenames will be descriptive and include page information:
- **Extract method**: `originalname-pages-1-3-5-7-9.pdf`
- **Individual pages**: `originalname-page-5.pdf`
- **Ranges method**: `originalname-Introduction.pdf` (if custom name provided) or `originalname-pages-1-5.pdf`
- **Page count method**: `originalname-part-1-of-3.pdf`
- **Sanitize original filename**: Remove special characters, limit length, remove .pdf extension before appending

### Batch Download Strategy

For downloading multiple files:
- **Option 1 - Sequential downloads**: Download each file individually with small delay (simple but may be blocked by browser)
- **Option 2 - ZIP archive**: Use `jszip` (already a dependency) to create single ZIP file containing all PDFs (recommended for better UX)
- **Recommendation**: Implement ZIP download for multiple files, single download for single file
- **ZIP implementation**:
  ```typescript
  import JSZip from 'jszip';
  const zip = new JSZip();
  results.forEach((result, index) => {
    zip.file(result.filename, result.blob);
  });
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, 'split-pdfs.zip');
  ```

### Performance Optimization Strategies

For large PDFs (100+ pages, 50MB+):
- **Lazy thumbnail loading**: Only generate thumbnails for visible pages using IntersectionObserver
- **Pagination**: Show 50 pages at a time with "Load More" button
- **Canvas pooling**: Reuse canvas elements instead of creating new ones for each thumbnail
- **Web Workers** (advanced): Offload PDF processing to background thread to keep UI responsive
- **Memory management**: Revoke object URLs, clear thumbnail cache, use weak references
- **Progress indicators**: Show progress bar for lengthy operations (splitting 100+ pages)

### Split by File Size Implementation Notes

The "Split by File Size" method is an advanced feature that requires estimation:
- **Challenge**: PDF file size depends on page content (images, text, compression)
- **Approach**:
  - Calculate average bytes per page from original PDF
  - Estimate pages per file based on target size
  - Adjust dynamically as pages are added
  - May result in files slightly over/under target size
- **Consider making optional**: This method is complex and may not be as useful as others
- **Alternative**: Focus on other methods first, add file size splitting in future enhancement

### Use Cases for Each Split Method

Include these use cases in the informational section:

**Extract Selected Pages**:
- Remove unwanted pages from a document
- Extract specific chapters or sections
- Create a subset PDF for sharing
- Extract pages with relevant information

**Split into Individual Pages**:
- Distribute pages to different people
- Create separate files for each form, receipt, or document
- Archive pages individually
- Send single pages via email easily

**Split by Custom Ranges**:
- Separate chapters of a book or report
- Split document by sections (intro, body, conclusion)
- Create multiple documents from one (e.g., month 1, month 2, month 3 from annual report)
- Organize content by topic

**Split by Page Count**:
- Create consistently sized documents
- Limit pages per file for email attachment limits
- Batch process pages in groups
- Create volumes of fixed size

### Best Practices for Users

Include in informational section:
- **Preview before splitting**: Always check page thumbnails to ensure you're splitting correctly
- **Use descriptive names**: For custom ranges, use meaningful names like "Chapter 1" instead of default
- **Check page orientation**: Mixed portrait/landscape pages may need special attention
- **Consider file size**: Keep email attachment limits in mind (typically 10MB max)
- **Test split PDFs**: Open downloaded PDFs to verify they contain expected content
- **Save originals**: Splitting doesn't modify the original; it creates new files
- **Use ZIP for many files**: Downloading 50+ individual files can be cumbersome; ZIP is easier

### Accessibility Considerations

Ensure the following for WCAG AA compliance:
- **Color contrast**: 4.5:1 for normal text, 3:1 for large text
- **Focus indicators**: Visible focus rings on all interactive elements (outline: 2px solid)
- **Keyboard navigation**: All functionality accessible via keyboard
- **Screen reader support**: Proper labels, ARIA attributes, semantic HTML
- **Alternative text**: Descriptive alt text or aria-labels for thumbnails
- **Error identification**: Errors clearly identified and described
- **Flexible zoom**: Layout adapts to browser zoom up to 200%

### Future Enhancements

Potential features for future iterations:
- **Page rotation**: Rotate individual pages before splitting
- **Page deletion**: Remove unwanted pages (combine with extract functionality)
- **Merge after split**: Directly merge split results in different order
- **Batch processing**: Upload multiple PDFs and split all with same method
- **Save split presets**: Save commonly used split configurations for reuse
- **PDF manipulation**: Add, remove, reorder pages before splitting
- **OCR integration**: Extract text from scanned PDFs (requires additional library)
- **Bookmark preservation**: Maintain PDF bookmarks/table of contents after split
- **Metadata editing**: Edit PDF metadata (title, author) for split files
- **Cloud storage integration**: Save split PDFs directly to Google Drive, Dropbox, etc.
- **Progressive web app**: Enable offline use and installation as PWA

### Testing Resources

For thorough testing, prepare test PDFs:
- **Small PDF**: 5 pages, simple text, < 1MB
- **Medium PDF**: 20-50 pages, mixed content, 5-10MB
- **Large PDF**: 100+ pages, 30-50MB (test performance)
- **Complex PDF**: Forms, annotations, images, various page sizes
- **Scanned PDF**: Image-based pages from scanner
- **Text PDF**: Pure text, no images
- **Mixed orientation**: Portrait and landscape pages
- **Single page PDF**: Edge case testing
- **Corrupted PDF**: Test error handling (manually corrupt a PDF file)

Use online resources to generate test PDFs:
- Lorem Ipsum PDF generators
- PDF merger tools to create multi-page test files
- Scanner apps to create scanned test PDFs
- PDF editors to create complex test cases

### Security Considerations

Even though processing is client-side, consider:
- **File size limits**: Prevent browser crashes from extremely large files
- **Memory limits**: Handle out-of-memory errors gracefully
- **Malicious PDFs**: pdf-lib should handle safely, but catch parsing errors
- **XSS prevention**: Sanitize filenames before display
- **Content Security Policy**: Ensure blob URLs allowed for downloads
- **No server interaction**: Emphasize that files never leave the device

### Complementary Tool Workflow

PDF Splitter and PDF Merger are complementary:
- **Split then Merge**: Split large PDF into sections, then merge selected sections in different order
- **Merge then Split**: Combine multiple PDFs, then split by custom ranges to reorganize content
- **Use case**: User has multiple PDFs, merges them, realizes they need to reorder, splits and re-merges
- **Consider**: Add a "Send to Merger" button on split results (future enhancement)

### Bundle Size Impact

The PDF Splitter reuses existing dependencies:
- `pdf-lib` - already included (~200KB, used by PDF Merger)
- `pdfjs-dist` - already included (~500KB, used for previews)
- `jszip` - already included (~100KB, used elsewhere)
- **New code**: ~30-50KB (components, utilities, types)
- **Total impact**: Minimal, as all major dependencies already present
- **Code splitting**: Consider lazy loading the split page to reduce initial bundle size

### Browser Compatibility Notes

**Supported browsers**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features that may not work in older browsers**:
- `PDFDocument` API (pdf-lib requires modern JS features)
- Canvas API for thumbnails
- `File` API for upload
- `Blob` and `createObjectURL` for downloads
- CSS Grid for responsive layout

**Graceful degradation**:
- Show browser upgrade message for unsupported browsers
- Detect required features (File API, Canvas, etc.) and show warning if missing
- Provide fallback messaging for critical features

### Development Workflow Tips

**Iterative development approach**:
1. Start with Extract Selected Pages method (simplest)
2. Add page selection UI
3. Implement splitting logic
4. Add download functionality
5. Then add Individual Pages method
6. Then add Page Count method
7. Finally add Custom Ranges method (most complex)
8. Polish UI and error handling last

**Testing during development**:
- Keep 2-3 test PDFs handy for quick testing
- Use browser DevTools for performance profiling
- Test on actual mobile device, not just responsive mode
- Test in private/incognito mode to avoid extension interference
