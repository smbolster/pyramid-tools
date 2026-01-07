# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pyramid Tools is a Next.js 16 web application providing browser-based utility tools. It uses the App Router, TypeScript, Tailwind CSS 4, and shadcn/ui components.

## Commands

```bash
# Development (from project root)
cd app && npm run dev          # Start dev server on port 3050

# Build and lint
cd app && npm run build        # Production build
cd app && npm run lint         # ESLint check

# Docker
docker compose up              # Production mode (port 3060)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up  # Dev mode with hot-reload
```

## Architecture

### Tool Pattern

Each tool follows a consistent structure:
1. **Page Component** (`app/app/tools/<tool-name>/page.tsx`) - Client component with 'use client', handles UI and state
2. **Library Module** (`app/lib/<tool-name>.ts`) - Business logic, file processing, API calls
3. **Type Definitions** (`app/types/<tool-name>.ts`) - Interfaces, constants, error messages
4. **API Route** (`app/app/api/<endpoint>/route.ts`) - Server-side processing when needed (e.g., OpenAI calls)

Tools are registered in `app/lib/tools.ts` which exports the `tools` array displayed on the homepage.

### Shared Components

- `FileUploadZone` - Drag-and-drop file input with validation
- `ThemeToggle` - Dark/light mode toggle (uses `ThemeContext`)
- UI primitives in `app/components/ui/` (shadcn/ui: Button, Input, Select, etc.)

### Theme System

Theme state is managed via `ThemeContext` (`app/contexts/theme-context.tsx`):
- Persists to localStorage with key `pyramid-tools-theme`
- Supports 'light', 'dark', 'system' modes
- Root layout includes inline script to prevent flash on load
- Use `useTheme()` hook to access `{ theme, toggleTheme, setTheme }`

### API Routes

Server-side API routes handle operations requiring secrets or external APIs:
- `/api/extract-handwriting` - OpenAI GPT-4o for handwriting OCR
- `/api/convert-heic` - Server-side HEIC conversion
- `/api/resize-image` - Image resizing

Requires `OPENAI_API_KEY` in environment for handwriting OCR.

### PDF Processing

PDF handling uses pdfjs-dist for client-side operations:
- `app/lib/pdf-to-images.ts` - Convert PDF pages to images for OCR
- `app/lib/pdf-splitter.ts` - Extract pages from PDFs
- `app/lib/pdf-merger.ts` - Combine multiple PDFs

## Adding a New Tool

1. Create page at `app/app/tools/<tool-name>/page.tsx`
2. Add types to `app/types/<tool-name>.ts`
3. Add logic to `app/lib/<tool-name>.ts`
4. Register in `app/lib/tools.ts` with id, name, description, icon (Lucide), href, category
5. Add API route if server processing needed

## Environment Variables

Copy `app/.env.example` to `app/.env.local`:
```
OPENAI_API_KEY=...  # Required for Handwriting to Text tool
```
