# Bug: Image Size Exceeds Claude API 5MB Limit After Base64 Encoding

## Bug Description
Users are unable to upload images that are between ~3.75MB and 10MB in size. When a user uploads a 4502 KB (4.4 MB) file to the Handwriting to Text tool, they receive an error: `"image exceeds 5 MB maximum: 6145764 bytes > 5242880 bytes"`. The UI indicates the maximum file size is 10MB, but files larger than approximately 3.75MB fail during API processing.

Expected behavior: Files up to the advertised 10MB limit should be processed successfully through automatic compression.

Actual behavior: Files between ~3.75MB and 10MB pass client-side validation but fail when sent to Claude's API due to base64 encoding overhead.

## Problem Statement
The application advertises a 10MB file size limit, but files larger than ~3.75MB fail when sent to Claude's Messages API because:
1. Base64 encoding increases file size by approximately 33% (4/3 ratio)
2. Claude's API has a hard limit of 5MB (5,242,880 bytes) for base64-encoded images
3. No client-side compression is performed before uploading to the API
4. Raw files are directly converted to base64 without size optimization

## Solution Statement
Implement automatic client-side image compression before base64 encoding for files that would exceed Claude's 5MB limit. The solution will:
1. Keep the user-friendly 10MB raw file size limit
2. Add a compression function using Canvas API (following the pattern in `screenshot-annotator.ts`)
3. Automatically compress images larger than ~3.5MB to ensure base64-encoded size stays under 5MB
4. Use progressive quality reduction and/or dimension scaling to maintain OCR readability
5. Provide transparent compression with no user intervention required

## Steps to Reproduce
1. Navigate to the Handwriting to Text tool at `/tools/handwriting-to-text`
2. Prepare a test image file that is 4502 KB (4.4 MB) in size
3. Upload the file using the file upload zone
4. Click "Extract Text from 1 Image" button
5. Observe the error returned from the API: `"image exceeds 5 MB maximum: 6145764 bytes > 5242880 bytes"`

## Root Cause Analysis
The root cause is lack of client-side image compression before API submission:

1. **Client-side validation** (`app/types/handwriting-ocr.ts:39`): `MAX_FILE_SIZE = 10 * 1024 * 1024` (10MB) validates the raw file size but doesn't compress large files

2. **Base64 encoding** (`app/lib/handwriting-ocr.ts:29-38`): The `fileToBase64()` function converts files to base64 without any compression, increasing size by ~33%

3. **No compression step**: Unlike other tools in the codebase (e.g., screenshot-annotator), there's no image compression before encoding

4. **Claude API constraint**: The Anthropic Messages API has a hard limit of 5,242,880 bytes (5MB) for base64-encoded image data

The mathematical relationship:
- Raw file size: 4502 KB = 4,610,048 bytes
- Base64 encoded size: 4,610,048 × (4/3) = 6,146,731 bytes ≈ 6145764 bytes (as shown in error)
- Claude limit: 5,242,880 bytes (5MB)
- Target compressed size: ~3.5MB (ensures base64 stays under 5MB with safety margin)

## Relevant Files
Use these files to fix the bug:

- `app/lib/handwriting-ocr.ts` - Contains `fileToBase64()` function that needs to be enhanced with compression logic before base64 encoding

- `app/lib/screenshot-annotator.ts:356-374` - Reference implementation of Canvas.toBlob() with quality control that we can adapt for image compression

- `app/types/handwriting-ocr.ts` - May need to add new types for compression options and add informational messages about automatic compression

### New Files

- `app/lib/image-compression.ts` - New utility file for client-side image compression functions that can be reused across tools

## Step by Step Tasks

### Create image compression utility module
- Create new file `app/lib/image-compression.ts`
- Implement `compressImage(file: File, targetMaxSize: number): Promise<File>` function
- Use Canvas API with `toBlob()` method (similar to `screenshot-annotator.ts:362-372`)
- Implement progressive quality reduction strategy (start at 0.9, reduce by 0.1 until target size met or quality reaches 0.5)
- Implement dimension scaling as fallback if quality reduction isn't enough (reduce by 10% increments while maintaining aspect ratio)
- Ensure minimum quality of 0.5 (50%) to maintain OCR readability
- Add helper function `loadImageToCanvas(file: File): Promise<HTMLCanvasElement>` to load file into canvas
- Add helper function `estimateBase64Size(sizeInBytes: number): number` to calculate base64 size (multiply by 4/3)
- Return compressed File object with same name and appropriate MIME type

### Update handwriting-ocr.ts to use compression
- Import the new `compressImage` function from `image-compression.ts`
- Modify `uploadAndExtractText()` function in `app/lib/handwriting-ocr.ts:46-79`
- Before converting to base64, check if file size would exceed ~3.5MB after base64 encoding
- For files over 3.5MB, call `compressImage(file, 3.5 * 1024 * 1024)` to compress before base64 conversion
- Update `fileToBase64()` to accept the potentially compressed file
- Maintain backward compatibility for files already under the threshold

### Add compression feedback (optional enhancement)
- Add optional progress callback to show compression status
- Update `FileOCRState` type to include `compressionApplied?: boolean` flag
- Display subtle indicator when automatic compression was applied (e.g., "Compressed for processing" badge)

### Update error messages and documentation
- Add new informational message: `COMPRESSION_APPLIED: 'Large image automatically compressed for processing'`
- Update limitations documentation in `app/app/tools/handwriting-to-text/page.tsx:259` to mention automatic compression: "Maximum file size: 10MB per image (automatically compressed if needed for processing)"

### Test compression with various file sizes and formats
- Test with JPEG files: 2MB, 4MB, 6MB, 8MB, 10MB
- Test with PNG files: 2MB, 4MB, 6MB, 8MB, 10MB
- Test with WebP files at various sizes
- Verify compressed images maintain sufficient quality for OCR
- Verify base64-encoded compressed images stay under 5MB
- Test edge case: file at exactly 10MB limit
- Test edge case: file that can't be compressed enough (return appropriate error)

### Add error handling for compression failures
- Handle cases where compression cannot reduce file enough (corrupted images, already highly optimized)
- Provide clear error message: "Image could not be compressed enough for processing. Please reduce image size or quality manually."
- Ensure graceful fallback behavior

### Run validation commands
- Execute all validation commands to ensure the bug is fixed with zero regressions

## Validation Commands
Execute every command to validate the bug is fixed with zero regressions.

- `cd app && npm run build` - Build the Next.js application to ensure TypeScript compilation succeeds with no errors
- `cd app && npm run lint` - Run ESLint to ensure code quality standards are met
- Manual test: Upload a 4.5MB JPEG image and verify it processes successfully with automatic compression
- Manual test: Upload a 6MB PNG image and verify it processes successfully with automatic compression
- Manual test: Upload a 10MB image and verify it processes successfully with automatic compression
- Manual test: Upload a 2MB image and verify it processes without compression (no unnecessary processing)
- Manual test: Upload multiple images of varying sizes and verify batch processing works correctly
- Manual test: Verify OCR accuracy is maintained after compression on sample handwritten documents
- Manual test: Check browser console for any compression-related errors or warnings

## Notes

### Why Client-Side Compression is the Best Solution
1. **Better UX**: Users can still upload 10MB files as advertised
2. **Automatic**: No manual intervention or confusing error messages
3. **Cost-effective**: Reduces bandwidth and API payload sizes
4. **Already proven**: The codebase uses Canvas.toBlob() with quality control in screenshot-annotator tool
5. **OCR-friendly**: Progressive compression maintains text readability

### Compression Strategy Details
- **Target size**: 3.5MB compressed (leaves safety margin when base64-encoded to ~4.66MB)
- **Quality range**: 0.9 to 0.5 (90% to 50%) - maintains good OCR accuracy
- **Dimension scaling**: If quality reduction insufficient, scale down dimensions by 10% increments
- **Format handling**: Convert PNG to JPEG for better compression if needed (with user transparency)

### Technical Details
- Base64 encoding has 4:3 ratio (every 3 bytes → 4 bytes = 33% overhead)
- Claude's 5MB limit applies to base64-encoded image in API request
- Canvas API `toBlob()` supports quality parameter for image/jpeg and image/webp (0.0-1.0)
- PNG format doesn't support quality parameter but can be converted to JPEG for compression

### Alternative Solutions Considered
1. **Reduce MAX_FILE_SIZE to 3.75MB** - Too restrictive, poor UX
2. **Server-side compression** - Extra round-trip, more complex, slower
3. **Image dimension reduction only** - May lose text clarity for OCR
4. **Quality reduction only** - May not be enough for very large files
5. **Hybrid approach (chosen)** - Quality reduction + dimension scaling provides best results

### Future Enhancements
- Add user control for compression quality (advanced settings)
- Show before/after file sizes in UI
- Implement client-side image preview after compression
- Cache compressed versions to avoid re-compression on retry
