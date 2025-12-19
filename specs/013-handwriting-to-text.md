# Feature: Handwriting to Text OCR

> **Note**: This feature was originally implemented with Claude Haiku 4.5 but has been migrated to OpenAI GPT-4o to support larger file uploads (50MB vs 5MB). See specs/014-switch-handwriting-ocr-to-openai.md for migration details.

## Feature Plan Created: specs/013-handwriting-to-text.md

## Feature Description

Create a Handwriting to Text OCR tool that allows users to upload handwritten documents (images) and convert them to editable text using Claude's vision capabilities. The tool will leverage the Anthropic API with Claude Haiku 4.5 model to analyze handwritten content and extract text. This server-side tool will provide accurate text extraction from handwritten notes, letters, forms, and other documents, making handwritten content searchable and editable.

## User Story

As a user with handwritten documents
I want to upload an image of my handwriting and get the text extracted
So that I can digitize my handwritten notes and make them searchable and editable

## Problem Statement

Many users have handwritten documents—notes, letters, forms, journal entries—that they want to digitize. While typed text can be easily copied and searched, handwritten content remains locked in image format. Users need a simple way to:
- Upload images of handwritten documents
- Extract text from handwriting accurately
- Copy or download the extracted text
- Process multiple documents efficiently
- Maintain privacy and security of their handwritten content

Traditional OCR tools often struggle with handwriting, especially cursive or unique writing styles. Modern AI vision models like Claude can understand handwritten text much more accurately.

## Solution Statement

Implement a server-side Handwriting to Text OCR tool that provides:
- Image upload interface supporting common image formats (JPEG, PNG, WebP, HEIC)
- Server-side processing using Anthropic Claude API (Haiku 4.5 model for cost-efficiency and speed)
- Vision-based handwriting recognition using Claude's multimodal capabilities
- Text extraction with high accuracy for various handwriting styles
- Clean, formatted text output
- Copy to clipboard functionality
- Download as text file option
- Support for multiple images in a batch
- Progress indicators during processing
- Error handling for API failures or unsupported content
- Responsive design with dark mode support
- Privacy-focused: images processed only, not stored permanently

## Relevant Files

Use these files to implement the feature:

- **app/lib/tools.ts** (lines 1-75) - Tool registry where the Handwriting to Text tool needs to be added. This will make the tool appear on the homepage.

- **app/app/page.tsx** - Homepage that displays all tools. No changes needed as it automatically renders tools from the registry.

- **app/components/ui/button.tsx** - Reusable button component for upload, copy, and download buttons.

- **app/components/theme-toggle.tsx** - Theme toggle component to be included in the tool page header.

- **app/components/file-upload-zone.tsx** - Existing file upload component that handles drag-and-drop and file selection. Will be reused for image uploads.

- **app/lib/utils.ts** - Utility functions including cn() for className merging. Will be used throughout the component.

- **app/lib/zip-utils.ts** - Contains downloadBlob() utility for downloading extracted text files.

- **app/types/image-resizer.ts** - Reference for file validation patterns (MAX_FILE_SIZE, SUPPORTED_FORMATS constants).

- **app/app/api/resize-image/route.ts** - Reference for Next.js API route patterns, file upload handling, and error response formats.

- **app/package.json** - Package dependencies. Will need to add @anthropic-ai/sdk for Claude API integration.

- **.env.example** - Environment variables template. Will need to add ANTHROPIC_API_KEY documentation.

### New Files

- **app/app/tools/handwriting-to-text/page.tsx** - Main tool page component with:
  - File upload interface using FileUploadZone component
  - Multiple file support with individual processing states
  - Extracted text display area for each file
  - Copy to clipboard and download buttons
  - Progress indicators during API processing
  - Error handling and user feedback
  - Consistent header with back link and theme toggle
  - Responsive layout for all screen sizes

- **app/types/handwriting-ocr.ts** - TypeScript type definitions:
  - ProcessingStatus enum (pending, uploading, processing, completed, error)
  - FileOCRState interface (file, status, progress, extractedText, error)
  - OCRResponse interface for API responses
  - Constants: MAX_FILE_SIZE, MAX_FILES, SUPPORTED_IMAGE_FORMATS
  - Error message constants

- **app/lib/handwriting-ocr.ts** - Client-side utility functions:
  - validateImageFile(file: File): validation for file type and size
  - uploadAndExtractText(files: File[]): uploads images to API route
  - fileToBase64(file: File): converts image to base64 for API transmission
  - downloadTextFile(text: string, filename: string): creates downloadable text file
  - Error handling utilities

- **app/app/api/extract-handwriting/route.ts** - Server-side API route:
  - POST endpoint to receive uploaded images
  - File validation (type, size, count)
  - Image to base64 conversion for Claude API
  - Anthropic SDK integration with Claude Haiku 4.5 model
  - Vision message construction with handwriting extraction prompt
  - Response parsing and text extraction
  - Error handling for API failures, rate limits, invalid responses
  - Returns extracted text or error messages

## Implementation Plan

### Phase 1: Foundation

1. Install and configure Anthropic SDK dependency
2. Set up environment variables for API key
3. Create TypeScript type definitions for OCR state and responses
4. Add tool to the tools registry
5. Define constants for file limits and supported formats

### Phase 2: Core Implementation

1. Create the API route for handwriting extraction
2. Integrate Anthropic Claude SDK with Haiku 4.5 model
3. Implement vision-based text extraction with proper prompts
4. Build client-side utilities for file handling and API communication
5. Create the main page component with upload interface
6. Implement file state management and progress tracking
7. Add text display, copy, and download functionality

### Phase 3: Integration

1. Connect file upload to API route
2. Implement real-time progress updates during processing
3. Add comprehensive error handling and user feedback
4. Test with various handwriting styles and image qualities
5. Verify responsive layout and dark mode
6. Add informational content about the tool
7. Performance optimization and final polish

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Install Anthropic SDK

- Navigate to the app directory
- Run `npm install @anthropic-ai/sdk --save` to install the Anthropic SDK
- Verify installation in package.json
- This provides TypeScript types and API client for Claude integration

### 2. Update Environment Variables Configuration

- Read `.env.example` file
- Add the following documentation:
  ```
  # Anthropic API Key for Claude AI features
  # Get your API key from: https://console.anthropic.com/
  # Required for: Handwriting to Text OCR tool
  ANTHROPIC_API_KEY=your_api_key_here
  ```
- Create or update `.env.local` file (not committed to git) with actual API key
- Document that ANTHROPIC_API_KEY is required for the handwriting OCR feature

### 3. Create Type Definitions File

- Create `app/types/handwriting-ocr.ts`
- Define ProcessingStatus enum:
  ```typescript
  export enum ProcessingStatus {
    PENDING = 'pending',
    UPLOADING = 'uploading',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    ERROR = 'error'
  }
  ```
- Define FileOCRState interface:
  ```typescript
  export interface FileOCRState {
    file: File;
    status: ProcessingStatus;
    progress: number; // 0-100
    extractedText?: string;
    error?: string;
  }
  ```
- Define OCRResponse interface:
  ```typescript
  export interface OCRResponse {
    success: boolean;
    text?: string;
    error?: string;
  }
  ```
- Define API request/response types:
  ```typescript
  export interface ExtractTextRequest {
    images: Array<{
      filename: string;
      data: string; // base64
      mimeType: string;
    }>;
  }

  export interface ExtractTextResponse {
    results: Array<{
      filename: string;
      text?: string;
      error?: string;
    }>;
  }
  ```
- Define constants:
  ```typescript
  export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  export const MAX_FILES = 5; // Process up to 5 images at once
  export const SUPPORTED_IMAGE_FORMATS = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
  ] as const;

  export const ERROR_MESSAGES = {
    FILE_TOO_LARGE: 'File size exceeds 10MB limit',
    INVALID_FILE_TYPE: 'Unsupported file format. Please use JPEG, PNG, WebP, or HEIC',
    TOO_MANY_FILES: 'Maximum 5 files can be processed at once',
    UPLOAD_FAILED: 'Failed to upload file',
    EXTRACTION_FAILED: 'Failed to extract text from image',
    NO_TEXT_FOUND: 'No handwritten text detected in image',
    API_ERROR: 'API service error. Please try again',
    API_KEY_MISSING: 'API key not configured',
  } as const;
  ```
- Export all types and constants

### 4. Create Client-Side Utility Functions

- Create `app/lib/handwriting-ocr.ts`
- Implement file validation:
  ```typescript
  export function validateImageFile(file: File): { valid: boolean; error?: string } {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE };
    }
    if (!SUPPORTED_IMAGE_FORMATS.includes(file.type as any)) {
      return { valid: false, error: ERROR_MESSAGES.INVALID_FILE_TYPE };
    }
    return { valid: true };
  }
  ```
- Implement file to base64 conversion:
  ```typescript
  export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  ```
- Implement API upload function:
  ```typescript
  export async function uploadAndExtractText(
    files: File[]
  ): Promise<ExtractTextResponse> {
    // Validate all files
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    // Convert files to base64
    const images = await Promise.all(
      files.map(async (file) => ({
        filename: file.name,
        data: await fileToBase64(file),
        mimeType: file.type,
      }))
    );

    // Upload to API
    const response = await fetch('/api/extract-handwriting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || ERROR_MESSAGES.UPLOAD_FAILED);
    }

    return response.json();
  }
  ```
- Implement download text file utility:
  ```typescript
  export function downloadTextFile(text: string, filename: string): void {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace(/\.[^/.]+$/, '.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  ```
- Add JSDoc comments to all functions explaining parameters and return values

### 5. Create API Route for Handwriting Extraction

- Create `app/app/api/extract-handwriting/route.ts`
- Import required dependencies:
  ```typescript
  import { NextRequest, NextResponse } from 'next/server';
  import Anthropic from '@anthropic-ai/sdk';
  import {
    ExtractTextRequest,
    ExtractTextResponse,
    MAX_FILE_SIZE,
    MAX_FILES,
    SUPPORTED_IMAGE_FORMATS,
    ERROR_MESSAGES,
  } from '@/types/handwriting-ocr';
  ```
- Implement POST handler function:
  - Validate API key is configured
  - Parse request body
  - Validate number of images (max 5)
  - Validate each image size and format
  - Initialize Anthropic client
  - Process each image with Claude
  - Return results
- Implement Claude vision call for handwriting:
  ```typescript
  async function extractTextFromImage(
    client: Anthropic,
    imageData: string,
    mimeType: string
  ): Promise<string> {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', // Haiku 4.5 for cost-efficiency and speed
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: imageData,
              },
            },
            {
              type: 'text',
              text: 'Please extract all handwritten text from this image. Transcribe exactly what is written, preserving the original formatting, line breaks, and structure as much as possible. If there are multiple sections or paragraphs, maintain their separation. If the handwriting is unclear in any part, include your best interpretation and note the uncertainty with [?] if needed. If no handwritten text is found, respond with "No handwritten text detected."',
            },
          ],
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text in Claude response');
    }

    return textContent.text;
  }
  ```
- Implement comprehensive error handling:
  - Missing API key → 500 error with clear message
  - Invalid request body → 400 error
  - File validation errors → 400 error
  - Anthropic API errors → 500 error with details
  - Rate limit errors → 429 error with retry-after
  - Unknown errors → 500 error
- Return structured response:
  ```typescript
  return NextResponse.json({
    results: processedImages.map((result) => ({
      filename: result.filename,
      text: result.text,
      error: result.error,
    })),
  });
  ```

### 6. Add Tool to Registry

- Read `app/lib/tools.ts`
- Add new tool entry to the tools array:
  ```typescript
  {
    id: 'handwriting-to-text',
    name: 'Handwriting to Text',
    description: 'Extract text from handwritten documents using AI',
    icon: 'FileText', // or 'PenLine' or 'ScanText'
    href: '/tools/handwriting-to-text',
    category: 'AI Tools',
  }
  ```
- Ensure it's inserted in a logical position in the array
- Verify the icon name is available in lucide-react (use FileText, PenLine, ScanText, or similar)

### 7. Create Text Display Component

- Create `app/components/extracted-text-display.tsx`
- Make it a client component ("use client")
- Define props:
  ```typescript
  interface ExtractedTextDisplayProps {
    filename: string;
    text: string;
    onCopy: () => void;
    onDownload: () => void;
  }
  ```
- Import icons: Copy, Download, Check from lucide-react
- Implement component:
  - Display filename as header
  - Show extracted text in a pre-formatted text area or div
  - Copy button (shows checkmark briefly when clicked)
  - Download button
  - Character/word count stats
  - Styling with borders, padding, monospace font for text
  - Dark mode compatible
- Add state for copy feedback (copied → true for 2 seconds)
- Style text area:
  - Whitespace preserved (white-space: pre-wrap)
  - Monospace or readable font
  - Scrollable if content is long
  - Border and background for visibility

### 8. Create Main Page Component Structure

- Create `app/app/tools/handwriting-to-text/page.tsx`
- Add "use client" directive
- Import all necessary components and utilities:
  ```typescript
  import { useState, useCallback } from 'react';
  import { ArrowLeft, Upload, FileText } from 'lucide-react';
  import Link from 'next/link';
  import { Button } from '@/components/ui/button';
  import { FileUploadZone } from '@/components/file-upload-zone';
  import { ThemeToggle } from '@/components/theme-toggle';
  import { ExtractedTextDisplay } from '@/components/extracted-text-display';
  import {
    FileOCRState,
    ProcessingStatus,
    MAX_FILES,
    ERROR_MESSAGES,
  } from '@/types/handwriting-ocr';
  import {
    uploadAndExtractText,
    downloadTextFile,
    validateImageFile,
  } from '@/lib/handwriting-ocr';
  ```
- Define component: `export default function HandwritingToText() { ... }`
- Set up state:
  ```typescript
  const [files, setFiles] = useState<FileOCRState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  ```

### 9. Implement File Upload Handler

- In the main page component, implement file selection handler:
  ```typescript
  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    // Validate file count
    if (selectedFiles.length > MAX_FILES) {
      alert(ERROR_MESSAGES.TOO_MANY_FILES);
      return;
    }

    // Validate each file
    const validationErrors: string[] = [];
    selectedFiles.forEach((file) => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    // Initialize file states
    const initialStates: FileOCRState[] = selectedFiles.map((file) => ({
      file,
      status: ProcessingStatus.PENDING,
      progress: 0,
    }));

    setFiles(initialStates);
  }, []);
  ```

### 10. Implement Text Extraction Handler

- In the main page component, implement extraction handler:
  ```typescript
  const handleExtractText = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);

    try {
      // Update all files to processing status
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: ProcessingStatus.PROCESSING,
          progress: 50,
        }))
      );

      // Call API
      const response = await uploadAndExtractText(files.map((f) => f.file));

      // Update states with results
      setFiles((prev) =>
        prev.map((fileState) => {
          const result = response.results.find(
            (r) => r.filename === fileState.file.name
          );

          if (result?.error) {
            return {
              ...fileState,
              status: ProcessingStatus.ERROR,
              progress: 100,
              error: result.error,
            };
          }

          return {
            ...fileState,
            status: ProcessingStatus.COMPLETED,
            progress: 100,
            extractedText: result?.text || '',
          };
        })
      );
    } catch (error) {
      // Handle errors
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGES.API_ERROR;

      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: ProcessingStatus.ERROR,
          progress: 100,
          error: errorMessage,
        }))
      );
    } finally {
      setIsProcessing(false);
    }
  }, [files]);
  ```

### 11. Implement Copy and Download Handlers

- Implement copy to clipboard:
  ```typescript
  const handleCopyText = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Success feedback handled by ExtractedTextDisplay component
      },
      (err) => {
        console.error('Failed to copy text:', err);
        alert('Failed to copy text to clipboard');
      }
    );
  }, []);
  ```
- Implement download handler:
  ```typescript
  const handleDownloadText = useCallback((text: string, filename: string) => {
    downloadTextFile(text, filename);
  }, []);
  ```
- Implement reset/clear handler:
  ```typescript
  const handleReset = useCallback(() => {
    setFiles([]);
  }, []);
  ```

### 12. Build Page Layout

- Create page structure in the render method:
  ```tsx
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tools
        </Link>

        <h1 className="text-4xl font-bold mb-2">Handwriting to Text</h1>
        <p className="text-muted-foreground mb-8">
          Extract text from handwritten documents using AI-powered OCR
        </p>

        {/* Main content */}
        <div className="space-y-8">
          {/* Upload zone */}
          {files.length === 0 && (
            <FileUploadZone
              onFilesSelected={handleFilesSelected}
              accept="image/*"
              maxFiles={MAX_FILES}
            />
          )}

          {/* Process button */}
          {files.length > 0 && !isProcessing && (
            <div className="flex gap-4">
              <Button onClick={handleExtractText} size="lg">
                <FileText className="mr-2 h-5 w-5" />
                Extract Text from {files.length} {files.length === 1 ? 'Image' : 'Images'}
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                Clear All
              </Button>
            </div>
          )}

          {/* Results */}
          {files.length > 0 && (
            <div className="space-y-6">
              {files.map((fileState, index) => (
                <FileProcessingCard
                  key={index}
                  fileState={fileState}
                  onCopy={handleCopyText}
                  onDownload={handleDownloadText}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  ```

### 13. Create File Processing Card Component

- Create `app/components/file-processing-card.tsx`
- Make it a client component ("use client")
- Define props:
  ```typescript
  interface FileProcessingCardProps {
    fileState: FileOCRState;
    onCopy: (text: string) => void;
    onDownload: (text: string, filename: string) => void;
  }
  ```
- Implement component that shows:
  - Filename
  - Status badge (pending, processing, completed, error)
  - Progress bar during processing
  - Error message if status is error
  - Extracted text display if completed
  - Copy and download buttons if completed
  - Loading spinner during processing
- Use different styles for each status:
  - Pending: gray/neutral
  - Processing: blue with animation
  - Completed: green
  - Error: red
- Integrate ExtractedTextDisplay component for completed state

### 14. Add Informational Content Section

- At the bottom of the main page, add an info section:
  ```tsx
  <div className="mt-12 p-6 border rounded-lg bg-card">
    <h2 className="text-2xl font-semibold mb-4">About This Tool</h2>

    <div className="space-y-4 text-muted-foreground">
      <div>
        <h3 className="font-semibold text-foreground mb-2">How It Works</h3>
        <p>
          This tool uses Claude AI's advanced vision capabilities to accurately
          recognize and extract text from handwritten documents. Upload an image
          of your handwritten notes, and the AI will transcribe the text for you.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-2">Supported Formats</h3>
        <ul className="list-disc list-inside">
          <li>JPEG and JPG images</li>
          <li>PNG images</li>
          <li>WebP images</li>
          <li>HEIC images (iPhone photos)</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-2">Tips for Best Results</h3>
        <ul className="list-disc list-inside">
          <li>Ensure good lighting and avoid shadows</li>
          <li>Take photos directly overhead, not at an angle</li>
          <li>Use high-resolution images when possible</li>
          <li>Make sure handwriting is clear and legible</li>
          <li>Process one page at a time for better accuracy</li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-2">Privacy & Security</h3>
        <p>
          Images are processed securely through the Anthropic API and are not
          stored permanently. The AI analyzes your handwriting to extract text,
          and the results are returned directly to you.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-foreground mb-2">Limitations</h3>
        <ul className="list-disc list-inside">
          <li>Maximum file size: 10MB per image</li>
          <li>Maximum 5 images per batch</li>
          <li>Very messy or illegible handwriting may not be accurately recognized</li>
          <li>Non-Latin scripts may have varying accuracy</li>
        </ul>
      </div>
    </div>
  </div>
  ```

### 15. Style Components for Consistency

- Ensure all components use Tailwind classes consistent with other tools
- Apply proper spacing with space-y-* and gap-* utilities
- Use border, rounded-lg, and shadow classes for cards
- Implement proper hover states on buttons and interactive elements
- Verify dark mode compatibility:
  - Use bg-background, bg-card for backgrounds
  - Use text-foreground, text-muted-foreground for text
  - Use border-border for borders
  - Test in both light and dark modes
- Make responsive:
  - Single column on mobile (< 640px)
  - Proper padding and margins at all sizes
  - Touch-friendly button sizes (minimum 44x44px)
  - Readable font sizes on small screens
- Add loading states:
  - Spinner or skeleton during processing
  - Progress bars with animations
  - Disabled buttons during processing

### 16. Implement Error Handling UI

- Create user-friendly error messages for common scenarios:
  - API key not configured → Show setup instructions
  - File too large → Suggest image compression
  - Unsupported format → List supported formats
  - No text detected → Suggest better image quality
  - API rate limit → Suggest waiting and retry
  - Network error → Suggest checking connection
- Display errors prominently with:
  - Red background or border
  - Error icon
  - Clear explanation
  - Actionable next steps when possible
  - Retry button for transient errors
- Add error boundaries for React errors
- Log errors to console for debugging
- Never expose API keys or sensitive details in error messages

### 17. Add Loading and Progress States

- Show loading spinner during API calls
- Implement progress tracking:
  - 0%: File selected
  - 25%: File uploaded
  - 50%: Processing with Claude
  - 75%: Receiving response
  - 100%: Complete
- Animate progress bar smoothly
- Show current status text (Uploading..., Processing..., Complete)
- Disable upload zone during processing
- Disable extract button during processing
- Show processing count: "Processing 2 of 5 images..."
- Provide visual feedback that work is happening

### 18. Test File Upload Flow

- Test uploading single image:
  - Select file via file picker
  - Drag and drop file
  - Verify preview appears
  - Verify file is validated
- Test uploading multiple images (2-5):
  - Select multiple files at once
  - Verify all appear in list
  - Verify individual states tracked
- Test file validation errors:
  - Upload file > 10MB → should show error
  - Upload unsupported format (e.g., .txt) → should show error
  - Upload > 5 files → should show error
- Test canceling upload:
  - Clear all button works
  - Can start over with new files

### 19. Test API Integration

- Test with real Anthropic API key:
  - Set ANTHROPIC_API_KEY in .env.local
  - Upload sample handwritten image
  - Click extract text
  - Verify API call succeeds
  - Verify text is extracted correctly
- Test without API key:
  - Remove or unset ANTHROPIC_API_KEY
  - Verify friendly error message
  - Verify no crash or exposed secrets
- Test with various handwriting styles:
  - Print handwriting
  - Cursive handwriting
  - Mixed styles
  - Different languages (if supported)
  - Poor quality images
- Test API error handling:
  - Invalid API key → clear error message
  - Rate limit exceeded → retry suggestion
  - Network timeout → network error message
  - Malformed response → parsing error handled

### 20. Test Text Extraction Accuracy

- Test with different image qualities:
  - High resolution photo → should extract accurately
  - Low resolution → may have errors, should still attempt
  - Blurry image → should indicate uncertainty
  - Dark or shadowed → may fail or be inaccurate
- Test with different content:
  - Simple note with a few sentences
  - Full page of handwritten text
  - Bullet points and lists
  - Numbers and dates
  - Mixed content (text + diagrams)
- Verify formatting preservation:
  - Line breaks maintained
  - Paragraph structure preserved
  - Spacing approximately maintained
- Test edge cases:
  - Empty/blank page → should indicate no text
  - Printed text (not handwriting) → may still extract
  - Image with no text → should say no text found
  - Rotated image → Claude may still recognize

### 21. Test Copy and Download Functionality

- Test copy to clipboard:
  - Click copy button
  - Paste in text editor
  - Verify exact text matches
  - Verify formatting preserved (line breaks)
  - Verify "Copied!" feedback appears
  - Test on multiple browsers
- Test download functionality:
  - Click download button
  - Verify .txt file downloads
  - Verify filename matches original image name
  - Verify content matches extracted text
  - Verify UTF-8 encoding (special characters work)
- Test with different browsers:
  - Chrome, Firefox, Safari, Edge
  - Mobile browsers (Safari iOS, Chrome Android)
  - Verify clipboard API works or fallback exists

### 22. Test Responsive Design

- Test on mobile (375px width):
  - Single column layout
  - Upload zone is usable
  - Buttons are tappable (minimum 44x44px)
  - Text is readable
  - No horizontal scrolling
  - Results are well formatted
- Test on tablet (768px width):
  - Layout adapts appropriately
  - Good use of space
  - Touch targets adequate
- Test on desktop (1920px width):
  - Content not stretched too wide (max-width container)
  - Comfortable reading width
  - Good visual hierarchy
- Test in landscape orientation:
  - Mobile landscape
  - Tablet landscape
  - Layout remains usable
- Verify text areas are scrollable when content is long
- Verify images/previews scale appropriately

### 23. Test Dark Mode

- Toggle to dark mode
- Verify all text is readable:
  - Headers, body text, labels
  - Muted text has sufficient contrast
  - Links are distinguishable
- Verify backgrounds:
  - Page background appropriate
  - Card backgrounds contrast with page
  - Input/textarea backgrounds visible
  - Borders visible but subtle
- Verify buttons and interactive elements:
  - Visible in both modes
  - Hover states work
  - Disabled states clear
- Verify extracted text area:
  - Background contrasts with page
  - Text is readable
  - Borders visible
- Switch between modes multiple times:
  - No flashing or jarring transitions
  - State persists correctly
  - No layout shifts

### 24. Test Accessibility

- Test keyboard navigation:
  - Tab through all interactive elements
  - Verify logical tab order
  - Verify all buttons/links reachable
  - Visible focus indicators on all elements
  - Enter/Space activates buttons
- Test with screen reader (NVDA or VoiceOver):
  - Page title announced correctly
  - All buttons have clear labels
  - File upload zone has instructions
  - Status updates announced
  - Error messages announced
  - Extracted text is readable
- Verify ARIA labels:
  - Upload zone has aria-label
  - Buttons have clear labels
  - Status badges have aria-live regions
  - Progress bars have aria-valuenow
- Test with browser zoom:
  - Zoom to 200%
  - Verify layout doesn't break
  - Verify text remains readable
  - Verify no content cut off
- Ensure color is not the only indicator:
  - Status uses both color and text/icons
  - Errors have icons not just red color
  - Success states have text confirmation

### 25. Test Performance

- Test with maximum file sizes (10MB each):
  - Upload 5 x 10MB images
  - Verify system handles load
  - Monitor network tab for request sizes
  - Verify no memory leaks
- Test processing time:
  - Single image should complete quickly (< 10 seconds)
  - Multiple images may take longer
  - Progress indicators show work is happening
  - UI remains responsive during processing
- Test with rapid interactions:
  - Quick file selections
  - Rapid button clicks
  - Cancel and re-upload quickly
  - Verify no race conditions or crashes
- Monitor browser DevTools:
  - Check for console errors
  - Check network requests
  - Check for memory leaks (heap snapshots)
  - Verify no long tasks blocking main thread

### 26. Test Error Recovery

- Test recovery from errors:
  - After API error, can retry
  - After validation error, can select different files
  - Clear all and start fresh works
- Test partial failures:
  - If 3 of 5 images succeed, 2 fail
  - Verify successes show extracted text
  - Verify failures show error messages
  - Can copy/download successful results
  - Can retry failed ones
- Test network interruption:
  - Start upload, disconnect network
  - Verify graceful error handling
  - Reconnect network, allow retry
- Test browser refresh during processing:
  - State is lost (expected, document this)
  - No corruption or errors on reload

### 27. Security and Privacy Testing

- Verify API key security:
  - API key never sent to client
  - API key not in browser DevTools
  - API key not in source maps
  - API key only used server-side
- Test CORS and CSP:
  - API routes only accept same-origin requests
  - No CORS issues with legitimate requests
- Verify file validation:
  - Server validates file size (don't trust client)
  - Server validates file type
  - Server validates request structure
- Test with malicious inputs:
  - Very large filenames
  - Special characters in filenames
  - Malformed base64 data
  - Verify server handles gracefully
- Verify images are not persisted:
  - Images processed but not saved to disk
  - Verify no uploaded files in temp directories
  - Confirm privacy claims in docs

### 28. End-to-End User Scenarios

- **Scenario 1: Single Handwritten Note**
  - User navigates to /tools/handwriting-to-text
  - Takes photo of handwritten note on phone
  - Uploads photo
  - Clicks "Extract Text"
  - Waits for processing (5-10 seconds)
  - Reads extracted text
  - Copies text to clipboard
  - Pastes into notes app
  - Success!

- **Scenario 2: Multiple Pages of Meeting Notes**
  - User has 3 pages of handwritten meeting notes
  - Photographs all 3 pages
  - Uploads all 3 images at once
  - Clicks "Extract Text from 3 Images"
  - Waits for processing
  - Reviews all 3 extracted text blocks
  - Downloads each as separate .txt file
  - Success!

- **Scenario 3: Error Handling**
  - User uploads blurry photo
  - Processing completes but text is garbled
  - User sees warning about image quality
  - User takes new, clearer photo
  - Clears and re-uploads
  - Extracts text successfully
  - Success!

- **Scenario 4: API Key Not Configured**
  - Developer deploys without API key
  - User tries to extract text
  - Sees friendly error: "API key not configured"
  - Developer adds API key to .env.local
  - User refreshes and tries again
  - Works correctly now
  - Success!

### 29. Code Quality and Cleanup

- Review all TypeScript types:
  - No `any` types (use proper types)
  - All props interfaces defined
  - All function signatures typed
  - API route types match client types
- Check code formatting:
  - Consistent indentation (2 spaces)
  - Proper import ordering (React, Next, local, types, components)
  - No unused imports or variables
  - No commented-out code
- Add JSDoc comments:
  - Document all utility functions
  - Explain Claude API prompt strategy
  - Document error handling approach
- Review error handling:
  - All async functions have try/catch
  - User-facing errors are clear and actionable
  - Technical errors logged to console
  - No unhandled promise rejections
- Verify naming conventions:
  - Components in PascalCase
  - Functions in camelCase
  - Constants in UPPER_SNAKE_CASE
  - Types in PascalCase
- Remove debug code:
  - Remove console.log statements (except intentional error logs)
  - Remove test data
  - Remove commented code

### 30. Documentation

- Add inline comments for complex logic:
  - Explain Claude prompt engineering choices
  - Document file size/format constraints
  - Explain error handling strategy
- Document environment variables:
  - In .env.example, clearly document ANTHROPIC_API_KEY
  - Provide link to get API key
  - Explain which features require it
- Add usage tips in UI:
  - Photo quality recommendations
  - Supported formats clearly listed
  - File size limits displayed
  - Privacy information visible
- Document API route:
  - Request/response format
  - Error codes and meanings
  - Rate limiting considerations

### 31. Run Validation Commands

Execute validation commands to ensure the feature works correctly with zero regressions.

- Run `cd app && npm run lint`:
  - Verify zero ESLint errors
  - Fix any linting warnings related to new code
  - Ensure imports are correctly ordered

- Run `cd app && npm run build`:
  - Verify successful build
  - Verify zero TypeScript errors
  - Check build output size (should not increase significantly)
  - Verify API routes compile correctly

- Run `cd app && npm run dev`:
  - Start development server
  - Navigate to http://localhost:3050
  - Verify "Handwriting to Text" tool appears on homepage
  - Click tool card
  - Verify page loads at /tools/handwriting-to-text
  - Upload a test handwritten image
  - Click "Extract Text"
  - Verify text is extracted correctly
  - Test copy to clipboard
  - Test download as text file
  - Test with multiple images
  - Test error scenarios (large file, unsupported format)
  - Toggle dark mode and verify appearance
  - Test on mobile viewport (375px)
  - Verify no console errors or warnings
  - Test in Firefox and Safari if available
  - Navigate back to homepage
  - Verify no regressions to existing tools

## Testing Strategy

### Unit Tests

Since this application doesn't currently have a testing framework, unit tests are not included. However, if testing is added in the future, consider testing:

- **File Validation**: Test validateImageFile with various file types, sizes, and edge cases
- **File Conversion**: Test fileToBase64 with different image formats
- **Text Download**: Test downloadTextFile creates correct blob and filename
- **API Request Construction**: Test that upload request is properly formatted
- **Error Parsing**: Test that API errors are correctly interpreted and displayed

### Integration Tests

Manual integration tests to perform:

- **Upload to API**: File upload triggers correct API route with proper format
- **API to Claude**: API route correctly calls Anthropic SDK with image data
- **Claude to Client**: Extracted text flows back to UI and displays correctly
- **Copy Integration**: Copy button successfully writes to system clipboard
- **Download Integration**: Download creates valid .txt file with correct content
- **Error Flow**: API errors propagate to UI as user-friendly messages
- **Theme Integration**: Dark mode toggle affects entire page including new components
- **Responsive Integration**: Layout adapts correctly at all breakpoints

### Edge Cases

- **Empty Image**: Image with no handwriting → should return "No text detected"
- **Very Large Image**: 10MB image → should process successfully
- **Oversized Image**: 11MB image → should reject with clear error
- **Unsupported Format**: Upload .gif or .bmp → should reject with format error
- **Too Many Files**: Upload 6+ images → should reject with count error
- **Network Timeout**: Slow network during API call → should handle timeout gracefully
- **API Rate Limit**: Exceed Claude API quota → should show rate limit message
- **Malformed API Response**: Claude returns unexpected format → should handle parsing error
- **Missing API Key**: ANTHROPIC_API_KEY not set → should show setup instructions
- **Invalid API Key**: Wrong API key configured → should show authentication error
- **Concurrent Requests**: User clicks extract multiple times → should prevent duplicate requests
- **Special Characters**: Handwriting with symbols, emojis, non-English → should attempt extraction
- **Rotated Image**: Photo taken at angle → Claude may still recognize (document limitation)
- **Very Long Text**: Full page of dense handwriting → should extract all text without truncation
- **Mixed Content**: Page with text and drawings → should extract only text portions

## Acceptance Criteria

1. **Tool Visibility**:
   - Handwriting to Text tool appears on homepage
   - Tool is accessible via /tools/handwriting-to-text route
   - Page loads without errors
   - Tool displays in correct category ("AI Tools")

2. **File Upload**:
   - Supports drag-and-drop and file picker selection
   - Accepts JPEG, PNG, WebP, HEIC formats
   - Validates file size (max 10MB per file)
   - Validates file count (max 5 files)
   - Shows clear validation errors
   - Displays selected files with previews or filenames

3. **Text Extraction**:
   - Uploads images to API route successfully
   - API route calls Anthropic Claude Haiku 4.5 model
   - Claude vision API analyzes handwritten content
   - Extracted text returned to client
   - Processing completes in reasonable time (< 30 seconds for 5 images)
   - Shows progress indicators during processing

4. **Results Display**:
   - Extracted text displayed in readable format
   - Formatting and line breaks preserved
   - Each image's result shown separately
   - Clear indication of success or failure per image
   - Character/word count displayed
   - Results remain accessible after processing

5. **Copy to Clipboard**:
   - Copy button for each extracted text result
   - Clipboard copy works in all major browsers
   - "Copied!" feedback appears briefly
   - Preserves text formatting including line breaks
   - Handles clipboard permission errors gracefully

6. **Download Functionality**:
   - Download button creates .txt file
   - Filename based on original image name
   - Text file contains exact extracted text
   - UTF-8 encoding for special characters
   - Downloads work in all major browsers

7. **Error Handling**:
   - File validation errors shown clearly
   - API errors display user-friendly messages
   - Missing API key shows setup instructions
   - Rate limit errors suggest waiting
   - Network errors suggest checking connection
   - No text detected handled gracefully
   - Partial failures (some succeed, some fail) handled correctly

8. **User Interface**:
   - Consistent header with back link and theme toggle
   - Responsive layout (mobile, tablet, desktop)
   - Clear instructions and labeling
   - Loading states during processing
   - Status indicators for each file (pending, processing, complete, error)
   - Informational content about tool capabilities and limitations

9. **Dark Mode Support**:
   - All UI elements visible and styled in dark mode
   - Text has sufficient contrast
   - Cards and borders visible
   - Smooth transition between themes
   - No layout shifts when toggling

10. **Accessibility**:
    - All interactive elements keyboard accessible
    - Logical tab order
    - Visible focus indicators
    - Screen reader compatible
    - ARIA labels on file upload zone
    - Status updates announced
    - Works with 200% browser zoom

11. **Responsive Design**:
    - Works on mobile (375px+), tablet (768px+), desktop (1024px+)
    - Single column layout on mobile
    - Touch targets minimum 44x44px on mobile
    - No horizontal scrolling
    - Content readable at all sizes
    - File upload zone usable on touch devices

12. **Performance**:
    - Page loads quickly
    - File upload responsive
    - API calls complete in reasonable time
    - No memory leaks with extended use
    - UI remains responsive during processing
    - Progress indicators show work is happening

13. **Security & Privacy**:
    - API key stored server-side only (never exposed to client)
    - Images not persisted on server
    - File validation on both client and server
    - No sensitive data in error messages
    - Privacy policy clearly stated

14. **Browser Compatibility**:
    - Works in Chrome, Firefox, Safari, Edge
    - Clipboard copy works or has fallback
    - File upload works in all browsers
    - No console errors in any browser
    - Layout consistent across browsers

15. **Code Quality**:
    - Proper TypeScript types throughout
    - Zero ESLint errors
    - Zero TypeScript compilation errors
    - Build completes successfully
    - Code follows project conventions
    - No unused imports or variables
    - Functions and variables well-named
    - Complex logic commented

16. **Documentation**:
    - Environment variables documented in .env.example
    - API key setup instructions clear
    - Tool capabilities and limitations explained
    - Usage tips provided to users
    - Code comments explain non-obvious logic

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `cd app && npm run lint` - Run linting to validate code quality. Must pass with zero errors. Pre-existing warnings from other files are acceptable.

- `cd app && npm run build` - Build the Next.js app to validate there are no TypeScript errors or build failures. Must complete successfully.

- `cd app && npm run dev` - Start development server and perform comprehensive manual testing:
  - Navigate to http://localhost:3050
  - Verify "Handwriting to Text" tool card appears on homepage in "AI Tools" category
  - Click tool card
  - Verify page loads at /tools/handwriting-to-text
  - Verify upload zone appears with clear instructions
  - Test file selection:
    - Click upload zone and select a handwritten image
    - Verify image is accepted and appears in the list
    - Clear and select multiple images (2-3)
    - Verify all appear
  - Test file validation:
    - Try uploading a file > 10MB → should show error
    - Try uploading unsupported format (e.g., .gif) → should show error
    - Try uploading > 5 files → should show error
  - Test text extraction:
    - Upload 1-2 handwritten images (JPEG or PNG)
    - Click "Extract Text" button
    - Verify processing indicator appears
    - Wait for processing to complete
    - Verify extracted text displays correctly
    - Verify text is readable and accurate
  - Test copy functionality:
    - Click copy button on extracted text
    - Paste in text editor (Notepad, etc.)
    - Verify exact text matches
    - Verify "Copied!" feedback appears
  - Test download functionality:
    - Click download button
    - Verify .txt file downloads
    - Open file and verify content matches
  - Test error handling:
    - Remove or invalidate ANTHROPIC_API_KEY in .env.local
    - Restart dev server
    - Try to extract text
    - Verify friendly error message about API key
    - Restore API key and restart server
  - Test dark mode:
    - Toggle dark mode using theme toggle
    - Verify all elements visible and styled correctly
    - Verify text readable
    - Toggle back to light mode
  - Test responsive design:
    - Resize browser to 375px width (mobile)
    - Verify single column layout
    - Verify upload zone usable
    - Verify buttons tappable
    - Resize to 1920px (desktop)
    - Verify layout adapts appropriately
  - Test keyboard navigation:
    - Tab through all interactive elements
    - Verify focus indicators visible
    - Verify logical tab order
    - Activate buttons with Enter/Space
  - Verify no console errors or warnings during entire flow
  - Test in Firefox and Safari if possible
  - Navigate back to homepage
  - Verify no regressions to existing tools
  - Click through 2-3 other tools to confirm they still work

## Notes

### Claude Haiku Selection

Claude Haiku 4.5 (claude-haiku-4-5-20251001) is selected for this feature because:
- **Cost-effective**: Haiku is the most affordable Claude model at $1/MTok input and $5/MTok output, ideal for potentially high-volume OCR tasks
- **Fastest**: Haiku 4.5 is the fastest Claude model, providing near-instant responses for better user experience
- **Near-frontier intelligence**: Despite being the smallest model, Haiku 4.5 has exceptional vision capabilities suitable for handwriting recognition
- **Multimodal**: Supports vision inputs natively, can analyze images directly
- **Extended thinking**: Supports extended thinking for complex extractions if needed
- **64K output**: Supports up to 64K tokens output for very long documents

If accuracy is more critical than cost for certain use cases, consider allowing users to choose between Haiku 4.5 and Sonnet 4.5, or use Sonnet for particularly challenging handwriting.

### Prompt Engineering for Handwriting

The prompt to Claude is carefully designed:
- Explicitly asks for "handwritten text" to distinguish from printed text
- Requests preservation of formatting and structure
- Asks for best interpretation even if unclear
- Instructs to note uncertainty with [?] markers
- Handles case where no text is found
- Maintains line breaks and paragraph structure

This prompt can be refined based on testing results to improve accuracy.

### Rate Limiting Considerations

Anthropic API has rate limits that vary by tier:
- **Free tier**: Very limited requests per minute
- **Paid tiers**: Higher limits based on usage tier

Considerations:
- Batch processing (5 files at once) reduces total API calls vs. processing individually
- Show clear error messages when rate limited
- Suggest retry after waiting period
- Consider implementing client-side rate limiting or queue for very high usage

### File Size and Format Trade-offs

**10MB limit**: Balances quality with performance
- Most phone photos are 2-5MB
- High-res scans can be 5-10MB
- If users need larger files, suggest image compression tools first

**Supported formats**: JPEG, PNG, WebP, HEIC
- Most common photo formats covered
- Claude API supports these formats natively
- HEIC may need conversion (app already has HEIC converter)

**Context window**: 200K tokens
- Haiku 4.5 supports up to 200K token context window
- More than sufficient for even very large documents
- Can handle multiple high-resolution images in a single request

**Model capabilities**:
- Reliable knowledge cutoff: February 2025
- Training data cutoff: July 2025
- Extended thinking support for complex extractions
- 64K max output tokens (can handle very long transcriptions)

### Future Enhancements

Potential features for future iterations:
- **Batch download**: Download all extracted texts as a single ZIP file
- **Language detection**: Identify language of handwriting
- **Confidence scores**: Show Claude's confidence in extraction
- **Side-by-side view**: Show original image and extracted text together
- **Edit before download**: Allow user to correct extracted text before saving
- **OCR history**: Save recent extractions (with user permission)
- **Multiple AI models**: Allow choosing between Haiku, Sonnet, Opus for accuracy/cost trade-off
- **Structured extraction**: Extract specific fields (date, name, address) from forms
- **Table recognition**: Extract handwritten tables into CSV format
- **Multi-page PDF**: Upload PDF and extract from all pages
- **Real-time preview**: Extract as you upload for instant feedback

### Cost Estimation

Claude Haiku 4.5 pricing (as of 2025):
- Input: $1.00 per million tokens (MTok)
- Output: $5.00 per million tokens (MTok)

Typical handwriting OCR request:
- Image: ~1,500 tokens (varies by size and resolution)
- Output: ~500 tokens (varies by text amount)
- Total cost per image: (~1,500 × $1/MTok) + (~500 × $5/MTok) = $0.0015 + $0.0025 = ~$0.004 per image

So processing 100 images would cost approximately $0.40. This is still very affordable for most use cases, with the benefit of much faster processing and better accuracy with Haiku 4.5.

Note: Costs may be lower with batch processing or prompt caching for repeated patterns.

### Privacy and Data Handling

**Important privacy considerations**:
- Images are sent to Anthropic API for processing (external service)
- Anthropic's data usage policy applies
- Images should NOT be saved to server disk
- Extracted text is ephemeral (not stored in database)
- Users should be informed that data is processed by AI service
- Consider adding option to delete results immediately
- GDPR/CCPA compliance may require data processing agreement with Anthropic

**Recommendations**:
- Clearly state in UI that images are processed by Anthropic
- Link to Anthropic's privacy policy
- Don't process sensitive documents without user awareness
- Consider adding disclaimer for medical, financial, or legal documents

### Error Handling Strategy

**Client-side validation**:
- Catch errors before API call (file size, format, count)
- Provide immediate feedback
- Prevent unnecessary API calls

**Server-side validation**:
- Re-validate all inputs (never trust client)
- Protect against malicious requests
- Return structured error responses

**API error handling**:
- Authentication errors → setup instructions
- Rate limit errors → wait and retry suggestion
- Network errors → connection troubleshooting
- Parsing errors → graceful degradation

**User communication**:
- Errors in plain language, not technical jargon
- Actionable next steps when possible
- Escalation path for persistent issues (support contact)

### Testing with Real Handwriting

For comprehensive testing, use:
- **Print handwriting**: Clear block letters
- **Cursive handwriting**: Flowing, connected letters
- **Mixed styles**: Some print, some cursive
- **Poor quality**: Blurry, angled, shadowed photos
- **High quality**: Clear, well-lit, straight-on photos
- **Different languages**: English, Spanish, French, etc. (if supported)
- **Different content**: Notes, letters, forms, lists
- **Edge cases**: Very dense text, very sparse text, no text

Maintain a test suite of sample images for regression testing.

### Anthropic SDK Configuration

The Anthropic SDK requires minimal configuration:
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

**Environment variable**: Must be set on server-side only
- In development: .env.local file
- In production: Environment variables in hosting platform (Vercel, etc.)

**Security**: Never expose API key to client
- API route runs server-side only
- Client never sees API key
- Verify API key not in browser DevTools or source maps

### Deployment Considerations

When deploying to production:
1. **Set environment variable**: ANTHROPIC_API_KEY in hosting platform
2. **Monitor API usage**: Track costs in Anthropic console
3. **Set up alerts**: Get notified if usage spikes unexpectedly
4. **Consider caching**: If same image uploaded multiple times, cache result (optional)
5. **Rate limiting**: Implement rate limiting to prevent abuse
6. **Error monitoring**: Use services like Sentry to track errors
7. **Usage analytics**: Track how many extractions, success rate, etc.

### Code Organization

Files are organized by purpose:
- **Types** (`types/handwriting-ocr.ts`): TypeScript interfaces, enums, constants
- **Client utilities** (`lib/handwriting-ocr.ts`): File validation, upload, download functions
- **API route** (`app/api/extract-handwriting/route.ts`): Server-side Claude integration
- **Components** (`components/*.tsx`): Reusable UI components
- **Page** (`app/tools/handwriting-to-text/page.tsx`): Main page composition and state management

This separation ensures:
- Clear boundaries between client and server code
- Reusable utilities and components
- Testable pure functions
- Maintainable codebase
