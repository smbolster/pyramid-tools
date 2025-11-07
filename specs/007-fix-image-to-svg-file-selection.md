# Bug: Image to SVG Converter Only Allows HEIC File Selection

## Bug Description
When attempting to use the Image to SVG converter tool, the file picker dialog and drag-and-drop zone only allow selection of HEIC files (.heic, .heif). Users cannot select PNG, JPEG, WebP, BMP, or GIF files as intended. The file picker shows only HEIC files in the selection dialog, and attempting to drag-and-drop other image formats results in validation errors.

**Symptoms:**
- File picker dialog filters to show only HEIC/HEIF files
- Drag-and-drop of PNG/JPEG/WebP files shows validation error
- Upload zone displays "Drop HEIC files here" instead of generic image message
- Validation fails for valid image formats (PNG, JPEG, etc.)

**Expected Behavior:**
- File picker should show all supported image formats (PNG, JPEG, WebP, BMP, GIF)
- Drag-and-drop should accept all supported image formats
- Upload zone should display appropriate message for image files
- Validation should accept all formats listed in SUPPORTED_IMAGE_FORMATS

**Actual Behavior:**
- File picker only shows HEIC files
- Only HEIC files pass validation
- Upload zone is hardcoded for HEIC files

## Problem Statement
The `FileUploadZone` component (`app/components/file-upload-zone.tsx`) is hardcoded specifically for HEIC file conversion. It has:
1. Hardcoded `accept` attribute: `.heic,.heif,image/heic,image/heif`
2. Hardcoded validation using `validateHeicFile()` from HEIC converter
3. Hardcoded UI text: "Drop HEIC files here"
4. Hardcoded max file size using HEIC converter constants

When the Image to SVG tool attempts to use this component, it passes `accept`, `maxSize`, and `multiple` props, but the component doesn't support these props. The component's interface only defines `onFilesSelected` and `disabled` props, causing all other props to be ignored.

## Solution Statement
Make the `FileUploadZone` component generic and reusable by:
1. Add `accept`, `maxSize`, `multiple`, and `validationFn` props to the component interface
2. Replace hardcoded HEIC-specific text with generic or prop-driven text
3. Replace hardcoded `validateHeicFile()` with optional custom validation function prop
4. Replace hardcoded `MAX_TOTAL_SIZE` with configurable `maxSize` prop
5. Use the provided props instead of hardcoded values throughout the component

This will allow the component to be reused by both the HEIC converter (its original purpose) and the Image to SVG converter (and any future tools).

## Steps to Reproduce
1. Navigate to http://localhost:3000
2. Click on "Image to SVG" tool card
3. Click "Select Files" button in the upload zone
4. Observe: File picker dialog only shows HEIC files, filters out PNG/JPEG/WebP files
5. Try to drag-and-drop a PNG file into the upload zone
6. Observe: Validation error occurs because it validates against HEIC format

## Root Cause Analysis
The root cause is that `FileUploadZone` was initially created specifically for the HEIC to JPEG converter tool and has hardcoded dependencies on HEIC-specific functionality:

**File:** `app/components/file-upload-zone.tsx`

**Line 7-8:** Imports HEIC-specific validation and constants
```typescript
import { validateHeicFile } from "@/lib/heic-converter";
import { MAX_TOTAL_SIZE } from "@/types/heic-converter";
```

**Line 10-13:** Component interface missing required props
```typescript
interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}
```
Missing: `accept`, `maxSize`, `multiple`, custom validation

**Line 44:** Uses HEIC-specific validation
```typescript
const validationError = validateHeicFile(file);
```

**Line 117:** Hardcoded HEIC-specific text
```typescript
<h3 className="text-lg font-semibold text-foreground">
  Drop HEIC files here
</h3>
```

**Line 130:** Hardcoded HEIC accept attribute
```typescript
accept=".heic,.heif,image/heic,image/heif"
```

**Line 32:** Uses HEIC-specific max size constant
```typescript
if (totalSize > MAX_TOTAL_SIZE) {
```

When `page.tsx` for Image to SVG tries to use this component (line 227-232), it passes props that are ignored:
```typescript
<FileUploadZone
  onFilesSelected={handleFileUpload}
  accept={SUPPORTED_IMAGE_FORMATS.join(',')}  // IGNORED!
  maxSize={MAX_FILE_SIZE}                      // IGNORED!
  multiple={false}                              // IGNORED!
/>
```

## Relevant Files
Use these files to fix the bug:

- **app/components/file-upload-zone.tsx** (lines 1-156)
  - Main component that needs to be made generic
  - Currently hardcoded for HEIC files
  - Needs to accept additional props: `accept`, `maxSize`, `multiple`, `validationFn`, `title`, `description`
  - Needs to remove HEIC-specific imports and use props instead
  - Needs to support custom validation function or no validation

- **app/app/tools/image-to-svg/page.tsx** (line 227-232)
  - Already passing the correct props but they're being ignored
  - No changes needed - props are already correct
  - Will work once FileUploadZone accepts these props

- **app/app/tools/heic-to-jpeg/page.tsx** (usage of FileUploadZone)
  - Needs to be updated to pass the props explicitly (accept, maxSize, validation)
  - Ensure backwards compatibility with existing HEIC converter
  - Add missing props that were previously hardcoded

## Step by Step Tasks

### 1. Update FileUploadZone Component Interface
- Open `app/components/file-upload-zone.tsx`
- Expand the `FileUploadZoneProps` interface to include:
  - `accept?: string` - File types to accept (e.g., "image/png,image/jpeg" or ".heic,.heif")
  - `maxSize?: number` - Maximum file size in bytes (per file, not total)
  - `maxTotalSize?: number` - Maximum total size for all files in bytes
  - `multiple?: boolean` - Whether to allow multiple file selection
  - `validationFn?: (file: File) => ValidationError | null` - Custom validation function
  - `title?: string` - Upload zone title (default: "Drop files here")
  - `description?: string` - Upload zone description
  - `maxSizeLabel?: string` - Text to display for max size (e.g., "Maximum file size: 50MB per file")
- Import `ValidationError` type from appropriate location or define locally
- Set sensible defaults for optional props

### 2. Remove HEIC-Specific Imports
- Remove `import { validateHeicFile } from "@/lib/heic-converter"`
- Remove `import { MAX_TOTAL_SIZE } from "@/types/heic-converter"`
- These will be replaced by props passed from the calling component

### 3. Update Component Implementation
- Replace `accept=".heic,.heif,image/heic,image/heif"` on line 130 with `accept={accept || "*/*"}`
- Replace `multiple` attribute on line 129 with `multiple={multiple !== false}` (default to true for backwards compatibility)
- Replace hardcoded title "Drop HEIC files here" (line 117) with `{title || "Drop files here"}`
- Replace hardcoded description (lines 119-122) with `{description || "or click the button below to select files from your device."}`
- Replace `MAX_TOTAL_SIZE` usage (line 32) with `maxTotalSize` prop
- Replace `validateHeicFile(file)` (line 44) with `validationFn?.(file)` (only validate if function provided)
- Replace hardcoded max size label (lines 140-142) with `{maxSizeLabel}` if provided
- Update error message for max total size (lines 33-35) to use the prop value dynamically

### 4. Update HEIC Converter to Pass Required Props
- Open `app/app/tools/heic-to-jpeg/page.tsx`
- Find the `<FileUploadZone>` component usage
- Add explicit props:
  - `accept=".heic,.heif,image/heic,image/heif"`
  - `maxSize={MAX_FILE_SIZE}` (import from HEIC types)
  - `maxTotalSize={MAX_TOTAL_SIZE}` (import from HEIC types)
  - `multiple={true}`
  - `validationFn={validateHeicFile}`
  - `title="Drop HEIC files here"`
  - `description="or click the button below to select files from your device. You can upload multiple files at once."`
  - `maxSizeLabel="Maximum file size: 50MB per file, 500MB total"`
- Import `validateHeicFile` from `@/lib/heic-converter` in the page component if not already imported
- Import `MAX_FILE_SIZE` and `MAX_TOTAL_SIZE` from `@/types/heic-converter`

### 5. Verify Image to SVG Props Are Correct
- Open `app/app/tools/image-to-svg/page.tsx`
- Verify lines 227-232 pass correct props (they already do):
  - `accept={SUPPORTED_IMAGE_FORMATS.join(',')}`
  - `maxSize={MAX_FILE_SIZE}`
  - `multiple={false}`
- Add optional props for better UX:
  - `title="Drop image files here"`
  - `description="or click the button below to select an image from your device. Supports PNG, JPEG, WebP, BMP, and GIF."`
  - `maxSizeLabel="Maximum file size: 10 MB | Maximum dimensions: 4096 × 4096 pixels"`
  - `validationFn={validateImageFile}` (already exists in the component)
- Import `validateImageFile` is already imported on line 21

### 6. Test HEIC Converter (Regression Testing)
- Start dev server: `npm run dev` in app directory
- Navigate to http://localhost:3000
- Click "HEIC to JPEG" tool
- Test file upload:
  - Click "Select Files" button
  - Verify file picker shows HEIC files only
  - Select one or more HEIC files
  - Verify files upload successfully
  - Verify validation works correctly
- Test drag-and-drop:
  - Drag HEIC file into upload zone
  - Verify it accepts the file
  - Try dragging a PNG file
  - Verify it rejects with appropriate error
- Verify conversion still works end-to-end
- Verify UI text is correct: "Drop HEIC files here"
- Verify max file size message: "Maximum file size: 50MB per file, 500MB total"

### 7. Test Image to SVG Converter (Bug Fix Validation)
- Navigate back to http://localhost:3000
- Click "Image to SVG" tool
- Test file picker:
  - Click "Select Files" button
  - **Verify file picker now shows PNG, JPEG, WebP, BMP, GIF files**
  - **Verify it does NOT show or filter to HEIC files**
  - Select a PNG file
  - Verify file uploads successfully
- Test drag-and-drop:
  - Drag a JPEG file into upload zone
  - Verify it accepts the file
  - Verify preview loads
  - Verify conversion starts automatically
- Test different formats:
  - Test with PNG file
  - Test with JPEG file
  - Test with WebP file
  - Test with BMP file
  - Verify all formats work correctly
- Test validation:
  - Try uploading a file >10MB (if available)
  - Verify appropriate error message
  - Try uploading a non-image file (e.g., .txt, .pdf)
  - Verify appropriate error message
- Verify UI text: "Drop image files here"
- Verify description mentions supported formats
- Verify max file size message is appropriate for Image to SVG

### 8. Test Edge Cases
- Test with no files selected (cancel file picker)
  - Verify no errors occur
- Test with empty FileList
  - Verify component handles gracefully
- Test rapid file selection changes
  - Select file, immediately select another
  - Verify no errors or race conditions
- Test multiple files on Image to SVG (should only accept 1)
  - Try to drag-and-drop multiple files
  - Verify only first file is processed or appropriate error
- Test very small file (1KB)
  - Verify it processes correctly
- Test file at exactly max size limit
  - Verify it's accepted

### 9. Code Quality and Cleanup
- Remove any console.log statements
- Ensure TypeScript types are correct
- Verify no unused imports
- Ensure consistent code style
- Add JSDoc comments to new props in interface
- Verify proper destructuring of props with defaults
- Check for any hardcoded values that should be props

### 10. Run Validation Commands
- Execute all validation commands to ensure zero regressions
- Fix any issues that arise

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm run lint` - Run linting to validate code quality with zero errors

- `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm run build` - Build the app to validate there are no TypeScript errors or build failures

- `cd /Users/sbolster/projects/corporate/pyramid-tools/app && npm run dev` - Start dev server and manually test:

  **Image to SVG Converter (Bug Fix Validation):**
  - Navigate to http://localhost:3000
  - Click "Image to SVG" tool
  - Click "Select Files" button
  - **CRITICAL: Verify file picker shows PNG, JPEG, WebP, BMP, GIF files, NOT just HEIC files**
  - Select a PNG file (e.g., logo.png)
  - Verify file uploads successfully
  - Verify image preview loads
  - Verify conversion starts automatically
  - Verify SVG preview displays
  - Click "Download SVG"
  - Verify SVG downloads correctly
  - Click "Start Over"
  - Try drag-and-drop with a JPEG file
  - Verify it accepts and processes the file
  - Test with WebP file (if available)
  - Verify it works correctly
  - Try uploading a PDF file (invalid format)
  - Verify appropriate error message: "Unsupported file format"
  - Verify no console errors in browser DevTools

  **HEIC to JPEG Converter (Regression Testing):**
  - Navigate back to homepage
  - Click "HEIC to JPEG" tool
  - Click "Select Files" button
  - Verify file picker shows HEIC files (should filter to HEIC only)
  - Verify UI text says "Drop HEIC files here"
  - If HEIC files available, select and convert
  - Verify conversion still works correctly
  - Try dragging a PNG file into HEIC upload zone
  - Verify it rejects with HEIC-specific error
  - Verify no console errors

  **Other Tools (Regression Testing):**
  - Navigate to homepage
  - Click "PDF Merger" tool (if exists)
  - Verify it loads and works correctly
  - Navigate to "Screenshot Annotator" tool (if exists)
  - Verify it loads and works correctly
  - Verify no regressions to any other tools

## Notes

### Why FileUploadZone Was Hardcoded
The `FileUploadZone` component was originally created specifically for the HEIC to JPEG converter tool. It was not initially designed as a reusable component, which is why it has hardcoded HEIC-specific functionality. This is a common pattern in early development - components are created for specific use cases and later need to be generalized when reused.

### Backwards Compatibility Strategy
To ensure the HEIC converter continues to work correctly:
1. All new props are optional with sensible defaults
2. The `multiple` prop defaults to `true` (existing behavior)
3. The HEIC converter will explicitly pass all props it needs
4. Validation is optional - if no `validationFn` provided, skip validation
5. UI text has sensible defaults that can be overridden

### Design Decision: Generic vs Specialized Components
Two approaches were considered:
1. **Create a separate generic FileUploadZone** and keep the HEIC-specific one
2. **Make the existing component generic** and update all usages

Decision: Make existing component generic because:
- Reduces code duplication
- Single component to maintain
- Clearer API with explicit props
- Easier to add new tools in the future
- Backwards compatible with proper defaults

### Alternative Validation Patterns
The `validationFn` prop accepts a function that returns `ValidationError | null`. This pattern:
- Allows each tool to provide custom validation
- Keeps validation logic with the tool (better separation of concerns)
- Makes FileUploadZone purely presentational
- Allows for complex validation rules without modifying FileUploadZone

Alternative considered: Pass validation rules as config object. Rejected because:
- Less flexible for complex validation
- Would require FileUploadZone to implement all possible validation logic
- Custom validations would be harder to implement

### Browser Compatibility: File Accept Attribute
The `accept` attribute behavior varies by browser:
- **Chrome/Edge**: Strictly filters file picker to matching types
- **Firefox**: Filters but allows "All Files" option
- **Safari**: May show all files with matching types highlighted

This is standard browser behavior and acceptable. Users can still drag-and-drop any file, and validation will catch invalid files.

### File Type Specification Formats
The `accept` attribute supports multiple formats:
- MIME types: `image/png,image/jpeg`
- Extensions: `.png,.jpg,.jpeg`
- Wildcards: `image/*`

The Image to SVG tool uses MIME types (e.g., `image/png,image/jpeg,image/webp,image/bmp,image/gif`) which is the most reliable cross-browser approach.

### Security Consideration: File Validation
Client-side validation (file type, size) is for UX only. If this tool ever adds server-side processing:
- **ALWAYS validate on the server**
- Client-side validation can be bypassed
- File extensions can be spoofed
- MIME types can be forged

Currently, all processing is client-side, so this is not a concern. But important to note for future development.

### Performance: Large File Handling
Files up to 10MB for Image to SVG and 50MB per file for HEIC conversion can impact browser performance:
- Large files take longer to read into memory
- Canvas operations on large images are CPU-intensive
- May cause browser tab to become unresponsive

Current implementation is acceptable. Future enhancements could include:
- Web Workers for non-blocking processing
- Streaming file reading for very large files
- Progress indicators during file read
- Memory usage warnings for very large files

### Testing Notes
When testing file selection:
1. Use real image files of various formats
2. Test with both file picker and drag-and-drop
3. Test on multiple browsers (Chrome, Firefox, Safari)
4. Test on different operating systems if possible (macOS, Windows)
5. Verify file picker filters work correctly on each platform
6. Check browser DevTools console for errors during testing

### Future Enhancements
Potential improvements to FileUploadZone:
- Support for file preview thumbnails in the drop zone
- Progress bar for large file uploads
- Batch file validation results (show which files passed/failed)
- Drag-and-drop multiple files with visual feedback for each
- Paste from clipboard support
- URL input for remote files
- Integration with cloud storage (Google Drive, Dropbox)

### Related Components
Other file upload patterns in the codebase:
- PDF Merger likely has its own file upload implementation
- Screenshot Annotator may use a different upload pattern
- Consider auditing all file upload components for consistency
- Future refactor: standardize all file uploads to use FileUploadZone
