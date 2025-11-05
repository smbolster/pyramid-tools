'use client'

/**
 * Annotation Toolbar Component
 *
 * Displays a toolbar with buttons for selecting different annotation tools.
 */

import {
  MousePointer,
  ArrowRight,
  Type,
  Square,
  Circle,
  Minus,
  Pen,
  Highlighter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnnotationTool } from '@/types/screenshot-annotator'
import { cn } from '@/lib/utils'

interface AnnotationToolbarProps {
  currentTool: AnnotationTool
  onToolChange: (tool: AnnotationTool) => void
  disabled?: boolean
}

interface ToolDef {
  id: AnnotationTool
  icon: typeof MousePointer
  label: string
  shortcut: string
}

const tools: ToolDef[] = [
  { id: 'select', icon: MousePointer, label: 'Select', shortcut: 'V' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow', shortcut: 'A' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'C' },
  { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'pen', icon: Pen, label: 'Pen', shortcut: 'P' },
  { id: 'highlighter', icon: Highlighter, label: 'Highlighter', shortcut: 'H' }
]

export function AnnotationToolbar({ currentTool, onToolChange, disabled = false }: AnnotationToolbarProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {tools.map((tool) => {
        const Icon = tool.icon
        const isActive = currentTool === tool.id

        return (
          <Button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            disabled={disabled}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'flex flex-col items-center justify-center h-16 gap-1',
              isActive && 'ring-2 ring-primary'
            )}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{tool.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
