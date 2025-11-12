# Feature: Server-Side HEIC to JPEG Conversion

## Feature Plan Created: specs/009-heic-server-side-conversion.md

## Feature Description

Refactor the existing HEIC to JPEG converter to perform conversion processing on the server instead of the client browser. This feature will migrate from using the client-side `heic2any` library to a server-side Node.js solution using the `heic-convert` library. Users will upload HEIC files to a Next.js API route handler, which will process the conversion on the server and return the converted JPEG images. This approach offloads the CPU-intensive conversion work from the user's browser to the server, improving performance for users with older devices or slower browsers, and providing more consistent conversion speed regardless of client capabilities. The user experience will remain similar - file upload, progress tracking, and download functionality - but the actual conversion will happen server-side.

## User Story

As a user with HEIC photos from my iPhone
I want the conversion to happen on the server
So that the conversion is faster, more reliable, and doesn't slow down my browser or device

## Problem Statement

The current HEIC to JPEG converter uses client-side conversion with the `heic2any` library, which processes HEIC files entirely in the user's browser using WebAssembly. While this approach has privacy benefits (files never leave the device), it has several significant drawbacks:

1. **Performance Issues**: HEIC conversion is CPU-intensive. On older devices, mobile phones, or browsers with limited resources, conversion can be very slow (5-10 seconds per image or more).

2. **Browser Limitations**: WebAssembly performance varies across browsers. Some browsers may struggle with large HEIC files, potentially causing the browser tab to freeze or crash.

3. **Inconsistent User Experience**: Conversion speed varies dramatically based on the user's device capabilities. A user on a modern desktop has a very different experience than a user on an older phone.

4. **Memory Constraints**: Processing large HEIC files in the browser can consume significant memory, potentially causing out-of-memory errors on devices with limited RAM.

5. **Limited Control**: Client-side conversion provides limited ability to optimize, monitor, or handle errors consistently across different browsers and devices.

By moving conversion to the server, we can provide a consistent, fast experience for all users regardless of their device capabilities, better error handling, and improved monitoring of conversion operations.

## Solution Statement

Migrate the HEIC to JPEG conversion from client-side to server-side by implementing the following:

1. **Install server-side conversion library**: Install `heic-convert` npm package for Node.js-based HEIC to JPEG conversion with quality control and format options.

2. **Create API Route Handler**: Create a Next.js App Router route handler at `app/api/convert-heic/route.ts` that:
   - Accepts multipart/form-data file uploads
   - Validates uploaded files (HEIC format, size limits)
   - Processes files using `heic-convert` library
   - Converts HEIC to JPEG with configurable quality (90%)
   - Returns converted JPEG files as response
   - Handles errors gracefully with meaningful error messages
   - Implements proper cleanup of temporary files
   - Supports batch conversion (multiple files)

3. **Update Client-Side Code**: Modify the HEIC to JPEG page component (`app/app/tools/heic-to-jpeg/page.tsx`) to:
   - Upload HEIC files to the API endpoint using FormData
   - Track upload and conversion progress
   - Handle server responses (success, errors)
   - Download converted JPEG files from server
   - Display meaningful error messages from server
   - Maintain the existing UI/UX (file upload zone, progress display, download functionality)

4. **Remove Client-Side Conversion**: Remove the `heic2any` dependency and all client-side conversion logic from:
   - `app/lib/heic-converter.ts` (replace with API client code)
   - `app/package.json` (remove heic2any dependency)

5. **Update Types**: Modify `app/types/heic-converter.ts` to support server-side conversion flow (upload states, server responses, error types).

6. **Maintain Batch Download**: Keep the ZIP file creation for multiple conversions, but create the ZIP from server-returned JPEG files rather than client-converted files.

This solution provides faster, more consistent conversion performance, better error handling, improved monitoring capabilities, and the ability to optimize server resources specifically for HEIC conversion tasks.

## Relevant Files

Use these files to implement the feature:

- **app/app/tools/heic-to-jpeg/page.tsx** - Main converter page component. Currently handles client-side conversion. Needs to be updated to upload files to API endpoint, handle server responses, and download converted files. The UI structure (file upload, progress tracking, download) will remain similar but the conversion logic will change from local processing to API calls.

- **app/lib/heic-converter.ts** - Core conversion utility. Currently wraps the `heic2any` library for client-side conversion. Needs to be refactored to become an API client that uploads files to the server endpoint and handles responses. Remove `convertHeicToJpeg` function's heic2any usage and replace with fetch calls to API route.

- **app/types/heic-converter.ts** - TypeScript type definitions. Currently defines types for client-side conversion states. Needs to be updated to include types for server upload/download, API responses, server error codes, and upload progress tracking.

- **app/components/file-upload-zone.tsx** - Reusable file upload component. No major changes needed, but may need to update validation messages to reflect server-side processing.

- **app/components/conversion-progress.tsx** - Progress display component. May need minor updates to show upload progress in addition to conversion progress, and to handle server-side error messages.

- **app/lib/zip-utils.ts** - ZIP archive creation utility. No changes needed. Will continue to create ZIP files from converted JPEG blobs, but those blobs will now come from the server instead of client-side conversion.

- **app/package.json** - NPM dependencies. Remove `heic2any` dependency and add `heic-convert` as a production dependency.

### New Files

- **app/app/api/convert-heic/route.ts** - Next.js App Router route handler for server-side HEIC conversion. This is the core new file that will:
  - Export a POST function to handle conversion requests
  - Accept multipart/form-data with HEIC file uploads
  - Use `await request.formData()` to extract uploaded files
  - Validate files (format, size, count)
  - Convert each HEIC file to JPEG using `heic-convert`
  - Return converted JPEG files as multipart response or JSON with base64 data
  - Handle errors with proper HTTP status codes and messages
  - Implement cleanup of any temporary files
  - Support batch conversion of multiple files
  - Include proper TypeScript types for request/response

- **app/lib/api-client.ts** (optional) - API client utility to centralize fetch logic for calling the convert-heic endpoint. This would provide:
  - Typed function `uploadAndConvertHeic(files: File[]): Promise<ConvertedFile[]>`
  - FormData construction
  - Fetch request with proper headers
  - Response parsing and error handling
  - Progress tracking using XMLHttpRequest or fetch with streams
  - Retry logic for failed uploads
  - Type-safe API communication

## Implementation Plan

### Phase 1: Foundation

1. Research and understand the `heic-convert` library API, configuration options, and best practices
2. Review Next.js App Router route handlers documentation for file uploads and streaming responses
3. Understand FormData handling in Next.js route handlers (`request.formData()`)
4. Plan the API endpoint structure (request format, response format, error handling)
5. Design the server-side conversion workflow (receive → validate → convert → return)
6. Determine response format (single JSON response with base64 vs streaming multipart response)
7. Plan cleanup strategy for any temporary files or buffers
8. Establish performance benchmarks (current client-side speed vs expected server-side speed)

### Phase 2: Core Implementation

1. Install the `heic-convert` library and verify compatibility with Next.js server environment
2. Create the API route handler at `app/api/convert-heic/route.ts`
3. Implement file upload handling using `request.formData()`
4. Implement HEIC file validation (format check, size limits, count limits)
5. Implement conversion logic using `heic-convert` with error handling
6. Implement response generation (return converted JPEG files)
7. Add comprehensive error handling with meaningful error messages
8. Implement cleanup of any temporary resources
9. Test the API endpoint independently using tools like Postman or curl
10. Optimize conversion performance (quality settings, parallel processing if applicable)

### Phase 3: Integration

1. Update `app/lib/heic-converter.ts` to call the API endpoint instead of using heic2any
2. Modify `app/app/tools/heic-to-jpeg/page.tsx` to upload files to the server and handle responses
3. Update `app/types/heic-converter.ts` with server-side conversion types
4. Update progress tracking to show upload + conversion progress
5. Test the full end-to-end flow (upload → convert → download)
6. Remove `heic2any` dependency from package.json
7. Verify ZIP file creation still works with server-returned files
8. Test error handling (invalid files, oversized files, network errors)
9. Test with various file sizes and quantities
10. Verify all UI states work correctly (loading, success, error)
11. Update any documentation or comments referencing client-side conversion
12. Ensure no regressions to other application features

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Install heic-convert Library

- Navigate to app directory: `cd app`
- Install heic-convert: `npm install heic-convert`
- Install type definitions if available: `npm install --save-dev @types/heic-convert` (if exists)
- Verify installation: Check package.json includes heic-convert
- Note: heic-convert may have peer dependencies - address any warnings

### 2. Create API Route Handler Structure

- Create directory: `app/app/api/convert-heic/`
- Create file: `app/app/api/convert-heic/route.ts`
- Import necessary dependencies:
  - `import { NextRequest, NextResponse } from 'next/server'`
  - `import convert from 'heic-convert'`
- Create POST handler function skeleton:
  ```typescript
  export async function POST(request: NextRequest) {
    try {
      // Implementation will go here
    } catch (error) {
      // Error handling
    }
  }
  ```
- Add TypeScript types for request/response
- Add JSDoc comments explaining the endpoint purpose

### 3. Implement File Upload Handling

- Extract FormData from request: `const formData = await request.formData()`
- Get uploaded files: `const files = formData.getAll('files')`
- Validate that files were provided:
  - Check if files array is empty
  - Return 400 error if no files uploaded
- Cast files to File type with proper type checking
- Log received files for debugging (development only)

### 4. Implement File Validation

- Create validation function `validateHeicFile(file: File)`
- Check file size against maximum limit (50MB per file)
- Check total size of all files (500MB max total)
- Check file extension (.heic or .heif)
- Check file MIME type if available (image/heic, image/heif)
- Count number of files (max 20 files per request)
- Return validation errors with specific error messages:
  - "File size exceeds maximum limit (50MB)"
  - "Total upload size exceeds limit (500MB)"
  - "Invalid file type. Only HEIC/HEIF files are supported"
  - "Too many files. Maximum 20 files per request"
- If validation fails, return 400 response with error details

### 5. Implement HEIC to JPEG Conversion

- Create conversion function `convertHeicToJpeg(file: File)`
- Read file contents into Buffer: `Buffer.from(await file.arrayBuffer())`
- Use heic-convert to convert:
  ```typescript
  const outputBuffer = await convert({
    buffer: inputBuffer,
    format: 'JPEG',
    quality: 0.9, // 90% quality
  });
  ```
- Handle conversion errors:
  - Catch errors from heic-convert
  - Check for specific error types (corrupted file, unsupported format, etc.)
  - Return meaningful error messages
- Create Blob from output buffer
- Generate filename: replace .heic/.heif with .jpg
- Return converted data with filename

### 6. Implement Batch Conversion

- Loop through all validated files
- Convert each file using the conversion function
- Track conversion progress for each file
- Collect successful conversions and errors separately
- If any conversions fail, decide on behavior:
  - Option 1: Return partial results with error details
  - Option 2: Fail entire request if any conversion fails
- Recommended: Return partial results with error details for better UX

### 7. Implement Response Generation

- Decide on response format:
  - **Option A**: JSON response with base64-encoded JPEG data (simpler)
  - **Option B**: Multipart response with binary JPEG data (more efficient)
- For JSON approach:
  ```typescript
  return NextResponse.json({
    success: true,
    conversions: [
      {
        filename: 'image.jpg',
        data: base64Data,
        size: dataSize,
      }
    ],
    errors: []
  });
  ```
- For multipart approach: Use multipart/mixed or return ZIP file
- Include metadata: original filename, converted filename, file size
- Include conversion status for each file (success/error)
- Set appropriate Content-Type headers

### 8. Implement Error Handling

- Wrap main logic in try-catch block
- Handle different error types:
  - Validation errors (400 Bad Request)
  - File reading errors (500 Internal Server Error)
  - Conversion errors (422 Unprocessable Entity)
  - Out of memory errors (507 Insufficient Storage)
  - Unknown errors (500 Internal Server Error)
- Return structured error responses:
  ```typescript
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'CONVERSION_FAILED',
        message: 'Failed to convert HEIC file',
        details: errorDetails,
      }
    },
    { status: 422 }
  );
  ```
- Log errors server-side for debugging
- Don't expose sensitive error details to client

### 9. Implement Resource Cleanup

- Ensure buffers are properly released after conversion
- No file system writes needed (process in memory)
- If using temporary files, implement cleanup in finally block
- Consider implementing timeout for long-running conversions
- Add request size limits to prevent memory exhaustion
- Verify no memory leaks with multiple conversions

### 10. Test API Endpoint Independently

- Use curl or Postman to test the endpoint
- Test successful conversion:
  - Upload single HEIC file
  - Verify response contains converted JPEG data
  - Verify JPEG data is valid
- Test multiple file upload:
  - Upload 2-5 HEIC files
  - Verify all are converted
- Test error cases:
  - Upload non-HEIC file (should reject)
  - Upload oversized file (should reject)
  - Upload 0 files (should reject)
  - Upload corrupted HEIC file (should handle gracefully)
- Test edge cases:
  - Very small HEIC files (<10KB)
  - Large HEIC files (20-50MB)
  - Maximum number of files (20)
- Verify response times are acceptable (<5 seconds for typical files)
- Check server logs for errors

### 11. Update Type Definitions

- Open `app/types/heic-converter.ts`
- Add types for API requests:
  ```typescript
  export interface ConvertHeicRequest {
    files: File[];
  }
  ```
- Add types for API responses:
  ```typescript
  export interface ConvertedFile {
    filename: string;
    data: string; // base64
    size: number;
    originalName: string;
  }

  export interface ConvertHeicResponse {
    success: boolean;
    conversions: ConvertedFile[];
    errors: Array<{
      filename: string;
      error: string;
    }>;
  }

  export interface ConvertHeicError {
    success: false;
    error: {
      code: string;
      message: string;
      details?: string;
    };
  }
  ```
- Add new error codes:
  - `UPLOAD_FAILED`
  - `SERVER_ERROR`
  - `NETWORK_ERROR`
- Update existing types if needed

### 12. Create API Client Function

- Open `app/lib/heic-converter.ts`
- Remove or comment out the existing `convertHeicToJpeg` function using heic2any
- Create new function `uploadAndConvertHeic`:
  ```typescript
  export async function uploadAndConvertHeic(
    files: File[]
  ): Promise<ConvertedFile[]>
  ```
- Implementation:
  - Create FormData instance
  - Append all files: `files.forEach(f => formData.append('files', f))`
  - Fetch API endpoint:
    ```typescript
    const response = await fetch('/api/convert-heic', {
      method: 'POST',
      body: formData,
    });
    ```
  - Check response status
  - Parse JSON response
  - Handle errors from server
  - Return converted files
- Add error handling for network errors, timeout, etc.
- Keep helper functions: `createPreviewUrl`, `generateJpegFilename`, `validateHeicFile` (client-side pre-validation)

### 13. Update Page Component - Remove Client-Side Conversion

- Open `app/app/tools/heic-to-jpeg/page.tsx`
- Remove import of old `convertHeicToJpeg` function
- Import new `uploadAndConvertHeic` function
- Locate the conversion logic in `handleFilesSelected` function
- Remove the batch conversion loop that called `convertHeicToJpeg`
- Remove the heic2any conversion code

### 14. Update Page Component - Add Server Upload Logic

- In `handleFilesSelected` function, replace conversion logic with:
  ```typescript
  try {
    // Update status to uploading/converting
    setFiles((prev) =>
      prev.map((f) => ({
        ...f,
        status: ConversionStatus.CONVERTING,
        progress: 0,
      }))
    );

    // Upload and convert on server
    const convertedFiles = await uploadAndConvertHeic(
      selectedFiles
    );

    // Update state with results
    // ... handle success
  } catch (error) {
    // ... handle error
  }
  ```
- Update progress tracking to show upload progress (may require XMLHttpRequest for detailed progress)
- Process the server response and update file states
- Create preview URLs from returned data (base64 to Blob)
- Handle partial success (some files converted, some failed)
- Display server error messages to user

### 15. Update Progress Tracking

- Consider adding upload progress tracking:
  - Option: Use XMLHttpRequest instead of fetch for progress events
  - Update progress bar during upload
  - Show "Uploading..." vs "Converting..." states
- If using fetch (no detailed progress):
  - Show indeterminate progress during upload/conversion
  - Update to 100% on completion
- Update `ConversionProgress` component if needed to display new states
- Add "Uploading to server..." message
- Keep existing progress animations and transitions

### 16. Update Download Functionality

- In `handleDownload` function, verify it still works with server-returned data
- Convert base64 data back to Blob:
  ```typescript
  const binaryData = atob(convertedFile.data);
  const bytes = new Uint8Array(binaryData.length);
  for (let i = 0; i < binaryData.length; i++) {
    bytes[i] = binaryData.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'image/jpeg' });
  ```
- Store blobs in file state for download
- Verify single file download works
- Verify multiple file ZIP download works
- Test download triggers and filename handling

### 17. Update Conversion Progress Component

- Open `app/components/conversion-progress.tsx`
- Review component to ensure it handles server-side conversion states
- May need to show additional states:
  - "Uploading to server..."
  - "Converting on server..."
  - "Downloading converted file..."
- Verify error messages from server are displayed correctly
- Ensure progress indicators work with new flow
- Test loading states and transitions

### 18. Remove heic2any Dependency

- Open `app/package.json`
- Remove the `heic2any` dependency from dependencies
- Run `npm uninstall heic2any` to remove it from node_modules
- Run `npm install` to ensure package-lock.json is updated
- Verify no other files import or reference heic2any:
  - Search codebase: `grep -r "heic2any" app/`
  - Remove any remaining imports or references
- Run build to verify no errors: `npm run build`

### 19. Test End-to-End Flow

- Start development server: `npm run dev`
- Navigate to http://localhost:3050/tools/heic-to-jpeg
- Test single file conversion:
  - Upload one HEIC file
  - Verify upload starts (UI shows uploading state)
  - Verify conversion completes
  - Verify preview displays
  - Click download
  - Verify JPEG file downloads correctly
  - Open downloaded file to verify it's valid
- Test multiple file conversion:
  - Upload 5 HEIC files
  - Verify all upload and convert
  - Verify previews display for all
  - Click download
  - Verify ZIP file downloads
  - Extract ZIP and verify all JPEG files are valid
- Test error handling:
  - Upload a non-HEIC file (should show error)
  - Upload oversized file (should show error from server)
  - Verify error messages are user-friendly

### 20. Test Edge Cases

- Test with 1 file (should download single JPEG)
- Test with 2 files (should download ZIP)
- Test with 10 files (batch conversion)
- Test with 20 files (maximum allowed)
- Test with 21 files (should show error or handle gracefully)
- Test with very small HEIC file (<10KB)
- Test with large HEIC file (>20MB)
- Test rapid repeated uploads (should handle gracefully)
- Test canceling/navigating away during upload (should not crash)
- Test with slow network (simulate in DevTools)
- Test with network disconnect during upload (should show error)

### 21. Test Different HEIC File Types

- Test with standard iPhone HEIC photos
- Test with HEIF files (different extension, same format family)
- Test with HEIC files with transparency (if supported)
- Test with HEIC files with EXIF data
- Test with Portrait mode HEIC files (depth data)
- Test with Live Photos HEIC files (if applicable)
- Verify all variants convert successfully

### 22. Performance Testing

- Measure conversion time for typical HEIC file (3-5MB):
  - Record time from upload start to download ready
  - Compare to previous client-side conversion time
  - Expected: Server-side should be faster or comparable
- Test with multiple files:
  - Upload 10 files, measure total time
  - Verify server handles concurrent conversion efficiently
- Monitor server resource usage (CPU, memory) during conversion
- Verify no memory leaks after multiple conversions
- Test under load (multiple users converting simultaneously)

### 23. Update UI Messages

- Review all user-facing messages in the page component
- Update privacy message:
  - Old: "All conversions happen in your browser. Your photos never leave your device."
  - New: "Files are uploaded to our server for conversion and are deleted immediately after processing. Your photos are never stored."
- Update description:
  - Mention server-side processing
  - Highlight speed improvements
- Update error messages to be clear and actionable
- Update tooltips or help text if any

### 24. Update Documentation

- Update `specs/heic-to-jpeg-converter.md` if it exists:
  - Note the change from client-side to server-side
  - Update architecture description
  - Update performance characteristics
  - Update privacy notes
- Update any inline code comments referencing client-side conversion
- Document the API endpoint in comments or separate API docs
- Add JSDoc comments to new functions

### 25. Security Review

- Verify file size limits are enforced server-side (don't trust client)
- Verify file type validation is robust (check magic bytes, not just extension)
- Ensure uploaded files are not written to disk (process in memory)
- If temporary files are used, ensure they're cleaned up even on error
- Verify no path traversal vulnerabilities in filename handling
- Ensure error messages don't leak sensitive server information
- Consider rate limiting for the API endpoint (future enhancement)
- Verify CORS settings if API will be called from other domains (not applicable for same-origin)

### 26. Error Handling Review

- Verify all error paths return appropriate HTTP status codes
- Ensure all errors are caught and handled gracefully
- Verify user sees meaningful error messages, not raw stack traces
- Test error logging works correctly server-side
- Verify client-side error handling for all API error responses
- Test handling of partial failures (some files succeed, some fail)
- Verify timeout handling for long-running conversions

### 27. Optimize Response Size

- Consider compression for JSON responses (Next.js handles this automatically)
- Evaluate if base64 encoding is efficient (base64 increases size by ~33%)
- Alternative: Return direct binary data as multipart response
- If using base64, document the tradeoff (simplicity vs size)
- Consider implementing streaming for large files (future enhancement)
- Verify gzip compression is enabled for API responses

### 28. Test on Different Browsers

- Test on Chrome (latest)
- Test on Firefox (latest)
- Test on Safari (latest)
- Test on Edge (latest)
- Test on mobile Safari (iOS)
- Test on mobile Chrome (Android)
- Verify file upload works consistently
- Verify download works consistently
- Verify no browser-specific errors

### 29. Test Dark Mode Compatibility

- Enable dark mode
- Navigate to HEIC to JPEG converter
- Upload and convert files
- Verify all UI elements are visible and styled correctly
- Verify progress indicators show correctly
- Verify error messages are readable
- Verify download buttons are visible
- Test theme persistence across conversion flow

### 30. Accessibility Testing

- Test keyboard navigation:
  - Tab through all interactive elements
  - Verify upload button is accessible via keyboard
  - Verify download buttons are accessible
  - Verify "Convert More Files" button is accessible
- Test with screen reader (VoiceOver, NVDA):
  - Verify file upload zone announces correctly
  - Verify conversion progress is announced
  - Verify success/error states are announced
  - Verify download buttons have proper labels
- Verify all buttons have proper ARIA labels
- Verify loading states are announced
- Verify focus management during upload/conversion

### 31. Mobile Testing

- Test on mobile device or DevTools mobile emulation
- Verify file upload works on mobile:
  - Test using camera to capture HEIC
  - Test selecting HEIC from photo gallery
  - Verify file picker opens correctly
- Test upload progress on mobile network
- Verify UI is responsive and touch-friendly
- Verify downloads work on mobile
- Test on portrait and landscape orientations
- Verify performance is acceptable on mobile devices

### 32. Validate No Regressions

- Test that other tools still work:
  - Navigate to Image to SVG converter
  - Upload and convert an image
  - Verify it works correctly
- Test PDF Merger tool
- Test QR Code Generator
- Test other tools in the application
- Verify dark mode still works application-wide
- Verify navigation between tools works
- Verify homepage displays correctly
- Verify no new console errors
- Verify no new build errors or warnings

### 33. Run Validation Commands

Execute validation commands to ensure the feature works correctly with zero regressions.

## Testing Strategy

### Unit Tests

While the application doesn't currently have formal unit tests, these would be valuable to add:

- **API Route Handler Tests** (`app/api/convert-heic/route.ts`):
  - Test successful single file conversion
  - Test successful batch file conversion
  - Test file validation (size, type, count)
  - Test error handling for invalid files
  - Test error handling for corrupted files
  - Test error handling for oversized files
  - Test conversion quality settings
  - Test response format and structure
  - Mock `heic-convert` library for predictable test results

- **API Client Tests** (`app/lib/heic-converter.ts`):
  - Test `uploadAndConvertHeic` with single file
  - Test `uploadAndConvertHeic` with multiple files
  - Test error handling for network failures
  - Test error handling for API errors
  - Test timeout handling
  - Mock fetch for predictable test results

- **Type Validation Tests**:
  - Test type definitions are correct
  - Test request/response types match API contract

### Integration Tests

Manual integration tests to perform:

- **Full Upload-Convert-Download Flow**:
  - Upload single HEIC → convert on server → download JPEG
  - Upload multiple HEIC → convert on server → download ZIP
  - Verify converted files are valid JPEG format
  - Verify file sizes are reasonable
  - Verify EXIF data is preserved (if applicable)

- **Error Flow Testing**:
  - Upload invalid file → server rejects → user sees error
  - Upload oversized file → server rejects → user sees error
  - Network interruption during upload → user sees error
  - Server conversion fails → user sees error with retry option

- **UI State Integration**:
  - File upload zone → conversion progress → download buttons
  - Error state → reset → ready for new upload
  - Multiple conversions in sequence without page refresh

### Edge Cases

- **File Validation Edge Cases**:
  - File with .heic extension but not actually HEIC format (should reject with meaningful error)
  - File with no extension (should reject)
  - Empty file (0 bytes) (should reject)
  - File exactly at size limit (50MB) (should accept)
  - File 1 byte over size limit (should reject)
  - Total size exactly at limit (500MB) (should accept)
  - Total size over limit (should reject)
  - 20 files (max allowed) (should accept)
  - 21 files (over max) (should reject with clear message)

- **Conversion Edge Cases**:
  - Very small HEIC file (<10KB) - should convert successfully
  - Very large HEIC file (45-50MB) - should convert but may be slow
  - HEIC file with unusual dimensions (very wide, very tall) - should handle
  - HEIC file with high resolution (>20 megapixels) - should handle
  - Corrupted HEIC file (partial data) - should reject with error
  - HEIC file with special characters in filename - should handle safely

- **Network Edge Cases**:
  - Very slow network (simulate with DevTools throttling)
  - Network disconnection mid-upload
  - Server timeout (very large file)
  - Server returns 500 error
  - Server returns malformed JSON

- **Browser Edge Cases**:
  - Upload in Safari (Apple's native browser for HEIC)
  - Upload in Firefox (HEIC support varies)
  - Upload in Chrome (HEIC support varies)
  - Upload in mobile browsers (iOS Safari, Chrome Android)
  - Multiple tabs uploading simultaneously
  - Browser tab loses focus during upload
  - Browser tab closed during upload (cleanup)

- **Concurrency Edge Cases**:
  - Multiple users uploading simultaneously to server
  - Same user uploading from multiple browser tabs
  - Rapid repeated uploads (clicking upload many times quickly)
  - Starting new upload before previous completes

- **Resource Edge Cases**:
  - Server running low on memory during conversion
  - Server running multiple conversions simultaneously
  - Server CPU at high utilization
  - Server reaching file descriptor limits

## Acceptance Criteria

### Functional Requirements

- [ ] API endpoint at `/api/convert-heic` accepts POST requests with multipart/form-data
- [ ] API endpoint validates uploaded files (HEIC format, size limits, count limits)
- [ ] API endpoint converts HEIC files to JPEG using `heic-convert` library
- [ ] API endpoint returns converted JPEG files or structured error responses
- [ ] API endpoint enforces file size limit of 50MB per file
- [ ] API endpoint enforces total size limit of 500MB per request
- [ ] API endpoint enforces maximum of 20 files per request
- [ ] API endpoint returns appropriate HTTP status codes (200, 400, 422, 500)
- [ ] Client uploads HEIC files to API endpoint using FormData
- [ ] Client displays upload/conversion progress to user
- [ ] Client handles API success responses and creates downloadable JPEG files
- [ ] Client handles API error responses and displays meaningful error messages
- [ ] Single file conversion results in direct JPEG download
- [ ] Multiple file conversion results in ZIP archive download containing all JPEGs
- [ ] Converted JPEG files have correct filenames (original name with .jpg extension)
- [ ] Converted JPEG files are valid and can be opened in image viewers
- [ ] `heic2any` dependency is removed from package.json
- [ ] All client-side conversion code using `heic2any` is removed or replaced

### Performance Requirements

- [ ] Conversion of a single 5MB HEIC file completes in <10 seconds on server
- [ ] Conversion of 10 average-sized HEIC files (3MB each) completes in <60 seconds
- [ ] Server-side conversion is faster than or comparable to client-side conversion
- [ ] API endpoint handles multiple concurrent requests without crashing
- [ ] No memory leaks after processing multiple conversion requests
- [ ] Server resource usage is reasonable (CPU <80%, memory <2GB for typical loads)
- [ ] Upload progress is displayed to user (even if approximate)
- [ ] UI remains responsive during upload and conversion

### User Experience Requirements

- [ ] User can upload HEIC files via drag-and-drop or file selection (unchanged)
- [ ] User can upload multiple HEIC files at once (unchanged)
- [ ] User sees progress indication during upload and conversion
- [ ] User sees preview thumbnails of converted images
- [ ] User can download single JPEG or ZIP archive of multiple JPEGs (unchanged)
- [ ] Error messages are clear, specific, and actionable
- [ ] Invalid file uploads are rejected with helpful error messages
- [ ] UI indicates server-side processing (e.g., "Converting on server...")
- [ ] Privacy notice is updated to reflect server-side processing
- [ ] "Convert More Files" button works to reset and start over
- [ ] User can't upload files exceeding size limits (validated on server)

### Technical Requirements

- [ ] Code follows existing project patterns and conventions
- [ ] TypeScript types are properly defined for all API interactions
- [ ] Error handling is comprehensive and graceful
- [ ] Server-side validation is robust and doesn't trust client input
- [ ] Temporary resources are properly cleaned up
- [ ] No sensitive information is exposed in error messages
- [ ] API endpoint has proper request/response logging for debugging
- [ ] Code is well-commented and maintainable
- [ ] No console errors in browser during normal operation
- [ ] No server errors or warnings in logs during normal operation

### Quality Requirements

- [ ] Application builds successfully: `npm run build` completes with no errors
- [ ] Linting passes: `npm run lint` completes with no errors
- [ ] All features work correctly in Chrome, Firefox, Safari, and Edge
- [ ] All features work correctly on mobile devices (iOS Safari, Android Chrome)
- [ ] Dark mode works correctly throughout the conversion flow
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen readers can navigate and understand all states
- [ ] No regressions to existing application features (other tools still work)
- [ ] UI is responsive and works on mobile viewports (320px+)

### Documentation Requirements

- [ ] API endpoint has JSDoc comments explaining functionality
- [ ] Code comments explain server-side conversion approach
- [ ] Privacy notice is updated to mention server-side processing
- [ ] Error handling is documented in code comments
- [ ] Updated types have proper JSDoc comments

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

### Build and Lint Validation

- `cd app && npm run lint` - Run ESLint to ensure code quality. Must complete with zero errors. Verify no warnings related to new code.

- `cd app && npm run build` - Build the Next.js application to validate there are no TypeScript errors, build failures, or configuration issues. Must complete successfully with exit code 0.

### API Endpoint Testing (Manual)

Since the application doesn't have automated API tests, perform these manual tests:

- Start development server: `cd app && npm run dev`

- **Test API Endpoint Directly with curl**:
  ```bash
  # Test with a sample HEIC file
  curl -X POST http://localhost:3050/api/convert-heic \
    -F "files=@/path/to/sample.heic" \
    -o response.json
  ```
  - Verify response status is 200
  - Verify response contains converted JPEG data
  - Verify response JSON structure matches expected format

- **Test API Error Handling**:
  ```bash
  # Test with invalid file
  curl -X POST http://localhost:3050/api/convert-heic \
    -F "files=@/path/to/invalid.txt"
  ```
  - Verify response status is 400 or 422
  - Verify response contains error message
  - Verify error message is descriptive

### End-to-End Testing

- **Test Single File Conversion**:
  - Navigate to http://localhost:3050/tools/heic-to-jpeg
  - Click "Upload HEIC Files" or drag-drop a single HEIC file
  - Verify file is accepted (shows in upload zone or begins processing)
  - Verify progress indicator shows (uploading/converting state)
  - Wait for conversion to complete
  - Verify preview thumbnail appears
  - Verify "Download JPEG" button appears
  - Click "Download JPEG" button
  - Verify JPEG file downloads to your computer
  - Open downloaded JPEG file in image viewer
  - Verify JPEG is valid and displays correctly
  - Verify filename is original name with .jpg extension

- **Test Multiple File Conversion**:
  - Click "Convert More Files" or refresh page
  - Upload 3-5 HEIC files at once
  - Verify all files are accepted
  - Verify progress indicator shows for all files
  - Wait for all conversions to complete
  - Verify preview thumbnails appear for all files
  - Verify "Download ZIP Archive" button appears
  - Click "Download ZIP Archive" button
  - Verify ZIP file downloads
  - Extract ZIP file
  - Verify ZIP contains correct number of JPEG files
  - Open each JPEG file and verify all are valid
  - Verify filenames are correct

- **Test Error Handling**:
  - Attempt to upload a non-HEIC file (e.g., .txt, .png)
  - Verify error message appears: "Invalid file type. Only HEIC/HEIF files are supported"
  - Verify no upload or conversion occurs
  - Verify user can dismiss error and try again
  - If possible, test with oversized file (>50MB)
  - Verify error message appears about file size
  - Test with network disconnected (DevTools offline mode)
  - Upload a file and disconnect network
  - Verify network error is handled gracefully
  - Verify error message is user-friendly

- **Test Edge Cases**:
  - Upload exactly 1 file → verify single JPEG download
  - Upload exactly 2 files → verify ZIP download (not single file)
  - Upload 10 files → verify batch processing works
  - Upload 20 files (maximum) → verify all convert successfully
  - Test with very small HEIC file (<100KB) → verify conversion works
  - Test with large HEIC file (>10MB) → verify conversion works but may take longer
  - Test rapid clicks on upload button → verify no crashes or duplicate uploads
  - Test "Convert More Files" button → verify state resets correctly

### Browser Compatibility Testing

- **Test in Chrome**:
  - Open http://localhost:3050/tools/heic-to-jpeg in Chrome
  - Perform single file and multiple file conversion tests
  - Verify no console errors (F12 → Console tab)
  - Verify no network errors (F12 → Network tab)
  - Verify UI renders correctly

- **Test in Firefox**:
  - Repeat all tests in Firefox
  - Verify file upload works
  - Verify conversion works
  - Verify downloads work
  - Verify no console errors

- **Test in Safari** (if available):
  - Repeat all tests in Safari
  - Safari has native HEIC support, so this is particularly important
  - Verify HEIC files from iPhone work correctly
  - Verify downloads work (Safari handles downloads differently)

- **Test in Edge**:
  - Repeat basic conversion tests
  - Verify no compatibility issues

### Mobile Testing

- **Test on Mobile Device or DevTools Mobile Emulation**:
  - Open DevTools (F12)
  - Enable device emulation (Ctrl+Shift+M or Cmd+Shift+M)
  - Select iPhone or Android device
  - Navigate to http://localhost:3050/tools/heic-to-jpeg
  - Test file upload:
    - Click upload button
    - Verify file picker opens
    - Select HEIC file from photo gallery (or use sample file)
  - Verify upload and conversion work on mobile viewport
  - Verify UI is responsive and elements are touch-friendly
  - Verify progress indicators show correctly
  - Verify downloads work on mobile
  - Test in portrait and landscape orientations

### Dark Mode Testing

- **Test Dark Mode Throughout Conversion Flow**:
  - Enable dark mode using theme toggle (top-right corner)
  - Navigate to HEIC to JPEG converter
  - Verify page renders correctly in dark mode
  - Upload and convert files
  - Verify file upload zone is visible and styled correctly
  - Verify progress indicators are visible
  - Verify preview thumbnails have proper contrast
  - Verify all buttons are visible and readable
  - Verify error messages (if triggered) are readable
  - Toggle back to light mode
  - Verify everything still works and renders correctly

### Accessibility Testing

- **Test Keyboard Navigation**:
  - Navigate to HEIC to JPEG converter
  - Use Tab key to move through interactive elements
  - Verify upload button is reachable via keyboard
  - Press Enter or Space to activate upload button
  - Verify file picker opens
  - After conversion completes, Tab to download button
  - Press Enter to trigger download
  - Tab to "Convert More Files" button
  - Press Enter to reset
  - Verify focus is visible on all interactive elements
  - Verify focus order is logical

- **Test Screen Reader** (if available):
  - Enable VoiceOver (Mac) or NVDA (Windows)
  - Navigate to HEIC to JPEG converter
  - Verify page title is announced
  - Verify file upload zone is announced with instructions
  - Trigger file upload and conversion
  - Verify conversion progress is announced
  - Verify success state is announced
  - Verify download buttons are announced with proper labels
  - Verify error messages (if triggered) are announced

### Performance Testing

- **Measure Conversion Performance**:
  - Prepare a typical HEIC file (3-5MB)
  - Open browser DevTools Network tab
  - Start timer (or note time)
  - Upload file and start conversion
  - Note time when conversion completes
  - Expected: <10 seconds total time for typical file
  - Compare to previous client-side conversion time (if known)
  - Server-side should be comparable or faster

- **Test Batch Conversion Performance**:
  - Upload 10 HEIC files (each 3-5MB)
  - Measure total time from upload start to all conversions complete
  - Expected: <60 seconds for 10 files
  - Verify server doesn't become unresponsive
  - Verify UI remains responsive during conversion

- **Test Memory Usage**:
  - Open browser DevTools Performance or Memory tab
  - Upload and convert multiple files
  - Check for memory leaks
  - Verify memory is released after conversion completes
  - Perform multiple conversions in sequence
  - Verify memory doesn't continuously increase

### Regression Testing

- **Verify Other Tools Still Work**:
  - Navigate to homepage (http://localhost:3050)
  - Verify all tool cards are visible
  - Click "Image to SVG" tool
  - Upload a PNG or JPG image
  - Verify conversion works
  - Download SVG
  - Verify SVG downloads correctly
  - Navigate back to homepage
  - Test "PDF Merger" tool (upload PDFs, merge, download)
  - Test "QR Code Generator" (generate code, download)
  - Verify dark mode toggle works across all tools
  - Verify navigation works between all pages
  - Verify no console errors in any tool

- **Verify Build Has No Regressions**:
  - Stop dev server
  - Run production build: `cd app && npm run build`
  - Verify build completes successfully
  - Verify build output shows no errors
  - Verify bundle sizes are reasonable (not significantly larger)
  - Start production server: `npm start`
  - Test HEIC converter in production mode
  - Verify it works identically to dev mode

### Dependency Validation

- **Verify heic2any is Removed**:
  - Check package.json: `grep heic2any app/package.json`
  - Should return no results
  - Check node_modules: `ls app/node_modules | grep heic2any`
  - Should return no results
  - Search codebase for references: `grep -r "heic2any" app/`
  - Should return no results (or only in comments explaining the change)

- **Verify heic-convert is Installed**:
  - Check package.json: `grep heic-convert app/package.json`
  - Should show heic-convert in dependencies
  - Verify in node_modules: `ls app/node_modules | grep heic-convert`
  - Should show heic-convert directory

### Security Validation

- **Test File Size Limits**:
  - Attempt to upload a file >50MB
  - Verify server rejects with error
  - Verify error message is clear
  - Attempt to upload 10 files totaling >500MB
  - Verify server rejects with error

- **Test File Type Validation**:
  - Attempt to upload .txt file renamed to .heic
  - Verify server detects invalid format and rejects
  - Attempt to upload .jpg renamed to .heic
  - Verify server detects invalid format and rejects

- **Test Filename Handling**:
  - Upload HEIC file with special characters in name (spaces, unicode, etc.)
  - Verify filename is handled safely
  - Verify no path traversal vulnerabilities
  - Verify downloaded file has safe filename

### Final Validation Checklist

- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] API endpoint accepts and converts HEIC files correctly
- [ ] Single file conversion and download works
- [ ] Multiple file conversion and ZIP download works
- [ ] Error handling works for invalid files, oversized files, and network errors
- [ ] Upload progress is shown to user
- [ ] Conversion completes in reasonable time (<10s for typical file)
- [ ] Converted JPEGs are valid and can be opened
- [ ] Works in Chrome, Firefox, Safari, and Edge
- [ ] Works on mobile devices or mobile emulation
- [ ] Dark mode renders correctly throughout flow
- [ ] Keyboard navigation works for all interactions
- [ ] Screen reader can navigate and understand states
- [ ] No regressions to other tools (Image to SVG, PDF Merger, etc.)
- [ ] heic2any dependency is removed
- [ ] heic-convert dependency is installed
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] Privacy notice is updated
- [ ] Performance is acceptable
- [ ] Memory usage is reasonable
- [ ] File size and type validation works
- [ ] UI is responsive on mobile

## Notes

### Library Selection Rationale

**heic-convert** was selected for server-side conversion based on:
- **Established Package**: Available on npm with reasonable download counts and community usage
- **Node.js Native**: Designed specifically for Node.js environments (unlike heic2any which is browser-only)
- **Format Support**: Supports HEIC/HEIF to JPEG/PNG conversion with quality control
- **API Simplicity**: Straightforward async API that accepts a buffer and returns a converted buffer

**Important Limitations to Note**:
- **Performance**: According to documentation, converting HEIC files can be CPU-intensive and may take >5 seconds per 12 megapixel photo on a normal Linux server
- **Asynchronous with Synchronous Work**: While the API returns a Promise, significant work is done synchronously, which may block the event loop
- **Format Compatibility**: May have issues with newer HEIC variants or camera-specific formats (HIF)

**Alternative Considered**:
- **sharp**: Popular, fast image processing library but does NOT support HEIC format as of 2024
- **ImageMagick (with heic support)**: Powerful but requires external binary installation and system dependencies (libheif, etc.)
- **Cloud APIs** (ConvertAPI, Cloudmersive): Commercial solutions that avoid server load but add cost and external dependencies

### Performance Considerations

**Expected Performance Characteristics**:
- **Small HEIC files** (<1MB): Conversion should complete in 1-3 seconds
- **Typical HEIC files** (3-5MB from iPhone): Conversion should complete in 3-8 seconds
- **Large HEIC files** (>10MB, high resolution): Conversion may take 10-20 seconds
- **Batch conversions**: Processing 10 files may take 30-60 seconds depending on server resources

**Performance Optimization Strategies**:
1. **Quality Settings**: JPEG quality set to 0.9 (90%) provides good quality-to-size ratio
2. **Memory Processing**: Process files in memory without disk I/O for speed
3. **Streaming** (future enhancement): Consider streaming responses for very large files
4. **Parallel Processing** (future enhancement): Use worker threads for true parallel conversion
5. **Caching** (future enhancement): Cache recently converted files (with privacy considerations)

**Performance Monitoring**:
- Log conversion times server-side for monitoring
- Alert if conversion times exceed acceptable thresholds
- Monitor server CPU and memory during conversion
- Consider implementing timeout limits (e.g., 30 seconds max per file)

### Privacy and Data Handling

**Current Approach** (Client-Side):
- Files processed entirely in browser
- Never uploaded to server
- Maximum privacy

**New Approach** (Server-Side):
- Files uploaded to server for processing
- Processed in memory (not written to disk)
- **Important**: Files must be immediately discarded after conversion
- No logging of file contents or converted images
- No storage of uploaded or converted files

**Privacy Best Practices**:
1. **In-Memory Processing**: Process files entirely in memory, never write to disk
2. **Immediate Cleanup**: Discard buffers immediately after conversion completes
3. **No Logging**: Never log file contents, image data, or sensitive metadata
4. **HTTPS**: Ensure production deployment uses HTTPS for encrypted upload/download
5. **No Analytics**: Don't track or analyze user files
6. **Privacy Notice**: Update UI to clearly state files are uploaded for processing and immediately deleted
7. **No Caching**: Don't cache uploaded or converted files (or if caching is added, make it very short-lived and opt-in)

**User Trust**:
- Be transparent about server-side processing in UI
- Provide clear privacy notice
- Consider adding option to revert to client-side processing for privacy-sensitive users (future enhancement)
- Consider open-sourcing to build trust (server doesn't store files)

### Scalability Considerations

**Current Architecture**:
- Single server processing conversions
- Synchronous processing (one request at a time per worker)
- In-memory processing (RAM limited)

**Scaling Strategies for Future**:

1. **Horizontal Scaling**:
   - Deploy multiple server instances behind load balancer
   - Each instance handles its own conversions independently
   - No shared state required (stateless API)

2. **Worker Threads**:
   - Use Node.js worker threads for parallel conversion
   - Prevents blocking main event loop
   - Allows concurrent processing of multiple files

3. **Job Queue**:
   - For very large files or batches, use job queue (Bull, BullMQ)
   - Accept upload, enqueue job, return job ID
   - Client polls for completion
   - Allows better resource management and queuing

4. **External Service**:
   - Offload conversion to external service (AWS Lambda, Google Cloud Functions)
   - Serverless scaling
   - Pay-per-use pricing
   - Better isolation

5. **Resource Limits**:
   - Implement memory limits per conversion
   - Implement timeout limits (30 seconds per file)
   - Implement rate limiting (X requests per minute per IP)
   - Queue requests if server is under heavy load

**Immediate Needs**:
- For MVP: Single server with in-memory processing is sufficient
- Monitor performance and resource usage
- Scale only if usage demands it

### Error Handling Strategy

**Error Categories**:

1. **Client Errors (4xx)**:
   - 400 Bad Request: No files uploaded, invalid request format
   - 413 Payload Too Large: File size exceeds limits
   - 422 Unprocessable Entity: Invalid HEIC file, conversion failed
   - 429 Too Many Requests: Rate limit exceeded (future)

2. **Server Errors (5xx)**:
   - 500 Internal Server Error: Unexpected error during processing
   - 503 Service Unavailable: Server overloaded (future)
   - 507 Insufficient Storage: Out of memory (rare)

**Error Response Format**:
```typescript
{
  success: false,
  error: {
    code: "CONVERSION_FAILED" | "FILE_TOO_LARGE" | "INVALID_FILE_TYPE" | ...,
    message: "Human-readable error message",
    details?: "Additional technical details (dev mode only)"
  }
}
```

**Client-Side Error Handling**:
- Parse error response from API
- Display user-friendly error message
- Provide actionable guidance ("Try a smaller file", "Check file format", etc.)
- Allow user to retry
- Log errors to console for debugging (dev mode)

**Server-Side Error Handling**:
- Catch all errors in try-catch blocks
- Log errors with context (file size, type, error stack)
- Don't expose sensitive information in error messages
- Clean up resources even on error (use finally blocks)

### Alternative Response Formats Considered

**Option A: JSON with Base64 (Chosen)**:
```typescript
{
  success: true,
  conversions: [
    {
      filename: "photo.jpg",
      data: "base64EncodedJpegData...",
      size: 2048576,
      originalName: "photo.heic"
    }
  ]
}
```
**Pros**: Simple to implement, easy to parse, works with standard fetch
**Cons**: Base64 encoding increases size by ~33%, not efficient for large files

**Option B: Multipart Response**:
Return multiple files in a multipart/mixed response
**Pros**: No base64 overhead, efficient for large files
**Cons**: More complex to parse client-side, requires multipart parsing library

**Option C: ZIP File Response**:
Server creates ZIP file and returns it directly
**Pros**: Efficient, client doesn't need to create ZIP
**Cons**: Always returns ZIP even for single file, less flexible

**Option D: Streaming Response**:
Stream converted data as it's generated
**Pros**: Lower latency, good for very large files
**Cons**: Complex implementation, harder to handle errors mid-stream

**Decision**: Option A (JSON with Base64) chosen for MVP due to simplicity. Can optimize later if performance becomes an issue.

### Testing Strategy

**Manual Testing Focus**:
- Since the application doesn't have automated tests, thorough manual testing is critical
- Test matrix: Chrome, Firefox, Safari, Edge × (Windows, macOS, Linux, iOS, Android)
- Focus on error cases and edge cases (most likely to have issues)
- Test with real HEIC files from iPhone, not just samples
- Test under various network conditions (fast, slow, offline)

**Future Automated Testing**:
Consider adding:
- Jest unit tests for API route handler
- Jest unit tests for API client functions
- Playwright or Cypress E2E tests for full user flows
- API integration tests with supertest

### Migration Path

**Rollout Strategy**:
1. **Development**: Implement and test server-side conversion thoroughly
2. **Staging**: Deploy to staging environment for further testing
3. **Production**: Deploy to production
4. **Monitor**: Watch error logs, performance metrics, user feedback
5. **Iterate**: Fix issues, optimize performance as needed

**Rollback Plan**:
- If server-side conversion has critical issues, can revert to client-side
- Keep git history to easily revert changes
- Tag release before deploying server-side version
- Have heic2any version available in a branch for quick rollback

**Gradual Rollout** (optional):
- Use feature flag to enable server-side conversion for % of users
- Gradually increase percentage as confidence grows
- Allows A/B testing performance and error rates
- Requires adding feature flag system (future enhancement)

### Environment-Specific Considerations

**Development**:
- Use http://localhost:3050
- Conversion runs on local machine (may be slower than production server)
- Full error details in logs for debugging

**Production**:
- Use HTTPS (required for security)
- Conversion runs on production server (optimized hardware)
- Limited error details in responses (no stack traces)
- Enable monitoring and alerting
- Consider CDN for static assets
- Consider rate limiting for API endpoints

### Cost Considerations

**Server Resources**:
- HEIC conversion is CPU-intensive
- Each conversion uses significant CPU for 3-10 seconds
- Memory usage: ~50-200MB per conversion (depending on file size)
- May need more powerful server instances if usage is high

**Scaling Costs**:
- More users = more server capacity needed
- Cloud hosting costs increase with CPU/memory usage
- Consider serverless (AWS Lambda) if usage is spiky

**Alternative**:
- Client-side conversion (current) has zero server cost
- Trade-off: Better UX vs server cost
- For low-traffic MVP, server cost should be minimal

### Future Enhancements

**Phase 2 Features** (not in scope for current implementation):

1. **Advanced Quality Control**:
   - Quality slider (60%, 70%, 80%, 90%, 100%)
   - File size preview before conversion
   - Multiple output formats (PNG, WebP)

2. **Batch Optimization**:
   - Progress indicator for overall batch
   - Pause/resume batch conversions
   - Cancel individual conversions

3. **Performance Optimization**:
   - Worker threads for parallel processing
   - Job queue for large batches
   - Conversion result caching (short-term, privacy-safe)

4. **Enhanced Error Handling**:
   - Automatic retry for failed conversions
   - Partial success handling (some files succeed, some fail)
   - Detailed error reports

5. **Monitoring and Analytics**:
   - Conversion time metrics
   - File size statistics
   - Error rate tracking
   - User usage patterns (privacy-safe)

6. **User Options**:
   - Toggle between client-side and server-side conversion
   - EXIF data preservation options
   - Custom JPEG quality settings
   - Batch resize during conversion

7. **Enterprise Features**:
   - API key authentication for programmatic access
   - Higher file size limits for authenticated users
   - Priority queue for premium users
   - Bulk conversion API

### Documentation Updates Needed

After implementation:
- Update main README if it exists
- Update tool card description on homepage (mention server-side processing)
- Update privacy notice in HEIC converter page
- Add JSDoc comments to all new functions
- Document API endpoint in code comments or API docs
- Update any architecture diagrams (if they exist)

### Success Metrics

**Measure Success By**:
- Conversion success rate (target: >95%)
- Average conversion time (target: <10s for typical file)
- Server resource usage (target: <80% CPU, <2GB RAM under normal load)
- User error rate (target: <5% of conversions result in user-visible errors)
- User feedback (qualitative)
- No increase in bug reports after deployment

### Risks and Mitigations

**Risk: Server Performance**
- Mitigation: Thorough load testing before production
- Mitigation: Resource monitoring and alerts
- Mitigation: Horizontal scaling if needed

**Risk: Privacy Concerns**
- Mitigation: Clear communication about server-side processing
- Mitigation: No logging or storage of user files
- Mitigation: HTTPS encryption for uploads/downloads

**Risk: heic-convert Library Issues**
- Mitigation: Test with wide variety of HEIC files before deployment
- Mitigation: Implement robust error handling for conversion failures
- Mitigation: Have rollback plan to client-side conversion

**Risk: Increased Server Costs**
- Mitigation: Monitor usage and costs
- Mitigation: Implement rate limiting if needed
- Mitigation: Consider serverless if costs become an issue

**Risk: Breaking Changes**
- Mitigation: Thorough testing before deployment
- Mitigation: Test all existing tools for regressions
- Mitigation: Keep git history for easy rollback

This comprehensive feature specification provides all the details needed to successfully implement server-side HEIC to JPEG conversion while maintaining the high quality and user experience of the existing Pyramid Tools application.
