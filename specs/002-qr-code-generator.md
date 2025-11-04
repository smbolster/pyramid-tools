# Feature: QR Code Generator

## Feature Description

Create a QR Code Generator tool that allows users to generate customizable QR codes from text, URLs, or other data. Users will be able to input any text content, preview the generated QR code in real-time, customize its appearance (size, error correction level, colors), and download the result as a high-quality PNG image. The tool will be client-side only, requiring no backend processing, and will provide a simple, intuitive interface following the existing design patterns of the Pyramid Tools application. This feature adds practical value for users who need to create QR codes for sharing URLs, contact information, Wi-Fi credentials, or other text-based data.

## User Story

As a user of Pyramid Tools
I want to generate customizable QR codes from text or URLs
So that I can easily create scannable codes for sharing information, links, or data without needing external services or software

## Problem Statement

Users frequently need to create QR codes for various purposes: sharing website URLs, contact information, Wi-Fi credentials, event details, or product information. While many online QR code generators exist, they often have limitations such as requiring account registration, adding watermarks, limiting customization options, tracking user data, or requiring internet connectivity. Users need a fast, private, and flexible QR code generation tool that works entirely in the browser, respects their privacy, and provides professional-quality output with customization options. The Pyramid Tools application currently lacks any tool for generating or working with QR codes, leaving a gap in its utility offering.

## Solution Statement

Implement a client-side QR Code Generator tool that:
- Accepts text input from the user (URLs, plain text, contact info, etc.)
- Generates QR codes in real-time as the user types using a reliable JavaScript library
- Provides instant visual preview of the generated QR code
- Offers customization options:
  - QR code size (small, medium, large, custom)
  - Error correction level (Low, Medium, Quartile, High)
  - Foreground and background colors with color pickers
  - Optional quiet zone (margin) configuration
- Allows users to download the QR code as a PNG image with appropriate filename
- Validates input and provides helpful error messages for invalid data
- Works entirely client-side with no server requests for maximum privacy
- Follows the established design patterns from existing tools (PDF Merger, HEIC Converter)
- Includes dark mode support consistent with the rest of the application
- Provides educational information about QR codes, error correction levels, and best practices

## Relevant Files

Use these files to implement the feature:

- **app/lib/tools.ts** (lines 1-40) - Tool registry where all tools are defined. Need to add new entry for the QR Code Generator with appropriate id, name, description, icon (QrCode from lucide-react), href (/tools/qr-code-generator), and category ("Utilities" or "Generators").

- **app/app/page.tsx** (lines 1-50) - Homepage that displays all tools as cards. Once the tool is registered in tools.ts, it will automatically appear on the homepage. No direct changes needed here, but useful for understanding how tools are displayed.

- **app/app/layout.tsx** (lines 1-35) - Root layout with theme provider. No changes needed, but relevant for understanding the app structure and that dark mode support is available.

- **app/components/ui/button.tsx** (lines 1-60) - Reusable button component with variants (default, outline, ghost, destructive) and sizes. Will be used for download button, generate button, reset button, etc.

- **app/components/theme-toggle.tsx** - Theme toggle button component that should be included in the QR code generator page header for consistency with other tool pages.

- **app/lib/utils.ts** - Utility functions including the cn() helper for merging Tailwind classes. Will be used throughout the component for conditional styling.

- **app/lib/zip-utils.ts** (lines 1-40) - Contains downloadBlob() utility function that will be used to trigger the download of the generated QR code PNG file.

### New Files

- **app/app/tools/qr-code-generator/page.tsx** - Main tool page component. This is a client-side component ("use client") that includes:
  - Text input area for QR code data (textarea for multi-line support)
  - Real-time QR code preview canvas/SVG display
  - Customization controls (size, error correction, colors)
  - Download button to save QR code as PNG
  - Reset button to clear form
  - Validation and error handling
  - Info section explaining QR code features and best practices
  - Consistent header with back link and theme toggle
  - Responsive layout for mobile/tablet/desktop

- **app/types/qr-code-generator.ts** - TypeScript type definitions including:
  - QRCodeConfig interface (data, size, errorCorrectionLevel, foregroundColor, backgroundColor, quietZone)
  - ErrorCorrectionLevel enum or type ('L' | 'M' | 'Q' | 'H')
  - QRCodeSize type definition (number in pixels or preset sizes)
  - ValidationError type
  - Constants: MAX_TEXT_LENGTH, DEFAULT_SIZE, DEFAULT_ERROR_CORRECTION, DEFAULT_FG_COLOR, DEFAULT_BG_COLOR, ERROR_MESSAGES
  - QRGeneratorState interface (input text, config, preview state, error state)

- **app/lib/qr-code-generator.ts** - Core business logic for QR code generation including:
  - generateQRCode() function that uses a QR code library to create the QR code
  - validateQRInput() function to check if input is valid (not empty, not too long, valid characters)
  - exportQRCodeToPNG() function to convert canvas/SVG to PNG blob
  - getQRCodeSize() helper to map size presets to pixel dimensions
  - Color validation helper to ensure valid hex colors
  - Error correction level descriptions
  - QR code capacity calculations based on error correction level

- **app/components/qr-code-preview.tsx** - Reusable component for displaying the QR code preview:
  - Accepts QR code data and configuration as props
  - Renders the QR code using canvas or SVG
  - Shows loading state while generating
  - Handles errors gracefully
  - Responsive sizing
  - Clean, bordered container with appropriate styling

- **app/components/qr-code-config-panel.tsx** (Optional) - Reusable component for QR code customization options:
  - Size selector (radio buttons or dropdown)
  - Error correction level selector with descriptions
  - Color pickers for foreground and background
  - Quiet zone toggle
  - Preview of current settings
  - Organized in collapsible sections or tabs

## Implementation Plan

### Phase 1: Foundation

1. Research and select appropriate QR code generation library (qrcode or qr-code-styling recommended for browser compatibility and customization options)
2. Install the chosen library and its TypeScript types using `uv add`
3. Create TypeScript type definitions for QR code configuration, state management, and validation
4. Define constants for default values, size presets, error correction levels, and validation rules
5. Create error messages for various validation scenarios
6. Set up the basic file structure for the new tool

### Phase 2: Core Implementation

1. Implement core QR code generation logic in lib/qr-code-generator.ts
2. Create validation functions for user input (text length, character encoding, color formats)
3. Implement QR code export functionality to generate PNG blob
4. Create the QR code preview component with loading and error states
5. Build the main tool page component with form inputs and state management
6. Implement real-time QR code generation as user types (with debouncing for performance)
7. Add customization controls (size, error correction, colors)
8. Implement download functionality using the downloadBlob utility
9. Add reset/clear functionality
10. Style the page following existing tool patterns with proper spacing, typography, and colors

### Phase 3: Integration

1. Register the tool in lib/tools.ts so it appears on the homepage
2. Add comprehensive error handling and validation with user-friendly messages
3. Test QR code generation with various input types (URLs, text, special characters, emojis)
4. Verify downloaded PNG files are high quality and properly formatted
5. Test all customization options (sizes, colors, error correction levels)
6. Ensure dark mode compatibility for all UI elements
7. Test responsive layout on mobile, tablet, and desktop
8. Validate accessibility (keyboard navigation, screen readers, focus indicators)
9. Add informational content about QR codes, error correction, and best practices
10. Performance testing (generation speed, debouncing, memory usage)

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Research and Select QR Code Library

- Research available QR code generation libraries compatible with Next.js and browser environments
- Consider options: `qrcode` (lightweight, simple), `qr-code-styling` (advanced customization), `qrcode-generator` (small footprint)
- Evaluate based on: browser compatibility, TypeScript support, customization options, bundle size, maintenance status
- Choose `qrcode` library for its reliability, simplicity, TypeScript support, and good customization balance
- Document the choice and rationale

### 2. Install QR Code Library and Dependencies

- Run `cd app && uv add qrcode` to install the qrcode library
- Run `cd app && uv add -D @types/qrcode` to install TypeScript type definitions
- Verify installation by checking package.json
- Test import in a temporary file to ensure it works with Next.js

### 3. Create Type Definitions File

- Create `app/types/qr-code-generator.ts`
- Define `ErrorCorrectionLevel` type: 'L' | 'M' | 'Q' | 'H'
  - L (Low): 7% error recovery
  - M (Medium): 15% error recovery
  - Q (Quartile): 25% error recovery
  - H (High): 30% error recovery
- Define `QRCodeSize` type for preset sizes: 'small' | 'medium' | 'large' | 'xlarge'
- Define `QRCodeConfig` interface with properties:
  - data: string (the text/URL to encode)
  - size: number (pixel dimensions)
  - errorCorrectionLevel: ErrorCorrectionLevel
  - foregroundColor: string (hex color)
  - backgroundColor: string (hex color)
  - margin: number (quiet zone size)
- Define `QRGeneratorState` interface:
  - inputText: string
  - config: QRCodeConfig
  - qrCodeDataUrl: string | null
  - isGenerating: boolean
  - error: string | null
- Define constants:
  - MAX_TEXT_LENGTH = 2000
  - SIZE_PRESETS: Record<QRCodeSize, number> = { small: 200, medium: 300, large: 400, xlarge: 600 }
  - DEFAULT_SIZE: QRCodeSize = 'medium'
  - DEFAULT_ERROR_CORRECTION: ErrorCorrectionLevel = 'M'
  - DEFAULT_FG_COLOR = '#000000'
  - DEFAULT_BG_COLOR = '#ffffff'
  - DEFAULT_MARGIN = 4
  - ERROR_MESSAGES with various error scenarios
- Export all types and constants

### 4. Create QR Code Generation Utility

- Create `app/lib/qr-code-generator.ts`
- Import QRCode library from 'qrcode'
- Import types from types/qr-code-generator.ts
- Implement `validateQRInput(text: string): Error | null` function:
  - Check if text is empty (return error)
  - Check if text exceeds MAX_TEXT_LENGTH (return error with current length)
  - Check for any unsupported characters if necessary
  - Return null if valid
- Implement `generateQRCode(config: QRCodeConfig): Promise<string>` function:
  - Validate input using validateQRInput
  - Configure QR code options (error correction level, margin, color, width)
  - Call QRCode.toDataURL() with config
  - Return data URL string for preview/download
  - Handle errors and throw meaningful error messages
- Implement `exportQRCodeToPNG(dataUrl: string, filename: string): Blob` function:
  - Convert data URL to blob
  - Return blob for download
- Implement `getSizeInPixels(size: QRCodeSize): number` helper:
  - Map size preset to pixel dimensions using SIZE_PRESETS
- Implement `validateHexColor(color: string): boolean` helper:
  - Check if color is valid hex format (#RGB or #RRGGBB)
- Add JSDoc comments explaining each function
- Export all functions

### 5. Create QR Code Preview Component

- Create `app/components/qr-code-preview.tsx`
- Make it a client component ("use client")
- Define props interface: QRCodePreviewProps with dataUrl, isGenerating, error
- Import Loader2 from lucide-react
- Implement component that:
  - Shows a bordered container with aspect-ratio-square
  - Displays loading spinner with "Generating QR code..." when isGenerating is true
  - Shows error message in red/destructive color when error exists
  - Displays the QR code image when dataUrl is provided
  - Shows placeholder message "Enter text to generate QR code" when empty
  - Uses proper dark mode compatible colors
  - Is responsive and maintains aspect ratio
- Style with Tailwind classes matching existing design patterns
- Export component

### 6. Create QR Code Configuration Panel Component (Optional)

- Create `app/components/qr-code-config-panel.tsx`
- Make it a client component ("use client")
- Define props interface: QRCodeConfigPanelProps with config, onConfigChange callback
- Implement section for size selection:
  - Radio buttons or select dropdown for small, medium, large, xlarge
  - Display pixel dimensions for each size
- Implement section for error correction level:
  - Radio buttons for L, M, Q, H with descriptions
  - Explain what each level means
- Implement color pickers:
  - Input type="color" for foreground color
  - Input type="color" for background color
  - Show hex value next to each picker
  - Validate color contrast (warn if too similar)
- Implement margin/quiet zone control:
  - Number input or slider for margin size (0-10)
  - Explain what quiet zone is
- Style consistently with other form controls in the app
- Export component

### 7. Create Main QR Code Generator Page

- Create `app/app/tools/qr-code-generator/page.tsx`
- Add "use client" directive at the top
- Import necessary dependencies:
  - React hooks: useState, useCallback, useEffect
  - Next.js Link component
  - Icons: ArrowLeft, Download, QrCode, RefreshCw from lucide-react
  - Button component
  - ThemeToggle component
  - QRCodePreview component (and optionally QRCodeConfigPanel)
  - Types and utilities from lib/qr-code-generator
- Initialize state using useState:
  - inputText: string = ''
  - sizePreset: QRCodeSize = 'medium'
  - errorCorrection: ErrorCorrectionLevel = 'M'
  - foregroundColor: string = '#000000'
  - backgroundColor: string = '#ffffff'
  - margin: number = 4
  - qrCodeDataUrl: string | null = null
  - isGenerating: boolean = false
  - error: string | null = null
- Implement generateQRCodeHandler using useCallback:
  - Validate input using validateQRInput
  - Set isGenerating to true
  - Get pixel size from sizePreset
  - Call generateQRCode with current config
  - Set qrCodeDataUrl with result
  - Handle errors and set error state
  - Set isGenerating to false
- Implement debounced QR code generation:
  - Use useEffect to watch inputText and config changes
  - Add 300ms debounce to avoid generating on every keystroke
  - Auto-generate when input changes (if valid)
- Implement handleDownload function:
  - Validate that qrCodeDataUrl exists
  - Create filename with timestamp: `qr-code-${Date.now()}.png`
  - Convert data URL to blob
  - Call downloadBlob utility
- Implement handleReset function:
  - Clear inputText
  - Reset all config to defaults
  - Clear qrCodeDataUrl and error
- Create JSX structure following the standard tool page template:
  - Fixed theme toggle in top-right corner
  - Container with gradient background
  - Header section with back link and title
  - Two-column layout (or single column on mobile):
    - Left column: Input and configuration
    - Right column: QR code preview
  - Info section at the bottom explaining features
- Style with Tailwind classes matching existing tools
- Export default component

### 8. Add Input and Configuration Controls to Page

- Add textarea for input text:
  - Placeholder: "Enter URL or text to generate QR code"
  - maxLength={MAX_TEXT_LENGTH}
  - rows={4}
  - Auto-resize or scrollable
  - Show character count: {inputText.length} / {MAX_TEXT_LENGTH}
  - Style with proper border, padding, focus ring
  - Dark mode compatible
- Add size preset selector:
  - Label: "Size"
  - Radio buttons or select for small, medium, large, xlarge
  - Show pixel dimensions for selected size
- Add error correction selector:
  - Label: "Error Correction Level"
  - Radio buttons for L, M, Q, H
  - Show description for each level
  - Default to M (medium)
- Add color pickers:
  - Foreground color picker with label and hex input
  - Background color picker with label and hex input
  - Warn if colors are too similar (low contrast)
- Add margin control (optional advanced option):
  - Number input for margin size (0-10)
  - Default to 4
  - Label with explanation
- Group controls logically in sections
- Use consistent spacing and alignment
- Add labels and descriptions for all controls

### 9. Add Preview and Download Functionality

- Place QRCodePreview component in the right column
- Pass dataUrl, isGenerating, and error as props
- Add download button below preview:
  - Label: "Download QR Code"
  - Icon: Download
  - Disabled when no QR code generated or isGenerating
  - variant="default" with prominent styling
  - onClick calls handleDownload
- Add reset button:
  - Label: "Reset" or "Clear"
  - Icon: RefreshCw
  - variant="outline"
  - onClick calls handleReset
- Add copy functionality (optional enhancement):
  - Button to copy QR code data URL to clipboard
  - Show success toast/message on copy
- Ensure buttons are properly sized and aligned
- Add loading state to download button if needed

### 10. Add Error Handling and Validation

- Display validation errors prominently:
  - Use alert-style div with red/destructive border
  - Show specific error message from error state
  - Position near the input field or at top of form
- Add inline validation feedback:
  - Show red border on textarea when invalid
  - Show character count in red when exceeding limit
  - Show warning icon when error exists
- Handle generation errors gracefully:
  - Catch errors from generateQRCode
  - Display user-friendly error messages
  - Log technical errors to console for debugging
- Add color contrast validation:
  - Warn if foreground and background colors are too similar
  - Show warning message without blocking generation
- Ensure all error states are cleared when user corrects input

### 11. Add Informational Section

- Create "About This Tool" section at the bottom of the page
- Style as a card with rounded border and padding (matching other tools)
- Include information about:
  - What QR codes are and common use cases
  - How to scan QR codes (smartphone camera)
  - Error correction levels explained
    - L: Use for clean displays, 7% recovery
    - M: General purpose, 15% recovery
    - Q: Printed materials, 25% recovery
    - H: Small codes or critical data, 30% recovery
  - Size recommendations:
    - Small (200px): Digital use only
    - Medium (300px): General purpose
    - Large (400px): Print or distant scanning
    - XLarge (600px): Large print or posters
  - Best practices:
    - Keep URLs short for better scannability
    - Ensure sufficient contrast between colors
    - Test generated codes before printing
    - Leave adequate quiet zone (margin) around code
  - Privacy note: "All processing happens in your browser. No data is sent to any server."
- Use proper typography and spacing
- Add icons if appropriate for visual interest

### 12. Style and Polish the Page

- Ensure consistent spacing using Tailwind spacing utilities
- Apply proper typography hierarchy (text sizes, weights)
- Add subtle shadows and borders to sections
- Ensure all interactive elements have hover and focus states
- Verify dark mode styles for all elements:
  - Text colors
  - Backgrounds
  - Borders
  - Input fields
  - Buttons
- Make layout responsive:
  - Single column on mobile
  - Two columns on tablet and desktop
  - Stack preview below inputs on small screens
- Add smooth transitions for interactive elements
- Ensure proper contrast ratios for accessibility
- Test all spacing and alignment

### 13. Register Tool in Tools Registry

- Open `app/lib/tools.ts`
- Add new entry to the tools array:
  ```typescript
  {
    id: "qr-code-generator",
    name: "QR Code Generator",
    description: "Create customizable QR codes from text or URLs",
    icon: "QrCode",
    href: "/tools/qr-code-generator",
    category: "Generators",
  }
  ```
- Ensure icon "QrCode" is available in lucide-react
- Verify the category makes sense or use "Utilities"
- Save the file

### 14. Test QR Code Generation with Various Inputs

- Test with simple text: "Hello World"
- Test with URLs: "https://example.com"
- Test with long URLs and URL parameters
- Test with special characters: !@#$%^&*()
- Test with emojis: "Hello 😀🎉"
- Test with multi-line text (line breaks)
- Test with empty input (should show error)
- Test with maximum length text (2000 characters)
- Test with text exceeding maximum length (should show error)
- Test with different languages (Unicode characters)
- Verify all generated QR codes are scannable using a smartphone

### 15. Test QR Code Customization Options

- Test all size presets (small, medium, large, xlarge):
  - Verify pixel dimensions match SIZE_PRESETS
  - Verify downloaded images have correct dimensions
- Test all error correction levels (L, M, Q, H):
  - Generate QR code with each level
  - Verify codes are scannable
  - Note: Visual difference may not be obvious
- Test color customization:
  - Change foreground color (try red, blue, green)
  - Change background color (try light colors)
  - Verify colors appear correctly in preview and download
  - Test dark foreground on light background
  - Test light foreground on dark background (should warn about contrast)
- Test margin settings:
  - Set margin to 0 (no quiet zone)
  - Set margin to 10 (large quiet zone)
  - Verify margin appears in preview and download
- Verify all customizations persist during regeneration

### 16. Test Download Functionality

- Generate a QR code and click Download button
- Verify file downloads with correct filename format: `qr-code-{timestamp}.png`
- Open downloaded PNG in image viewer
- Verify image quality is high (not pixelated or blurry)
- Verify image dimensions match selected size
- Verify colors match selected colors
- Scan downloaded QR code with smartphone to verify it works
- Test download in different browsers (Chrome, Firefox, Safari, Edge)
- Verify download works on mobile devices

### 17. Test Real-Time Generation and Debouncing

- Start typing in the input field
- Verify QR code does NOT regenerate on every keystroke (debouncing working)
- Stop typing and wait 300ms
- Verify QR code generates automatically after debounce delay
- Verify loading spinner shows during generation
- Change configuration options (size, color, error correction)
- Verify QR code regenerates automatically with new settings
- Verify no performance issues with rapid typing or config changes

### 18. Test Reset Functionality

- Enter text and generate a QR code
- Customize size, colors, and error correction
- Click Reset/Clear button
- Verify inputText is cleared
- Verify all configuration options reset to defaults
- Verify QR code preview clears
- Verify error messages clear
- Test reset button is always accessible (not disabled)

### 19. Test Error Handling and Edge Cases

- Test empty input:
  - Leave input blank and try to generate
  - Verify appropriate error message shows
- Test exceeding character limit:
  - Paste more than 2000 characters
  - Verify error message about length limit
  - Verify character counter shows in red
- Test invalid color formats (if manual input allowed):
  - Enter invalid hex codes
  - Verify validation or fallback to default
- Test color contrast issues:
  - Set foreground and background to similar colors (e.g., both light gray)
  - Verify warning message about low contrast
  - Ensure generation still works (just warning, not blocking)
- Test rapid clicking:
  - Click download button multiple times rapidly
  - Verify no errors or duplicate downloads
- Test browser compatibility:
  - Test in Chrome, Firefox, Safari, Edge
  - Verify QR code generation and download work in all browsers

### 20. Test Dark Mode Compatibility

- Enable dark mode using theme toggle
- Verify all UI elements are visible and styled correctly:
  - Page background gradient
  - Section backgrounds and borders
  - Text colors (headings, labels, descriptions)
  - Input fields (textarea, color pickers, radio buttons)
  - Buttons (download, reset)
  - QR code preview container
  - Info section
- Verify proper contrast in dark mode
- Test QR code colors:
  - Default black on white should still work
  - Test white on black (inverted)
  - Ensure preview is visible against dark background
- Switch between light and dark mode multiple times
- Verify no layout shifts or visual glitches

### 21. Test Responsive Layout

- Test on mobile viewport (375px width):
  - Verify single column layout
  - Verify all controls are accessible
  - Verify text is readable
  - Verify buttons are tappable (not too small)
  - Verify QR code preview fits on screen
- Test on tablet viewport (768px width):
  - Verify two-column or transitional layout
  - Verify proper spacing and alignment
- Test on desktop viewport (1920px width):
  - Verify two-column layout with good use of space
  - Verify content is not stretched too wide (max-width container)
- Test landscape orientation on mobile
- Test zooming in/out
- Verify no horizontal scrolling at any viewport size

### 22. Test Accessibility

- Keyboard navigation:
  - Tab through all interactive elements (textarea, buttons, color pickers, radio buttons)
  - Verify visible focus indicators on all elements
  - Verify logical tab order (top to bottom, left to right)
  - Press Enter or Space on buttons to activate
  - Verify no keyboard traps
- Screen reader testing:
  - Use screen reader to navigate the page
  - Verify all labels are announced correctly
  - Verify error messages are announced
  - Verify button purposes are clear
  - Check that color pickers have labels
  - Verify form controls have associated labels
- Color contrast:
  - Use browser tools to check contrast ratios
  - Verify all text meets WCAG AA standards (4.5:1 for normal text)
  - Verify button text is readable
- Focus indicators:
  - Verify focus rings are visible and clear
  - Verify focus rings work in both light and dark modes
- Ensure alt text or aria-labels where needed

### 23. Test Performance

- Generate QR codes with various input lengths:
  - Short text (10 characters)
  - Medium text (500 characters)
  - Long text (2000 characters)
- Measure generation time (should be under 1 second)
- Verify no lag or freezing during generation
- Test memory usage:
  - Generate multiple QR codes in sequence
  - Verify no memory leaks (check browser DevTools)
- Test debounce performance:
  - Type rapidly in input field
  - Verify no excessive re-renders or generations
- Verify smooth scrolling and interactions
- Test on slower devices or throttled CPU in DevTools

### 24. Test the Tool on Homepage

- Navigate to the homepage (/)
- Verify "QR Code Generator" tool card appears
- Verify the card has correct:
  - Title: "QR Code Generator"
  - Description: "Create customizable QR codes from text or URLs"
  - Icon: QrCode icon
  - Category badge: "Generators" or "Utilities"
- Verify card hover effects work
- Click on the card
- Verify it navigates to /tools/qr-code-generator
- Verify page loads correctly

### 25. End-to-End Testing

- Start from homepage
- Click QR Code Generator card
- Enter a URL: "https://github.com"
- Verify QR code generates automatically
- Change size to Large
- Verify QR code regenerates with larger size
- Change error correction to High
- Verify QR code regenerates
- Change foreground color to blue (#0000FF)
- Verify QR code preview shows blue
- Click Download button
- Verify PNG file downloads
- Scan downloaded QR code with smartphone
- Verify it opens the correct URL (https://github.com)
- Click Reset button
- Verify form clears
- Navigate back to homepage using back link
- Verify homepage still works
- Switch to dark mode
- Navigate back to QR Code Generator
- Verify dark mode works on the tool page

### 26. Code Quality and Cleanup

- Review all new code for:
  - Proper TypeScript types (no any types)
  - Consistent formatting and indentation
  - Meaningful variable and function names
  - JSDoc comments on utility functions
  - No console.log statements (except intentional errors)
  - No unused imports or variables
  - No commented-out code
- Verify all files follow existing project conventions:
  - Import order (React, Next.js, third-party, local)
  - Component structure
  - File naming conventions
- Ensure proper error handling in all async functions
- Verify no ESLint warnings or errors
- Check that all dependencies are properly installed
- Ensure TypeScript compilation has no errors

### 27. Documentation and Comments

- Add comments to complex logic in qr-code-generator.ts
- Document props interfaces with JSDoc comments
- Add inline comments explaining non-obvious code
- Ensure error messages are clear and actionable
- Verify informational section on the page is accurate and helpful
- Check that all constants have descriptive names
- Ensure type definitions are clear and well-organized

### 28. Run Validation Commands

Execute validation commands to ensure the feature works correctly with zero regressions.

- Run `cd app && npm run lint` - Verify no linting errors
- Run `cd app && npm run build` - Verify successful build with no errors
- Run `cd app && npm run dev` - Start dev server and perform final manual testing:
  - Navigate to http://localhost:3000
  - Verify QR Code Generator appears on homepage
  - Click tool and test all functionality
  - Test in both light and dark modes
  - Test on multiple browsers
  - Test responsive design
  - Verify no console errors
  - Scan generated QR codes with smartphone

## Testing Strategy

### Unit Tests

Due to the client-side nature of this application and the current absence of a testing framework, formal unit tests are not included. However, if a testing framework is added in the future, consider testing:

- **validateQRInput()**: Test with empty string, valid text, text exceeding max length, special characters
- **generateQRCode()**: Test QR code generation with various configurations (sizes, error levels, colors)
- **validateHexColor()**: Test with valid hex colors (#RGB, #RRGGBB), invalid formats
- **getSizeInPixels()**: Test mapping of size presets to pixel values
- **exportQRCodeToPNG()**: Test conversion of data URL to blob
- **Debounce logic**: Verify generation doesn't happen on every keystroke
- **State management**: Verify state updates correctly for all configuration changes

### Integration Tests

Manual integration tests to perform:

- **Form to preview integration**: Verify changes in input or config immediately update preview
- **Preview to download integration**: Verify downloaded image matches preview
- **Reset integration**: Verify reset button clears all form fields and preview
- **Color picker integration**: Verify color changes apply to QR code generation
- **Size and error correction integration**: Verify config changes regenerate QR code
- **Navigation integration**: Verify tool is accessible from homepage and back link works
- **Theme integration**: Verify dark mode toggle affects QR code generator page
- **Scanning integration**: Verify generated QR codes are scannable by real devices

### Edge Cases

- **Empty input**: Should show error, not generate QR code
- **Maximum length input**: Should generate successfully at exactly 2000 characters
- **Exceeding maximum length**: Should show error and prevent generation
- **Very short input**: Single character should generate valid QR code
- **Special characters**: Symbols, punctuation, emojis should be encoded correctly
- **Invalid colors**: If manual color input allowed, should fallback to defaults
- **Similar colors**: Low contrast should show warning but still generate
- **Rapid input changes**: Debounce should prevent excessive generations
- **Rapid button clicks**: Multiple download clicks should not cause errors
- **Network offline**: Should still work (client-side only)
- **Browser without canvas support**: Should degrade gracefully (rare case)
- **No localStorage**: Should still work without persistence (if persistence added later)
- **Very large sizes**: Verify large QR codes (600px+) generate correctly
- **Zero margin**: QR code with no quiet zone should still be scannable
- **Tab switching**: Verify generation continues if user switches tabs
- **Page refresh**: Verify state resets appropriately

## Acceptance Criteria

1. **Tool Visibility**:
   - QR Code Generator tool appears on the homepage with correct title, description, and icon
   - Tool is accessible via /tools/qr-code-generator route
   - Tool card follows the same design pattern as other tools

2. **Input Functionality**:
   - Text input accepts any text up to 2000 characters
   - Character counter displays current length vs maximum
   - Input supports multi-line text
   - Input is validated in real-time

3. **QR Code Generation**:
   - QR code generates automatically as user types (with debounce)
   - QR code updates when configuration changes (size, error correction, colors)
   - Generation happens in under 1 second for typical inputs
   - Loading indicator shows during generation
   - Generated QR codes are scannable by smartphone cameras

4. **Customization Options**:
   - Size presets available: Small (200px), Medium (300px), Large (400px), XLarge (600px)
   - Error correction levels available: L (7%), M (15%), Q (25%), H (30%)
   - Foreground color can be customized with color picker
   - Background color can be customized with color picker
   - Margin/quiet zone is configurable (optional advanced feature)
   - All customization changes immediately update the preview

5. **Preview Display**:
   - QR code preview displays in real-time
   - Preview shows loading state during generation
   - Preview is responsive and maintains aspect ratio
   - Preview is clearly visible in both light and dark modes
   - Preview container has clear borders and appropriate styling

6. **Download Functionality**:
   - Download button triggers PNG download of generated QR code
   - Downloaded file has descriptive filename with timestamp
   - Downloaded image matches the preview (size, colors, content)
   - Downloaded image is high quality (not pixelated)
   - Downloaded QR code is scannable on physical devices

7. **Validation and Error Handling**:
   - Empty input shows clear error message
   - Text exceeding 2000 characters shows length limit error
   - Low contrast colors show warning message
   - All errors are displayed prominently and clearly
   - Errors clear when user corrects the input
   - Generation errors are handled gracefully with user-friendly messages

8. **Reset Functionality**:
   - Reset button clears all input and configuration
   - Reset returns all settings to default values
   - Reset clears the preview and any error messages
   - Reset button is always accessible

9. **User Interface**:
   - Page follows the standard tool template (header with back link, theme toggle)
   - Layout is responsive (single column on mobile, two columns on desktop)
   - All interactive elements have hover and focus states
   - Typography and spacing are consistent with other tools
   - Informational section explains QR codes, error correction, and best practices

10. **Dark Mode Support**:
    - All UI elements are visible and properly styled in dark mode
    - Text, borders, backgrounds adapt correctly to dark theme
    - Theme toggle is present and functional on the tool page
    - QR code preview is visible against dark background
    - No contrast or readability issues in dark mode

11. **Accessibility**:
    - All form controls are keyboard accessible
    - Tab order is logical and intuitive
    - Focus indicators are visible on all interactive elements
    - All inputs have associated labels
    - Error messages are announced to screen readers
    - Color contrast meets WCAG AA standards in both themes
    - Buttons have clear aria-labels or text labels

12. **Performance**:
    - QR code generation is fast (under 1 second)
    - Debouncing prevents excessive regeneration during typing
    - No memory leaks with repeated generations
    - Page loads quickly
    - Smooth interactions with no lag

13. **Browser Compatibility**:
    - Works correctly in Chrome, Firefox, Safari, and Edge
    - Download functionality works in all supported browsers
    - Color pickers are functional in all browsers
    - No console errors in any browser

14. **Privacy**:
    - All processing happens client-side
    - No data is sent to any server
    - Privacy note is clearly stated on the page

15. **Code Quality**:
    - TypeScript types are properly defined for all components and functions
    - No ESLint errors or warnings
    - Build completes successfully with no errors
    - Code follows existing project conventions and patterns
    - All files are properly organized

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `cd app && npm run lint` - Run linting to validate code quality. Must complete with zero errors and zero warnings.

- `cd app && npm run build` - Build the Next.js app to validate there are no TypeScript errors, type checking issues, or build failures. Must complete successfully with exit code 0.

- `cd app && npm run dev` - Start the development server and manually test the QR Code Generator feature:
  - Navigate to http://localhost:3000
  - Verify "QR Code Generator" tool card appears on homepage with correct icon and description
  - Click on the QR Code Generator card
  - Verify page loads at /tools/qr-code-generator
  - Verify theme toggle appears in top-right corner
  - Verify back link navigates to homepage
  - Enter text in input field: "https://example.com"
  - Verify QR code generates automatically within 1 second
  - Verify QR code preview displays correctly
  - Change size to "Large" and verify QR code regenerates with larger size
  - Change error correction to "High" and verify regeneration
  - Change foreground color to red (#FF0000) and verify color appears in preview
  - Change background color to light yellow (#FFFFDD) and verify preview updates
  - Click "Download" button and verify PNG file downloads
  - Open downloaded PNG and verify it matches the preview
  - Scan downloaded QR code with smartphone and verify it opens https://example.com
  - Click "Reset" button and verify all fields clear
  - Test with empty input and verify error message appears
  - Test with maximum length text (paste 2000+ characters) and verify character limit error
  - Test with emoji text: "Hello 👋 World 🌍" and verify QR code generates and scans correctly
  - Toggle dark mode and verify all UI elements are visible and styled correctly
  - Verify QR code preview is visible in dark mode
  - Navigate back to light mode and verify no issues
  - Test responsive layout by resizing browser window to mobile width (375px)
  - Verify single column layout on mobile
  - Test keyboard navigation: Tab through all controls, Enter to activate buttons
  - Verify focus indicators are visible
  - Check browser console for any errors or warnings (should be none)
  - Test in at least two different browsers (e.g., Chrome and Firefox)
  - Navigate back to homepage using back link
  - Verify homepage still displays correctly
  - Verify no regressions to existing tools (PDF Merger, HEIC Converter)

## Notes

### Library Selection: qrcode vs. Alternatives

The `qrcode` library is recommended for this implementation because:
- **Mature and stable**: Well-maintained with 5M+ weekly downloads on npm
- **TypeScript support**: Official type definitions available via @types/qrcode
- **Browser compatible**: Works in all modern browsers without issues
- **Flexible API**: Supports canvas, data URL, and buffer outputs
- **Customizable**: Supports error correction, colors, margin, and size
- **Small bundle size**: Approximately 50-60 KB minified
- **MIT licensed**: Permissive license suitable for all use cases
- **No dependencies**: Minimal dependency tree reduces bundle size and security risks

Alternative libraries considered but not chosen:
- **qr-code-styling**: More customization (logos, rounded corners) but larger bundle size and more complex API
- **qrcode-generator**: Smaller size but less customization and older API
- **node-qrcode**: Server-side focused, not optimized for browsers

### QR Code Best Practices

Information to include on the page for user education:

**Error Correction Levels**:
- **L (Low - 7%)**: Use for digital displays where code will always be clean. Generates smaller codes.
- **M (Medium - 15%)**: General purpose default. Good balance of size and reliability.
- **Q (Quartile - 25%)**: Recommended for printed materials that may get slightly damaged.
- **H (High - 30%)**: Use for critical data or codes that will be printed small. Largest code size.

**Size Recommendations**:
- **Digital use only**: Small (200px) or Medium (300px)
- **Print at actual size**: Large (400px) minimum
- **Distant scanning**: XLarge (600px) or larger
- **Rule of thumb**: Minimum scanning distance is ~10x the QR code width

**Color Best Practices**:
- High contrast is essential (dark on light is standard)
- Avoid light colors on light backgrounds
- Black on white is most reliable
- Colored QR codes work but test thoroughly
- Never use similar foreground and background colors

**Content Tips**:
- Shorter content = smaller, more scannable QR codes
- Use URL shorteners for long links
- Test scannability before mass printing
- Always include quiet zone (white margin) around code

**Privacy Note**:
- All processing happens locally in the browser
- No data is sent to any server
- Generated QR codes are not stored or tracked
- Safe to use with sensitive URLs or data

### Future Enhancements

Potential features for future iterations:
- **QR code logo/image overlay**: Add small logo in center using qr-code-styling library
- **Batch generation**: Generate multiple QR codes from a list of URLs
- **vCard generation**: Form to create QR codes for contact information
- **Wi-Fi QR codes**: Generate QR codes for Wi-Fi network credentials
- **Save presets**: Allow users to save favorite size/color configurations
- **QR code scanner**: Add ability to scan and decode QR codes from uploaded images
- **Export formats**: Add SVG export option for scalable vector graphics
- **History**: Keep recent generated QR codes for quick re-download
- **Custom shapes**: Rounded corners, circular QR codes
- **Analytics**: Track how many times each generated QR code is scanned (would require backend)

### Technical Implementation Notes

**Real-time Generation with Debouncing**:
Implementing debounce is critical for performance:
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (inputText.trim()) {
      generateQRCodeHandler();
    }
  }, 300);

  return () => clearTimeout(timer);
}, [inputText, config]);
```

**Memory Management**:
QR code generation creates data URLs which can consume memory. Clean up properly:
```typescript
useEffect(() => {
  return () => {
    // Clean up old data URLs if stored as object URLs
    if (qrCodeDataUrl && qrCodeDataUrl.startsWith('blob:')) {
      URL.revokeObjectURL(qrCodeDataUrl);
    }
  };
}, [qrCodeDataUrl]);
```

**Color Contrast Validation**:
Simple contrast check to warn users:
```typescript
function hasLowContrast(fg: string, bg: string): boolean {
  // Convert hex to RGB and calculate relative luminance
  // Return true if contrast ratio < 3:1
  // This is a simplified check; full WCAG calculation is more complex
}
```

**Download Implementation**:
Using the existing utility:
```typescript
import { downloadBlob } from '@/lib/zip-utils';

const handleDownload = async () => {
  const blob = await fetch(qrCodeDataUrl).then(r => r.blob());
  const filename = `qr-code-${Date.now()}.png`;
  downloadBlob(blob, filename);
};
```

### Testing Notes

**Scanning Test URLs**:
Use these URLs for testing to verify scanability:
- Short URL: `https://google.com`
- Long URL: `https://example.com/very/long/path/with/many/segments/and/query?param1=value1&param2=value2`
- URL with special chars: `https://example.com/search?q=hello+world&lang=en`

**Smartphone Scanner Apps**:
Most modern smartphones (iOS 11+, Android 8+) can scan QR codes with the built-in camera app. No third-party app needed for testing.

**Color Combinations to Test**:
- Standard: Black (#000000) on White (#FFFFFF)
- High visibility: Blue (#0000FF) on Yellow (#FFFF00)
- Brand colors: Custom brand color on white
- Inverted: White (#FFFFFF) on Black (#000000)
- Low contrast (should warn): Light Gray (#CCCCCC) on White (#FFFFFF)

### Bundle Size Considerations

The `qrcode` library adds approximately 50-60 KB to the bundle when minified. This is acceptable given:
- The app already uses other libraries (pdf-lib, heic2any)
- Client-side generation provides privacy benefits
- No backend infrastructure needed
- Modern browsers handle this size easily

If bundle size becomes a concern, consider:
- Code splitting: Load qrcode library only when QR tool is accessed
- Tree shaking: Ensure only needed functions are imported
- Alternative library: Use smaller qrcode-generator if advanced features aren't needed
