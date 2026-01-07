# Project Context

This file describes the project structure and relevant files for Claude Code commands.

## Project Type

Next.js TypeScript web application - A collection of browser-based utility tools.

## Relevant Files

Focus on the following files when implementing features:

- `CLAUDE.md` - Contains the project overview, architecture, and development instructions.

### Source Code

**Application Core:**
- `app/app/layout.tsx` - Root layout and global structure
- `app/app/page.tsx` - Home page with tool navigation
- `app/app/globals.css` - Global styles (Tailwind)

**Tool Pages:**
- `app/app/tools/*/page.tsx` - Individual tool page components:
  - `color-picker/` - Color picker and palette generator
  - `handwriting-to-text/` - OCR for handwritten text
  - `heic-to-jpeg/` - HEIC image converter
  - `image-resizer/` - Image resizing utility
  - `image-to-svg/` - Raster to vector conversion
  - `pdf-merger/` - PDF file merger
  - `pdf-splitter/` - PDF page extraction
  - `qr-code-generator/` - QR code creation
  - `screenshot-annotator/` - Screenshot markup tool

**API Routes:**
- `app/app/api/*/route.ts` - Next.js API endpoints for server-side processing

**Components:**
- `app/components/*.tsx` - Reusable UI components
- `app/components/ui/*.tsx` - shadcn/ui base components (Button, Input, etc.)

**Library/Utils:**
- `app/lib/*.ts` - Utility functions and tool-specific logic
- `app/lib/tools.ts` - Tool definitions and metadata
- `app/lib/utils.ts` - Shared utility functions

**Contexts:**
- `app/contexts/theme-context.tsx` - Theme (dark/light mode) provider

### Configuration
- `app/package.json` - Dependencies and npm scripts
- `app/next.config.ts` - Next.js configuration
- `app/tsconfig.json` - TypeScript configuration
- `app/.env.example` - Environment variable template

### Docker
- `Dockerfile` - Container build configuration
- `.dockerignore` - Docker build exclusions

### Legacy/ADO Scripts
- `adws/*.py` - Azure DevOps workflow scripts (legacy)

## Feature-Specific Directories

| Feature | Directory |
|---------|-----------|
| Tool pages | `app/app/tools/` |
| API routes | `app/app/api/` |
| UI components | `app/components/` |
| Business logic | `app/lib/` |
| State management | `app/contexts/` |

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix primitives)
- **Key Libraries:** pdf-lib, pdfjs-dist, OpenAI API, JSZip, QRCode

## Ignore Patterns

Ignore build artifacts and dependencies:
- `app/node_modules/`
- `app/.next/`
- `app/out/`
- `.env` (use `.env.example` as reference)
