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

/**
 * Extracts handwritten text from an image using Claude's vision API
 * @param client - Anthropic client instance
 * @param imageData - Base64 encoded image data
 * @param mimeType - MIME type of the image
 * @returns Extracted text from the image
 */
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
              media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
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

export async function POST(request: NextRequest) {
  try {
    // Validate API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: ERROR_MESSAGES.API_KEY_MISSING },
        { status: 500 }
      );
    }

    // Parse request body
    const body: ExtractTextRequest = await request.json();
    const { images } = body;

    // Validate request
    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { message: 'Invalid request: images array required' },
        { status: 400 }
      );
    }

    if (images.length === 0) {
      return NextResponse.json(
        { message: 'No images provided' },
        { status: 400 }
      );
    }

    if (images.length > MAX_FILES) {
      return NextResponse.json(
        { message: ERROR_MESSAGES.TOO_MANY_FILES },
        { status: 400 }
      );
    }

    // Validate each image
    for (const image of images) {
      if (!image.filename || !image.data || !image.mimeType) {
        return NextResponse.json(
          { message: 'Invalid image data: filename, data, and mimeType required' },
          { status: 400 }
        );
      }

      if (!SUPPORTED_IMAGE_FORMATS.includes(image.mimeType as typeof SUPPORTED_IMAGE_FORMATS[number])) {
        return NextResponse.json(
          { message: `${ERROR_MESSAGES.INVALID_FILE_TYPE}: ${image.filename}` },
          { status: 400 }
        );
      }

      // Estimate size from base64 (roughly 4/3 of original)
      const estimatedSize = (image.data.length * 3) / 4;
      if (estimatedSize > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: `${ERROR_MESSAGES.FILE_TOO_LARGE}: ${image.filename}` },
          { status: 400 }
        );
      }
    }

    // Initialize Anthropic client
    const client = new Anthropic({ apiKey });

    // Process each image
    const results = await Promise.all(
      images.map(async (image) => {
        try {
          const text = await extractTextFromImage(
            client,
            image.data,
            image.mimeType
          );
          return {
            filename: image.filename,
            text,
          };
        } catch (error) {
          console.error(`Error processing ${image.filename}:`, error);
          return {
            filename: image.filename,
            error:
              error instanceof Error
                ? error.message
                : ERROR_MESSAGES.EXTRACTION_FAILED,
          };
        }
      })
    );

    const response: ExtractTextResponse = { results };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in extract-handwriting API:', error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      // Check for rate limit errors
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { message: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      // Check for authentication errors
      if (error.message.includes('authentication') || error.message.includes('api_key')) {
        return NextResponse.json(
          { message: 'API authentication failed. Please check configuration.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: ERROR_MESSAGES.API_ERROR },
      { status: 500 }
    );
  }
}
