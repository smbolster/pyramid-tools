'use client';

import { Loader2 } from 'lucide-react';

interface QRCodePreviewProps {
  /** Data URL of the generated QR code */
  dataUrl: string | null;
  /** Whether QR code is currently being generated */
  isGenerating: boolean;
  /** Error message if generation failed */
  error: string | null;
}

/**
 * Component to display QR code preview with loading and error states
 */
export function QRCodePreview({ dataUrl, isGenerating, error }: QRCodePreviewProps) {
  return (
    <div className="flex items-center justify-center aspect-square w-full max-w-md mx-auto rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8">
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Generating QR code...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center text-center px-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : dataUrl ? (
        <img
          src={dataUrl}
          alt="Generated QR Code"
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-center px-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter text to generate QR code
          </p>
        </div>
      )}
    </div>
  );
}
