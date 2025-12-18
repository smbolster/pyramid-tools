'use client';

import { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExtractedTextDisplayProps {
  filename: string;
  text: string;
  onCopy: () => void;
  onDownload: () => void;
}

export function ExtractedTextDisplay({
  filename,
  text,
  onCopy,
  onDownload,
}: ExtractedTextDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate stats
  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = text.split('\n').length;

  return (
    <div className="border rounded-lg p-4 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground truncate">{filename}</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            onClick={onDownload}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground flex gap-4">
        <span>{charCount} characters</span>
        <span>{wordCount} words</span>
        <span>{lineCount} lines</span>
      </div>

      <div className="bg-muted rounded-md p-4 max-h-[400px] overflow-y-auto">
        <pre className="text-sm whitespace-pre-wrap break-words font-mono">
          {text}
        </pre>
      </div>
    </div>
  );
}
