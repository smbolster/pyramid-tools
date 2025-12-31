# Project Context

This file describes the project structure and relevant files for Claude Code commands.

## Project Type

next-app (Next.js 16 with React 19, TypeScript, Tailwind CSS 4)

## Overview

Pyramid Tools is a collection of browser-based utility tools for image and PDF manipulation, built as a Next.js application. Tools include:
- HEIC to JPEG converter
- Image resizer
- Image to SVG converter
- PDF merger/splitter
- QR code generator
- Color picker
- Screenshot annotator
- Handwriting to text OCR

## Relevant Files

Focus on the following files when implementing features:

- `CLAUDE.md` - Contains the project overview, architecture, and development instructions.

### Source Code

- `app/app/**/*.tsx` - Next.js pages and API routes
- `app/components/**/*.tsx` - React UI components
- `app/lib/**/*.ts` - Utility libraries and business logic
- `app/contexts/**/*.tsx` - React context providers

### Configuration

- `app/package.json` - Dependencies and scripts
- `app/next.config.ts` - Next.js configuration
- `app/tsconfig.json` - TypeScript configuration
- `app/eslint.config.mjs` - ESLint configuration
- `.env.example` - Environment variables template

### Docker/Deployment

- `Dockerfile` - Container build configuration
- `docker-compose.yml` - Production compose file
- `docker-compose.dev.yml` - Development compose file
- `push-image.ps1` - Image push script

### Azure DevOps Workflow Scripts

- `adws/*.py` - Python scripts for Azure DevOps automation

### Documentation

- `docs/` - Project documentation
- `specs/` - Feature specifications

## Feature-Specific Directories

### Tool Pages (app/app/tools/)
- `color-picker/` - Color picking and palette generation
- `handwriting-to-text/` - OCR for handwritten text
- `heic-to-jpeg/` - HEIC image conversion
- `image-resizer/` - Image resizing utilities
- `image-to-svg/` - Vector conversion
- `pdf-merger/` - PDF combining
- `pdf-splitter/` - PDF splitting
- `qr-code-generator/` - QR code creation
- `screenshot-annotator/` - Screenshot markup

### API Routes (app/app/api/)
- `convert-heic/` - HEIC conversion endpoint
- `extract-handwriting/` - OCR API using OpenAI
- `resize-image/` - Image resize endpoint

### Library Functions (app/lib/)
- `color-picker.ts` - Color utilities
- `handwriting-ocr.ts` - OCR integration
- `heic-converter.ts` - HEIC processing
- `image-resizer.ts` - Image manipulation
- `image-to-svg.ts` - SVG conversion
- `pdf-*.ts` - PDF manipulation utilities
- `qr-code-generator.ts` - QR generation
- `screenshot-annotator.ts` - Annotation logic

## Ignore Patterns

Ignore build artifacts in:
- `app/.next/` - Next.js build output
- `app/node_modules/` - Dependencies
- `.git/` - Git internals
