# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pyramid Tools is a collection of browser-based utility tools for image and PDF manipulation, built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Commands

```bash
# Development (from project root)
cd app && npm run dev         # Runs on port 3050

# Build and lint
cd app && npm run build
cd app && npm run lint

# Docker development (hot-reload enabled)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Docker production
docker compose up --build     # Runs on port 3060
```

## Architecture

### Directory Structure

The Next.js app lives in `app/` (not the project root). All npm commands must run from there.

```
app/
├── app/              # Next.js App Router pages and API routes
│   ├── api/          # Server-side API endpoints (Next.js route handlers)
│   └── tools/        # Tool pages (each tool is a directory with page.tsx)
├── components/       # React components (feature-specific + shadcn/ui)
├── lib/              # Business logic and utility functions
├── types/            # TypeScript type definitions per feature
└── contexts/         # React context providers (ThemeProvider)
```

### Tool Pattern

Each tool follows a consistent pattern:

1. **Page** (`app/tools/{tool-name}/page.tsx`) - Client component with "use client", handles UI state and orchestrates operations
2. **Library** (`lib/{tool-name}.ts`) - Core business logic, file processing, API calls
3. **Types** (`types/{tool-name}.ts`) - TypeScript interfaces, constants, error messages
4. **Components** - Reusable UI components in `components/`

Tools are registered in `lib/tools.ts` which provides the homepage tool grid.

### Client vs Server Processing

- **Client-side only**: PDF splitting/merging, image resizing, QR generation, color picker, SVG conversion
- **Server-side (API routes)**: HEIC conversion (`/api/convert-heic`), Handwriting OCR (`/api/extract-handwriting`)

Server-side tools require environment variables:
- `OPENAI_API_KEY` - Required for handwriting OCR (uses GPT-4o vision)

### UI Components

Uses shadcn/ui with "new-york" style. Components in `components/ui/` are from shadcn. Icon library is Lucide React.

Adding new shadcn components:
```bash
cd app && npx shadcn@latest add <component-name>
```

### File Upload Pattern

The `FileUploadZone` component is reused across tools with custom props for file validation, accepted types, and size limits. Each tool defines its own state types (e.g., `FileConversionState`, `FileOCRState`).

### Theme System

Dark/light theme via `ThemeProvider` context. Theme preference stored in localStorage as `pyramid-tools-theme`. A script in `layout.tsx` prevents flash by checking preference before React hydration.
