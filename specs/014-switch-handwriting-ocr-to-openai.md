# Feature: Switch Handwriting OCR from Claude Haiku to OpenAI

## Feature Plan Created: specs/014-switch-handwriting-ocr-to-openai.md

## Feature Description

Migrate the Handwriting to Text OCR tool from using Anthropic's Claude Haiku 4.5 model to OpenAI's GPT-4o model. The current implementation has a limitation where Claude Haiku supports only up to 5MB per image upload, which restricts users from processing higher-resolution scans and detailed documents. OpenAI's vision API supports up to 50MB per file, allowing users to upload much larger and higher-quality images for better OCR accuracy.

This migration will involve replacing the Anthropic SDK with the OpenAI SDK, updating the API route to use OpenAI's Chat Completions API with vision capabilities, adjusting the prompt for optimal handwriting extraction, and updating configuration to use OpenAI API keys instead of Anthropic keys.

## User Story

As a user with high-resolution handwritten documents
I want to upload larger image files (up to 50MB)
So that I can extract text from detailed scans without having to compress or reduce image quality

## Problem Statement

The current Handwriting to Text tool uses Claude Haiku 4.5, which has a 5MB upload limit per image. This limitation creates several problems:

- **High-resolution scans rejected**: Professional scanners often produce 10-20MB images with superior clarity
- **Image quality degradation**: Users must compress images before upload, reducing OCR accuracy
- **Multi-page documents limited**: Combined images or multi-page scans often exceed 5MB
- **User frustration**: Error messages about file size create a poor user experience
- **Competitive disadvantage**: Other OCR services support larger files

While Claude Haiku 4.5 is fast and cost-effective, the 5MB restriction is a significant barrier for users needing high-quality OCR results.

## Solution Statement

Switch to OpenAI's GPT-4o model which provides:

- **50MB file size limit**: 10x larger than Claude Haiku, supporting high-resolution scans
- **Excellent vision capabilities**: GPT-4o has state-of-the-art image understanding
- **Better handwriting recognition**: Strong performance on cursive and challenging handwriting
- **Cost-effective**: Competitive pricing at $2.50/1M input tokens, $10/1M output tokens
- **Faster processing**: GPT-4o is optimized for speed with vision tasks
- **Multiple format support**: JPEG, PNG, WebP, GIF (non-animated)
- **Maintained compatibility**: Same user interface and workflow

The migration will be transparent to users—they'll simply be able to upload larger files with the same familiar interface.

## Relevant Files

Use these files to implement the feature:

- **app/app/api/extract-handwriting/route.ts** (lines 1-185) - Current API route using Anthropic SDK. This file needs to be completely rewritten to use OpenAI's Chat Completions API with vision capabilities instead of Anthropic's Messages API.

- **app/types/handwriting-ocr.ts** (lines 1-59) - Type definitions and constants. The MAX_FILE_SIZE constant needs to be updated from 10MB to 50MB to take advantage of OpenAI's higher limits. SUPPORTED_IMAGE_FORMATS may need updates based on OpenAI's supported formats.

- **app/package.json** (lines 1-46) - Dependencies. Need to add the `openai` npm package and can optionally remove `@anthropic-ai/sdk` if it's not used elsewhere in the application.

- **.env.example** - Environment variables documentation. Need to add OPENAI_API_KEY and update documentation to reflect the switch from Anthropic to OpenAI.

- **specs/013-handwriting-to-text.md** - Original feature specification. Reference this for understanding the original implementation, prompt engineering strategy, and user requirements that must be maintained.

### Files That Do NOT Need Changes

- **app/app/tools/handwriting-to-text/page.tsx** - Client-side UI remains unchanged
- **app/lib/handwriting-ocr.ts** - Client-side utilities remain unchanged
- **app/components/\*** - UI components remain unchanged
- **app/lib/tools.ts** - Tool registry remains unchanged

## Implementation Plan

### Phase 1: Setup and Dependencies

1. Install OpenAI SDK npm package
2. Update environment variables configuration
3. Update type definitions for new file size limits
4. Review OpenAI API documentation for vision capabilities

### Phase 2: Core API Migration

1. Rewrite API route to use OpenAI Chat Completions API
2. Adapt image format and base64 encoding for OpenAI
3. Optimize prompt for GPT-4o's vision capabilities
4. Update error handling for OpenAI-specific errors
5. Test API integration end-to-end

### Phase 3: Testing and Validation

1. Test with various file sizes (1MB to 50MB)
2. Validate OCR accuracy across different handwriting styles
3. Compare costs and performance with previous Claude implementation
4. Update documentation to reflect the change
5. Run validation commands to ensure no regressions

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Install OpenAI SDK

- Navigate to the app directory
- Run `npm install openai --save` to install the official OpenAI SDK
- Verify installation in package.json
- This provides TypeScript types and API client for OpenAI integration

### 2. Update Environment Variables Configuration

- Read `.env.example` file if it exists
- Add or update the following documentation:
  ```
  # OpenAI API Key for GPT-4o vision features
  # Get your API key from: https://platform.openai.com/api-keys
  # Required for: Handwriting to Text OCR tool
  OPENAI_API_KEY=your_api_key_here
  ```
- Note: If ANTHROPIC_API_KEY is not used by other features, it can be removed
- Create or update `.env.local` file (not committed to git) with actual API key
- Document that OPENAI_API_KEY is required for the handwriting OCR feature

### 3. Update File Size Limits in Type Definitions

- Read `app/types/handwriting-ocr.ts`
- Update MAX_FILE_SIZE constant:
  ```typescript
  export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (OpenAI limit)
  ```
- Update ERROR_MESSAGES.FILE_TOO_LARGE:
  ```typescript
  FILE_TOO_LARGE: 'File size exceeds 50MB limit',
  ```
- Verify SUPPORTED_IMAGE_FORMATS includes formats supported by OpenAI:
  - OpenAI supports: PNG, JPEG, WEBP, non-animated GIF
  - Current formats: JPEG, JPG, PNG, WebP, HEIC
  - HEIC may need special handling or conversion (already have HEIC converter)
  - For now, keep existing formats but note GIF support could be added
- Save the updated file

### 4. Update API Route to Use OpenAI

- Read `app/app/api/extract-handwriting/route.ts` completely
- Replace the import statement:

  ```typescript
  // OLD:
  import Anthropic from "@anthropic-ai/sdk";

  // NEW:
  import OpenAI from "openai";
  ```

- Update the extractTextFromImage function signature and implementation:

  ```typescript
  /**
   * Extracts handwritten text from an image using OpenAI's GPT-4o vision API
   * @param client - OpenAI client instance
   * @param imageData - Base64 encoded image data
   * @param mimeType - MIME type of the image
   * @returns Extracted text from the image
   */
  async function extractTextFromImage(
    client: OpenAI,
    imageData: string,
    mimeType: string
  ): Promise<string> {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageData}`,
                detail: "high", // Use high detail for best OCR accuracy
              },
            },
            {
              type: "text",
              text: 'Please extract all handwritten text from this image. Transcribe exactly what is written, preserving the original formatting, line breaks, and structure as much as possible. If there are multiple sections or paragraphs, maintain their separation. If the handwriting is unclear in any part, include your best interpretation and note the uncertainty with [?] if needed. If no handwritten text is found, respond with "No handwritten text detected."',
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    const textContent = completion.choices[0]?.message?.content;
    if (!textContent) {
      throw new Error("No text in OpenAI response");
    }

    return textContent;
  }
  ```

- Update the POST handler to initialize OpenAI client:

  ```typescript
  // Change validation from ANTHROPIC_API_KEY to OPENAI_API_KEY
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { message: ERROR_MESSAGES.API_KEY_MISSING },
      { status: 500 }
    );
  }

  // Initialize OpenAI client instead of Anthropic
  const client = new OpenAI({ apiKey });
  ```

- Update error handling for OpenAI-specific errors:

  ```typescript
  // OpenAI errors are different from Anthropic
  // Check for rate limit errors (OpenAI uses status codes)
  if (error instanceof Error) {
    if (
      error.message.includes("429") ||
      error.message.includes("rate_limit_exceeded")
    ) {
      return NextResponse.json(
        { message: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    if (
      error.message.includes("401") ||
      error.message.includes("invalid_api_key")
    ) {
      return NextResponse.json(
        { message: "API authentication failed. Please check configuration." },
        { status: 500 }
      );
    }
  }
  ```

- Save the updated API route file

### 5. Update Client-Side Validation (Optional)

- Read `app/lib/handwriting-ocr.ts`
- The MAX_FILE_SIZE import will automatically use the new 50MB limit
- Verify that error messages reference the updated limits
- No code changes needed if types are properly imported
- Confirm the file compiles without errors

### 6. Update Documentation in Spec File

- Read `specs/013-handwriting-to-text.md`
- This file documents the original Claude implementation
- Consider adding a note at the top:
  ```markdown
  > **Note**: This feature was originally implemented with Claude Haiku 4.5 but has been migrated to OpenAI GPT-4o to support larger file uploads (50MB vs 5MB). See specs/014-switch-handwriting-ocr-to-openai.md for migration details.
  ```
- This preserves historical context while noting the change

### 7. Test API Integration with Sample Images

- Set OPENAI_API_KEY in .env.local
- Run `cd app && npm run dev`
- Navigate to http://localhost:3050/tools/handwriting-to-text
- Test with small image (< 5MB):
  - Upload a handwritten note
  - Click "Extract Text"
  - Verify extraction works correctly
  - Compare accuracy with previous Claude results if possible
- Test with medium image (5-20MB):
  - Upload a high-resolution scan
  - Verify it's accepted (would have been rejected before)
  - Verify extraction completes successfully
- Test with large image (20-50MB):
  - Upload a very large image if available
  - Verify processing completes
  - Note processing time
- Test error scenarios:
  - Remove OPENAI_API_KEY temporarily
  - Verify friendly error message
  - Restore API key
- Verify no console errors during any test

### 8. Test Multiple Image Upload

- Upload 2-3 images simultaneously
- Mix of different sizes (e.g., 2MB, 15MB, 30MB)
- Verify all process correctly
- Verify individual error handling (if one fails, others succeed)
- Check that progress indicators work properly
- Test copy and download functionality on results

### 9. Compare OCR Accuracy

- Test with various handwriting styles:
  - Clear print handwriting
  - Cursive handwriting
  - Mixed styles
  - Challenging/messy handwriting
- Compare results qualitatively with Claude Haiku if possible:
  - Are results as good or better?
  - Are formatting and line breaks preserved?
  - Are uncertain parts marked with [?] appropriately?
- Note any issues in console for potential prompt refinement

### 10. Performance and Cost Analysis

- Measure typical processing time:
  - Small images (1-5MB)
  - Medium images (5-20MB)
  - Large images (20-50MB)
- Estimate token usage:
  - GPT-4o vision: varies by image size and detail level
  - With detail='high', images are processed at higher token cost
  - Review OpenAI pricing page for current rates
- Compare with previous Claude Haiku costs:
  - Claude Haiku 4.5: $1/MTok input, $5/MTok output
  - GPT-4o: $2.50/MTok input, $10/MTok output
  - Note: Higher cost but 10x larger file support
- Document findings in this spec's Notes section

### 11. Update UI Documentation (if needed)

- Read `app/app/tools/handwriting-to-text/page.tsx`
- Check if there are any references to file size limits in the UI
- Search for "10MB" or "10 MB" in the file
- If found, update to "50MB" or "50 MB"
- Check informational content section at bottom of page
- Update any limit references to reflect new 50MB maximum
- Save changes if any were made

### 12. Run Linting

- Run `cd app && npm run lint`
- Fix any linting errors in modified files
- Ensure imports are correctly ordered
- Verify no unused imports (especially Anthropic if removed)
- Confirm TypeScript types are correct

### 13. Run Build

- Run `cd app && npm run build`
- Verify successful build with no TypeScript errors
- Check for any warnings related to modified files
- Confirm API routes compile correctly
- Verify no issues with OpenAI SDK integration

### 14. Comprehensive End-to-End Test

- Run `cd app && npm run dev`
- Navigate to http://localhost:3050
- Verify "Handwriting to Text" tool card visible on homepage
- Click tool card
- Upload workflow test:
  - Select multiple images of varying sizes
  - Include at least one image > 10MB to verify new limit works
  - Click "Extract Text"
  - Verify processing completes for all images
  - Verify extracted text is accurate
- Copy functionality test:
  - Click copy button on a result
  - Paste into text editor
  - Verify text matches exactly
- Download functionality test:
  - Click download button
  - Verify .txt file downloads with correct content
- Error handling test:
  - Try uploading file > 50MB (should still error)
  - Verify error message shows "50MB limit"
- Dark mode test:
  - Toggle dark mode
  - Verify all UI elements visible
- Responsive test:
  - Resize browser to 375px width
  - Verify mobile layout works
- Navigate back to homepage
- Test 2-3 other tools to ensure no regressions

### 15. Optional: Remove Anthropic SDK (if unused elsewhere)

- Search codebase for other uses of @anthropic-ai/sdk:
  - Run `grep -r "anthropic" app/` (or use Grep tool)
  - Check if any other files import or use Anthropic SDK
- If ONLY used in handwriting OCR (now migrated):
  - Run `cd app && npm uninstall @anthropic-ai/sdk`
  - Remove ANTHROPIC_API_KEY from .env.example if present
  - Clean up any Anthropic references in documentation
- If used elsewhere:
  - Keep the package installed
  - Maintain ANTHROPIC_API_KEY for those features
  - Document which features use which API

### 16. Update Validation Commands Documentation

- Update this spec file with final validation results
- Document any issues encountered and resolutions
- Note performance differences from Claude Haiku
- Record cost implications
- Add recommendations for future optimization

## Testing Strategy

### Unit Tests

Since this application doesn't currently have a testing framework, unit tests are not included. However, if testing is added in the future, consider testing:

- **API Client Initialization**: Verify OpenAI client initializes with correct API key
- **Image Format Conversion**: Test base64 encoding for OpenAI format
- **Error Handling**: Test handling of OpenAI-specific errors (401, 429, etc.)
- **File Size Validation**: Test that 50MB limit is enforced correctly
- **Response Parsing**: Test extraction of text from OpenAI completion response

### Integration Tests

Manual integration tests to perform:

- **API Route to OpenAI**: Verify API route correctly calls OpenAI Chat Completions API
- **Image Upload Flow**: Test end-to-end from file selection to text extraction
- **Large File Handling**: Verify files from 10MB to 50MB process successfully
- **Multi-File Processing**: Test uploading and processing 5 images simultaneously
- **Error Propagation**: Test that API errors show user-friendly messages
- **Cost Tracking**: Monitor actual token usage and costs during testing

### Edge Cases

- **Maximum File Size**: Upload exactly 50MB image → should process successfully
- **Over Limit**: Upload 51MB image → should reject with clear error
- **Very Small Image**: Upload tiny low-res image → should still attempt extraction
- **Empty/Blank Image**: Image with no text → should return "No text detected"
- **Printed Text**: Image with printed (not handwritten) text → may still extract
- **Poor Quality**: Blurry, angled, or shadowed images → test graceful degradation
- **High Resolution**: 40-50MB professional scans → verify superior quality extraction
- **Mixed Content**: Handwriting + diagrams → extract only text portions
- **Special Characters**: Symbols, emojis, non-English text → test extraction
- **API Rate Limits**: Exceed OpenAI rate limit → verify retry message
- **Invalid API Key**: Wrong or missing API key → verify clear error message
- **Network Issues**: Timeout during API call → verify error handling
- **Multiple Concurrent Requests**: Upload multiple batches quickly → no race conditions

## Acceptance Criteria

1. **OpenAI Integration**:

   - OpenAI SDK installed and configured correctly
   - API route uses OpenAI Chat Completions API with vision
   - OPENAI_API_KEY environment variable required and validated
   - GPT-4o model specified in API calls

2. **File Size Limits**:

   - MAX_FILE_SIZE updated to 50MB (50 _ 1024 _ 1024 bytes)
   - Client-side validation enforces 50MB limit
   - Server-side validation re-validates 50MB limit
   - Error messages reference "50MB limit" correctly
   - Files from 10MB to 50MB upload and process successfully

3. **Image Format Support**:

   - Maintains support for JPEG, PNG, WebP
   - Documents HEIC handling (may need conversion)
   - Optionally adds GIF support (non-animated)

4. **OCR Accuracy**:

   - Extraction quality equal to or better than Claude Haiku
   - Formatting and line breaks preserved
   - Uncertain text marked with [?] when appropriate
   - Handles various handwriting styles (print, cursive, mixed)

5. **Performance**:

   - Processing completes in reasonable time (< 30 seconds for most images)
   - Large files (20-50MB) process without timeout
   - Progress indicators show during processing
   - UI remains responsive

6. **Error Handling**:

   - Missing API key shows setup instructions
   - Invalid API key shows authentication error
   - Rate limit errors suggest waiting and retry
   - Network errors suggest checking connection
   - File size errors show clear limit message
   - Partial failures handled (some succeed, some fail)

7. **User Interface**:

   - No visible changes to user interface
   - Upload zone accepts larger files
   - All existing features (copy, download) work identically
   - Dark mode compatibility maintained
   - Responsive design maintained

8. **Code Quality**:

   - No ESLint errors
   - No TypeScript compilation errors
   - Proper types for OpenAI SDK usage
   - Error handling comprehensive
   - No unused imports or variables
   - Code comments explain OpenAI-specific logic

9. **Documentation**:

   - Environment variables documented in .env.example
   - Spec file updated with migration details
   - Code comments explain prompt engineering for GPT-4o
   - Notes section includes performance and cost analysis

10. **Testing**:

    - Tested with files from 1MB to 50MB
    - Tested with various handwriting styles
    - Tested all error scenarios
    - Tested on multiple browsers
    - Tested responsive layouts
    - No regressions to existing tools

11. **Build and Deploy**:
    - `npm run lint` passes with zero errors
    - `npm run build` completes successfully
    - Development server runs without errors
    - Production build ready for deployment

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `cd app && npm run lint` - Run linting to validate code quality. Must pass with zero errors related to modified files.

- `cd app && npm run build` - Build the Next.js app to validate there are no TypeScript errors or build failures. Must complete successfully.

- `cd app && npm run dev` - Start development server and perform comprehensive manual testing:
  - Navigate to http://localhost:3050
  - Verify "Handwriting to Text" tool appears on homepage
  - Click tool card and navigate to /tools/handwriting-to-text
  - **Test large file upload (new capability)**:
    - Upload an image between 10-20MB (would have failed before)
    - Verify file is accepted (no "file too large" error)
    - Click "Extract Text"
    - Verify processing completes successfully
    - Verify extracted text is accurate
  - **Test maximum size**:
    - Upload an image close to 50MB if available
    - Verify it's accepted and processes
  - **Test over limit**:
    - Try uploading file > 50MB
    - Verify error message says "File size exceeds 50MB limit"
  - **Test standard workflow**:
    - Upload 2-3 smaller images (< 10MB)
    - Process all together
    - Verify all extract correctly
    - Test copy to clipboard
    - Test download as .txt file
  - **Test error handling**:
    - Remove or invalidate OPENAI_API_KEY in .env.local
    - Restart dev server
    - Try to extract text
    - Verify friendly error about API key configuration
    - Restore API key and restart
  - **Test UI consistency**:
    - Toggle dark mode
    - Verify all elements visible and styled
    - Resize to mobile viewport (375px)
    - Verify responsive layout works
    - Test on different browsers if possible
  - **Test no regressions**:
    - Navigate back to homepage
    - Test 2-3 other tools (PDF merger, image resizer, etc.)
    - Verify they still work correctly
    - No console errors in any tool

## Notes

### Why OpenAI GPT-4o Over Claude Haiku 4.5

**File Size Limit**: The primary reason for migration

- Claude Haiku: 5MB per image maximum
- OpenAI GPT-4o: 50MB per file maximum
- This 10x increase allows high-resolution scans and professional documents

**Vision Capabilities**:

- GPT-4o has excellent vision understanding, competitive with Claude
- Strong performance on handwriting recognition, including cursive
- Supports "high detail" mode for maximum OCR accuracy
- Handles complex layouts and formatting well

**Cost Comparison**:

- Claude Haiku 4.5: $1/MTok input, $5/MTok output
- GPT-4o: $2.50/MTok input, $10/MTok output
- GPT-4o is 2-2.5x more expensive per token
- However, better quality results may offset higher cost
- Image token calculation differs between providers

**Performance**:

- Both models are fast for vision tasks
- GPT-4o optimized for low-latency responses
- Processing time may increase with larger images
- Should still complete within reasonable timeframe (< 30 seconds)

### OpenAI Image Token Calculation

OpenAI charges for images based on dimensions and detail level:

**Low Detail Mode** (`detail: "low"`):

- Fixed cost of 85 tokens regardless of size
- Processes 512x512px low-res version
- Faster and cheaper but less accurate

**High Detail Mode** (`detail: "high"`):

- Image scaled to fit in 2048x2048px square
- Shortest side scaled to 768px
- Divided into 512px tiles
- Each tile costs 170 tokens
- Base cost of 85 tokens added
- Example: 1024x1024 image = 765 tokens (4 tiles × 170 + 85)

**For OCR, use high detail mode** to ensure text is readable.

### Prompt Engineering for GPT-4o

The prompt is largely the same as for Claude, but some considerations:

**Similarities**:

- Both understand natural language instructions well
- Both can preserve formatting and structure
- Both can indicate uncertainty

**Optimizations for GPT-4o**:

- GPT-4o is very literal, so explicit instructions help
- Asking for [?] markers for uncertainty works well
- Requesting preservation of formatting is effective
- May want to test if asking for JSON output improves parsing

**Current Prompt** (maintained from Claude version):

```
Please extract all handwritten text from this image. Transcribe exactly what is written, preserving the original formatting, line breaks, and structure as much as possible. If there are multiple sections or paragraphs, maintain their separation. If the handwriting is unclear in any part, include your best interpretation and note the uncertainty with [?] if needed. If no handwritten text is found, respond with "No handwritten text detected."
```

This prompt has proven effective and should work well with GPT-4o.

### Supported Image Formats

**OpenAI officially supports**:

- PNG (.png)
- JPEG (.jpeg, .jpg)
- WEBP (.webp)
- Non-animated GIF (.gif)

**Current implementation supports**:

- JPEG/JPG ✓
- PNG ✓
- WebP ✓
- HEIC (requires conversion)

**Recommendations**:

- Keep current formats for now
- HEIC may need conversion to JPEG before sending to OpenAI
- Could add GIF support easily
- Could use existing HEIC converter tool to convert before OCR

### API Rate Limits

OpenAI has rate limits that vary by tier:

**Free Tier**:

- Very limited (3 RPM for GPT-4o)
- Not suitable for production

**Tier 1** (after $5 payment):

- 500 RPM
- Sufficient for moderate usage

**Higher Tiers**:

- Automatically increase with usage
- Monitor in OpenAI dashboard

**Handling Rate Limits**:

- OpenAI returns 429 status code
- Error message includes retry-after header
- Show user-friendly message suggesting wait time
- Consider implementing client-side queue for bulk uploads

### Migration Checklist

- [x] Research OpenAI vision API capabilities
- [x] Identify suitable OpenAI model (GPT-4o)
- [x] Create migration specification
- [ ] Install OpenAI SDK
- [ ] Update environment variables
- [ ] Update file size limits
- [ ] Rewrite API route for OpenAI
- [ ] Test with various image sizes
- [ ] Verify OCR accuracy
- [ ] Run validation commands
- [ ] Update documentation
- [ ] Optional: Remove Anthropic SDK if unused

### Future Enhancements

After successful migration, consider:

- **Model Selection**: Allow users to choose between GPT-4o (higher quality) and GPT-4o-mini (lower cost)
- **Detail Level Toggle**: Let users select low/high detail mode
- **Batch API**: Use OpenAI Batch API for async processing of many images
- **Vision Fine-tuning**: Fine-tune GPT-4o on specific handwriting styles if needed
- **Cost Dashboard**: Show estimated costs before processing
- **Quality Comparison**: A/B test GPT-4o vs other vision models

### Cost Estimation Example

For a typical 20MB high-resolution scan:

**Image tokens** (estimate):

- High detail mode with 20MB image
- Approximate dimensions: 3000x4000px
- After scaling and tiling: ~2500 tokens

**Input tokens**: ~2500 (image) + ~50 (prompt) = ~2550 tokens
**Output tokens**: ~500 (typical handwriting page)

**Cost**:

- Input: 2550 tokens × $2.50/1M = $0.0064
- Output: 500 tokens × $10/1M = $0.0050
- Total: ~$0.011 per image

Processing 100 high-res images: ~$1.10

This is more expensive than Claude Haiku (~$0.004 per image) but enables processing of larger files that were previously impossible.

### Rollback Plan

If issues arise with OpenAI integration:

1. **Keep git history**: Commit before migration for easy revert
2. **Test thoroughly**: Validate before deploying to production
3. **Monitor costs**: Track actual costs vs. estimates
4. **User feedback**: Monitor for accuracy complaints
5. **Fallback option**: Could support both APIs and let users choose

If rollback needed:

- Revert API route to Anthropic version
- Switch environment variable back to ANTHROPIC_API_KEY
- Reinstall @anthropic-ai/sdk if removed
- Revert file size limits back to 10MB

### Security Considerations

**API Key Management**:

- OPENAI_API_KEY must be server-side only
- Never expose in client-side code
- Use environment variables in production
- Rotate keys if compromised

**Image Data**:

- Images sent to OpenAI for processing
- OpenAI's data usage policy applies
- Images not stored by OpenAI (per policy)
- Users should be aware data leaves server

**Rate Limiting**:

- Implement server-side rate limiting to prevent abuse
- Track usage per IP or session
- Set maximum daily/hourly limits
- Alert on suspicious usage patterns

### Deployment Checklist

Before deploying to production:

1. Set OPENAI_API_KEY in production environment
2. Test with production API key in staging
3. Monitor initial usage and costs closely
4. Set up alerts for high usage or errors
5. Document the change in release notes
6. Prepare support response for user questions
7. Monitor error rates and user feedback
8. Have rollback plan ready if issues arise

### Documentation Updates Needed

- Update README with OpenAI requirement
- Update .env.example with OPENAI_API_KEY
- Add migration notes to original spec
- Update user-facing docs about file size limits
- Create internal docs about cost implications
