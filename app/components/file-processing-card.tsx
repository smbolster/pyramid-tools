'use client';

import { FileOCRState, ProcessingStatus } from '@/types/handwriting-ocr';
import { Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { ExtractedTextDisplay } from '@/components/extracted-text-display';
import { cn } from '@/lib/utils';

interface FileProcessingCardProps {
  fileState: FileOCRState;
  onCopy: (text: string) => void;
  onDownload: (text: string, filename: string) => void;
}

export function FileProcessingCard({
  fileState,
  onCopy,
  onDownload,
}: FileProcessingCardProps) {
  const { file, status, progress, extractedText, error } = fileState;

  const getStatusConfig = () => {
    switch (status) {
      case ProcessingStatus.PENDING:
        return {
          icon: Clock,
          label: 'Pending',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
        };
      case ProcessingStatus.UPLOADING:
        return {
          icon: Loader2,
          label: 'Uploading...',
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          animated: true,
        };
      case ProcessingStatus.PROCESSING:
        return {
          icon: Loader2,
          label: 'Processing...',
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          animated: true,
        };
      case ProcessingStatus.COMPLETED:
        return {
          icon: CheckCircle,
          label: 'Completed',
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-950',
        };
      case ProcessingStatus.ERROR:
        return {
          icon: AlertCircle,
          label: 'Error',
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-950',
        };
      default:
        return {
          icon: Clock,
          label: 'Unknown',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn('border rounded-lg p-4 space-y-3', statusConfig.bgColor)}>
      {/* Header with filename and status */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <div className={cn('flex items-center gap-2', statusConfig.color)}>
          <StatusIcon
            className={cn('h-5 w-5', statusConfig.animated && 'animate-spin')}
          />
          <span className="text-sm font-medium">{statusConfig.label}</span>
        </div>
      </div>

      {/* Progress bar for processing states */}
      {(status === ProcessingStatus.UPLOADING ||
        status === ProcessingStatus.PROCESSING) && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error message */}
      {status === ProcessingStatus.ERROR && error && (
        <div className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-100 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Extracted text display */}
      {status === ProcessingStatus.COMPLETED && extractedText && (
        <ExtractedTextDisplay
          filename={file.name}
          text={extractedText}
          onCopy={() => onCopy(extractedText)}
          onDownload={() => onDownload(extractedText, file.name)}
        />
      )}
    </div>
  );
}
