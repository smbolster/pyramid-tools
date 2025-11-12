# Feature: Color Picker Tool

## Feature Plan Created: specs/012-color-picker.md

## Feature Description

Create a comprehensive Color Picker tool that allows users to pick colors, convert between different color formats (HEX, RGB, HSL, HSV), and copy color values to their clipboard. The tool will feature an interactive color picker interface, real-time format conversion, color palette generation, and accessibility features like contrast ratio checking. This client-side tool will provide a seamless experience for designers, developers, and anyone working with colors, without requiring any server-side processing.

## User Story

As a designer or developer
I want to pick colors and convert them between different formats
So that I can easily work with colors in my projects and ensure they meet accessibility standards

## Problem Statement

Designers and developers frequently need to work with colors in different formats. A designer might pick a color visually but need it in HEX format for CSS, while a developer might need to convert between RGB, HSL, and HSV for different use cases. Additionally, ensuring color combinations meet accessibility standards (WCAG contrast ratios) is crucial but often requires separate tools. Users need a single, integrated tool that allows them to:
- Pick colors visually using an intuitive interface
- View and copy color values in multiple formats simultaneously
- Convert between color formats instantly
- Check contrast ratios for accessibility compliance
- Generate harmonious color palettes
- All while maintaining privacy with client-side processing

## Solution Statement

Implement a client-side Color Picker tool that provides:
- Interactive visual color picker with HSL/HSV gradient interface
- Real-time display of color in multiple formats (HEX, RGB, HSL, HSV, CMYK)
- One-click copy to clipboard for any format
- Color input via multiple methods:
  - Visual picker (hue, saturation, lightness sliders)
  - Text input for HEX, RGB, HSL values
  - Eyedropper tool (browser native if available)
- Contrast ratio checker for accessibility (WCAG AA/AAA compliance)
- Color palette generation (complementary, analogous, triadic, etc.)
- Recent colors history for quick access
- Responsive design with dark mode support
- Privacy-focused: all processing happens in the browser

## Relevant Files

Use these files to implement the feature:

- **app/lib/tools.ts** (lines 51-58) - Tool registry where the Color Picker is already defined. The tool card already appears on the homepage but links to a non-existent page. No changes needed to this file.

- **app/app/page.tsx** - Homepage that displays all tools. No changes needed as the Color Picker already appears in the tools list.

- **app/components/ui/button.tsx** - Reusable button component for copy buttons, reset buttons, etc.

- **app/components/theme-toggle.tsx** - Theme toggle component to be included in the Color Picker page header.

- **app/lib/utils.ts** - Utility functions including cn() for className merging. Will be used throughout the component.

- **app/lib/zip-utils.ts** - Contains downloadBlob() utility, though downloading colors is less common, may be used for palette export.

### New Files

- **app/app/tools/color-picker/page.tsx** - Main tool page component with:
  - Visual color picker interface
  - Multiple format displays and inputs (HEX, RGB, HSL, HSV)
  - Copy to clipboard buttons for each format
  - Contrast checker section
  - Color palette generator
  - Recent colors history
  - Consistent header with back link and theme toggle
  - Responsive layout for all screen sizes

- **app/types/color-picker.ts** - TypeScript type definitions:
  - ColorFormats interface (hex, rgb, hsl, hsv, cmyk)
  - RGB, HSL, HSV, CMYK interfaces
  - ContrastRatio type
  - PaletteType enum (complementary, analogous, triadic, tetradic, monochromatic)
  - ColorPickerState interface
  - Constants for defaults, limits, WCAG standards

- **app/lib/color-picker.ts** - Core business logic:
  - Color conversion functions (RGB↔HSL, RGB↔HSV, RGB↔HEX, RGB↔CMYK)
  - Color validation functions
  - Contrast ratio calculation (WCAG formula)
  - Palette generation algorithms
  - Color utility functions (lighten, darken, saturate, etc.)

- **app/components/color-display-grid.tsx** - Component to display color in all formats:
  - Large color swatch preview
  - Format cards for HEX, RGB, HSL, HSV, CMYK
  - Copy button for each format
  - Copied confirmation feedback

- **app/components/color-picker-interface.tsx** - Interactive color picker UI:
  - Hue slider (0-360°)
  - Saturation/Lightness 2D picker
  - Lightness slider
  - Alpha/opacity slider (optional)
  - Preview of selected color

- **app/components/contrast-checker.tsx** - Accessibility contrast checker:
  - Foreground and background color inputs
  - Contrast ratio display
  - WCAG AA/AAA compliance indicators
  - Example text preview with both colors

- **app/components/palette-generator.tsx** - Color harmony palette generator:
  - Palette type selector (complementary, analogous, etc.)
  - Generated palette display with color swatches
  - Copy entire palette functionality
  - Individual color selection

## Implementation Plan

### Phase 1: Foundation

1. Create TypeScript type definitions for all color formats and interfaces
2. Implement core color conversion functions (RGB as the central format)
3. Implement color validation utilities
4. Set up component file structure
5. Define constants and default values

### Phase 2: Core Implementation

1. Build the interactive color picker interface component
2. Implement color display grid with all formats
3. Create clipboard copy functionality with user feedback
4. Build contrast ratio checker with WCAG compliance indicators
5. Implement palette generation algorithms
6. Create the main page layout and state management
7. Add recent colors history with localStorage

### Phase 3: Integration

1. Connect all components in the main page
2. Implement eyedropper API integration (if browser supports)
3. Add keyboard shortcuts and accessibility features
4. Test color conversions for accuracy
5. Verify WCAG contrast calculations
6. Test responsive layout and dark mode
7. Add informational content about color theory and accessibility
8. Performance optimization and final polish

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Type Definitions File

- Create `app/types/color-picker.ts`
- Define RGB interface: `{ r: number, g: number, b: number, a?: number }` (0-255 for r,g,b; 0-1 for a)
- Define HSL interface: `{ h: number, s: number, l: number, a?: number }` (h: 0-360, s/l: 0-100)
- Define HSV interface: `{ h: number, s: number, v: number, a?: number }` (h: 0-360, s/v: 0-100)
- Define CMYK interface: `{ c: number, m: number, y: number, k: number }` (all 0-100)
- Define ColorFormats interface with all format properties
- Define PaletteType type: 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic'
- Define WCAGLevel type: 'AA' | 'AAA'
- Define ContrastResult interface: `{ ratio: number, passesAA: boolean, passesAAA: boolean }`
- Define constants:
  - DEFAULT_COLOR (HEX): '#3b82f6' (a nice blue)
  - WCAG_AA_NORMAL: 4.5
  - WCAG_AA_LARGE: 3.0
  - WCAG_AAA_NORMAL: 7.0
  - WCAG_AAA_LARGE: 4.5
  - MAX_RECENT_COLORS: 10
- Export all types and constants

### 2. Create Color Conversion Utilities

- Create `app/lib/color-picker.ts`
- Implement `hexToRgb(hex: string): RGB | null`:
  - Remove '#' prefix if present
  - Support both 3-char (#RGB) and 6-char (#RRGGBB) formats
  - Parse and validate hex characters
  - Return RGB object or null if invalid
- Implement `rgbToHex(rgb: RGB): string`:
  - Convert each channel to 2-digit hex
  - Return '#RRGGBB' format string
- Implement `rgbToHsl(rgb: RGB): HSL`:
  - Normalize RGB to 0-1 range
  - Calculate min, max, and delta
  - Compute hue (0-360), saturation (0-100), lightness (0-100)
  - Return HSL object
- Implement `hslToRgb(hsl: HSL): RGB`:
  - Convert HSL to RGB using standard formula
  - Handle special cases (saturation = 0)
  - Return RGB object with 0-255 values
- Implement `rgbToHsv(rgb: RGB): HSV`:
  - Similar to HSL conversion but calculate value instead of lightness
  - Return HSV object
- Implement `hsvToRgb(hsv: HSV): RGB`:
  - Convert HSV to RGB using standard formula
  - Return RGB object
- Implement `rgbToCmyk(rgb: RGB): CMYK`:
  - Normalize RGB to 0-1
  - Calculate K (key/black): 1 - max(R, G, B)
  - Calculate C, M, Y based on K
  - Return CMYK with 0-100 values
- Add validation functions:
  - `isValidHex(hex: string): boolean`
  - `isValidRgb(rgb: RGB): boolean`
  - `normalizeHex(hex: string): string` - adds # if missing, converts to lowercase
- Add utility for formatting:
  - `formatRgbString(rgb: RGB): string` - returns "rgb(r, g, b)"
  - `formatHslString(hsl: HSL): string` - returns "hsl(h, s%, l%)"

### 3. Create Contrast Ratio Calculator

- In `app/lib/color-picker.ts`, implement contrast calculation
- Implement `getRelativeLuminance(rgb: RGB): number`:
  - Convert RGB to sRGB (normalize and apply gamma correction)
  - Calculate relative luminance: 0.2126 * R + 0.7152 * G + 0.0722 * B
  - Return value between 0-1
- Implement `calculateContrastRatio(color1: RGB, color2: RGB): number`:
  - Get luminance for both colors
  - Calculate contrast ratio: (lighter + 0.05) / (darker + 0.05)
  - Return ratio (1-21)
- Implement `checkContrast(foreground: RGB, background: RGB): ContrastResult`:
  - Calculate contrast ratio
  - Check if ratio passes WCAG AA (4.5:1 for normal, 3.0:1 for large text)
  - Check if ratio passes WCAG AAA (7.0:1 for normal, 4.5:1 for large text)
  - Return ContrastResult object

### 4. Create Palette Generation Functions

- In `app/lib/color-picker.ts`, implement palette generators
- Implement `generateComplementary(hsl: HSL): HSL[]`:
  - Return original color and its complement (hue + 180°)
  - Return array of 2 HSL colors
- Implement `generateAnalogous(hsl: HSL): HSL[]`:
  - Return original color and two adjacent colors (hue ± 30°)
  - Return array of 3 HSL colors
- Implement `generateTriadic(hsl: HSL): HSL[]`:
  - Return original color and two colors at 120° intervals
  - Return array of 3 HSL colors
- Implement `generateTetradic(hsl: HSL): HSL[]`:
  - Return original color and three colors at 90° intervals
  - Return array of 4 HSL colors
- Implement `generateMonochromatic(hsl: HSL): HSL[]`:
  - Return 5 variations of the color with different lightness values
  - Keep hue and saturation constant
  - Vary lightness from 20% to 90%
  - Return array of 5 HSL colors
- Implement `generatePalette(hsl: HSL, type: PaletteType): HSL[]`:
  - Router function that calls appropriate generator based on type
  - Ensure hue values wrap correctly (0-360)

### 5. Create Color Display Grid Component

- Create `app/components/color-display-grid.tsx`
- Make it a client component ("use client")
- Define props: `ColorDisplayGridProps { color: ColorFormats }`
- Import Copy icon from lucide-react, Button component
- Implement copy to clipboard functionality:
  - Use navigator.clipboard.writeText()
  - Show "Copied!" feedback for 2 seconds
  - Handle clipboard API errors gracefully
- Create layout with:
  - Large color preview swatch (full width, aspect-ratio-square or 16:9)
  - Grid of format cards (2 columns on mobile, 3 on tablet, 5 on desktop)
  - Each card shows format name, value, and copy button
- Format cards for:
  - HEX: Display hex value (e.g., "#3B82F6")
  - RGB: Display rgb(r, g, b) format
  - HSL: Display hsl(h, s%, l%) format
  - HSV: Display hsv(h, s%, v%) format
  - CMYK: Display cmyk(c%, m%, y%, k%) format
- Style cards with borders, padding, hover effects
- Add copy button to each card with feedback on click
- Ensure dark mode compatibility

### 6. Create Color Picker Interface Component

- Create `app/components/color-picker-interface.tsx`
- Make it a client component ("use client")
- Define props: `ColorPickerInterfaceProps { color: HSL, onChange: (color: HSL) => void }`
- Implement hue slider:
  - Input type="range" with min=0, max=360
  - Custom styling with full spectrum gradient background
  - onChange updates hue value
- Implement saturation/lightness 2D picker:
  - Canvas or div with gradient (white to color to black)
  - Click and drag interaction to pick S/L
  - Visual indicator (circle) showing current position
  - Mouse and touch event handlers
- Implement lightness slider (optional alternative):
  - Input type="range" with min=0, max=100
  - Gradient background from black through color to white
- Add color preview:
  - Large square showing current color
  - Display current HSL values as text
- Implement manual input fields:
  - Number inputs for H (0-360), S (0-100), L (0-100)
  - Validation and bounds checking
  - onChange updates state
- Style with proper spacing, borders, and dark mode support
- Ensure smooth interactions and visual feedback

### 7. Create Contrast Checker Component

- Create `app/components/contrast-checker.tsx`
- Make it a client component ("use client")
- Define props: `ContrastCheckerProps { foregroundColor: RGB, backgroundColor: RGB, onForegroundChange: (color: RGB) => void, onBackgroundChange: (color: RGB) => void }`
- Import contrast calculation function
- Create layout with two color inputs:
  - Foreground color picker (input type="color")
  - Background color picker (input type="color")
  - Labels for each
- Display contrast ratio:
  - Large number showing ratio (e.g., "4.52:1")
  - Color-coded indicator (green if passes, red if fails)
- Display WCAG compliance:
  - AA Normal Text: Pass/Fail with checkmark or X icon
  - AA Large Text: Pass/Fail
  - AAA Normal Text: Pass/Fail
  - AAA Large Text: Pass/Fail
- Add example text preview:
  - Sample paragraph with foreground text on background color
  - Both normal and large text sizes
  - Demonstrates actual contrast visually
- Style with cards, badges for pass/fail, icons
- Ensure accessible design (ironic if contrast checker isn't accessible!)

### 8. Create Palette Generator Component

- Create `app/components/palette-generator.tsx`
- Make it a client component ("use client")
- Define props: `PaletteGeneratorProps { baseColor: HSL }`
- Import palette generation functions
- Create palette type selector:
  - Radio buttons or segmented control for palette types
  - Options: Complementary, Analogous, Triadic, Tetradic, Monochromatic
  - Descriptions for each type
- Display generated palette:
  - Grid or row of color swatches
  - Each swatch shows the color and hex value
  - Click to copy hex value
  - Hover effect on each swatch
- Implement copy entire palette:
  - Button to copy all hex values as comma-separated list
  - Or copy as JSON/CSS variables
  - Feedback on copy
- Add informational tooltips:
  - Explain what each palette type means
  - Color theory basics
- Style with good spacing, clear labels, attractive swatches
- Make responsive (stack on mobile, row on desktop)

### 9. Create Main Color Picker Page

- Create `app/app/tools/color-picker/page.tsx`
- Add "use client" directive
- Import all necessary components and utilities
- Initialize state using useState:
  - currentColor: HSL (start with DEFAULT_COLOR converted to HSL)
  - recentColors: string[] (hex values, load from localStorage)
  - showContrast: boolean (toggle contrast checker visibility)
  - copiedFormat: string | null (for copy feedback)
- Implement useEffect to sync state:
  - When currentColor changes, save to localStorage
  - Update recentColors array (max 10 colors)
  - Convert currentColor to all formats for display
- Implement color change handler:
  - Accept HSL from picker interface
  - Update currentColor state
  - Trigger format conversions
- Implement text input handlers:
  - Accept HEX, RGB, or HSL string input
  - Parse and validate input
  - Convert to HSL and update state
  - Show error for invalid input
- Implement eyedropper (if supported):
  - Check if EyeDropper API exists
  - Button to open eyedropper
  - Handle selected color
  - Show "Not supported" message in unsupported browsers
- Create page layout:
  - Fixed theme toggle in top-right
  - Header with back link and title
  - Main content in responsive grid
- Structure content sections:
  - Color Picker Interface (left column)
  - Color Display Grid (right column)
  - Recent Colors (below picker)
  - Contrast Checker (collapsible or separate tab)
  - Palette Generator (below grid)
  - Info section (bottom)
- Style consistently with other tool pages
- Ensure all interactions work smoothly

### 10. Implement Clipboard Copy Functionality

- In main page component, create copy handler
- Use navigator.clipboard.writeText() API
- Implement fallback for older browsers (create textarea, select, copy, remove)
- Add visual feedback:
  - Change button text to "Copied!" for 2 seconds
  - Or show toast notification
  - Add checkmark icon temporarily
- Handle errors:
  - Catch clipboard API errors
  - Show error message if copy fails
  - Log to console for debugging
- Ensure copy works for:
  - Individual color formats
  - Entire palettes
  - Recent colors
- Test on different browsers and devices

### 11. Add Recent Colors History

- Implement localStorage integration:
  - Key: 'pyramid-tools-recent-colors'
  - Store array of hex strings
  - Max 10 colors
- On component mount:
  - Read from localStorage
  - Parse JSON array
  - Set recentColors state
- When color changes:
  - Add current color to recent colors (avoid duplicates)
  - Keep only last 10 colors
  - Save to localStorage
- Display recent colors:
  - Row of small color swatches
  - Click to load that color
  - Hover shows hex value tooltip
  - Clear all button to reset history
- Handle edge cases:
  - localStorage not available (private browsing)
  - Corrupted data in localStorage
  - Graceful degradation

### 12. Implement Eyedropper API Integration

- Check for browser support:
  - `if ('EyeDropper' in window)`
- Create eyedropper button:
  - Label: "Pick Color from Screen"
  - Icon: Eyedropper icon from lucide-react
  - Disabled if not supported with tooltip
- Implement pick color handler:
  ```typescript
  const pickColor = async () => {
    const eyeDropper = new (window as any).EyeDropper();
    try {
      const result = await eyeDropper.open();
      const hex = result.sRGBHex;
      // Convert to HSL and update state
    } catch (err) {
      // User cancelled or error occurred
    }
  };
  ```
- Add user feedback during picking
- Show browser compatibility note
- Currently supported in: Chrome, Edge (Chromium-based)
- Provide alternative text input for unsupported browsers

### 13. Add Keyboard Shortcuts and Accessibility

- Implement keyboard shortcuts:
  - Arrow keys to adjust hue (fine control)
  - Shift + Arrow keys for saturation/lightness
  - C to copy current HEX color
  - R to reset to default color
- Add keyboard focus management:
  - Logical tab order through all controls
  - Visible focus indicators on all interactive elements
  - Skip links if needed for long pages
- Add ARIA labels:
  - All inputs have associated labels
  - Color swatches have aria-label with color value
  - Buttons have clear aria-labels
  - Live regions for dynamic content (copied feedback)
- Ensure screen reader support:
  - Announce color changes
  - Announce copy success
  - Describe color values meaningfully
- Add keyboard shortcuts help:
  - Modal or collapsible section explaining shortcuts
  - Toggle with ? key

### 14. Create Informational Content Section

- Add "About This Tool" section at bottom of page
- Style as card with padding and border
- Include information about:
  - **Color Formats Explained**:
    - HEX: Used in web design, CSS, HTML
    - RGB: Additive color model, displays, digital
    - HSL: Intuitive for designers (Hue, Saturation, Lightness)
    - HSV/HSB: Similar to HSL, used in design software
    - CMYK: Subtractive model for printing
  - **Color Harmonies**:
    - Complementary: Opposite on color wheel, high contrast
    - Analogous: Adjacent colors, harmonious
    - Triadic: Evenly spaced, balanced vibrant
    - Tetradic: Rectangle on wheel, rich combinations
    - Monochromatic: Single hue with variations
  - **WCAG Accessibility**:
    - AA Normal: 4.5:1 (minimum for body text)
    - AA Large: 3.0:1 (18pt+ or 14pt+ bold)
    - AAA Normal: 7.0:1 (enhanced)
    - AAA Large: 4.5:1 (enhanced)
  - **Tips**:
    - Use high contrast for readability
    - Test colors with actual users
    - Consider color blindness (use tools like Coblis)
    - Don't rely solely on color to convey information
  - **Privacy Note**:
    - All processing in browser
    - Recent colors stored locally only
    - No data sent to servers
- Use proper typography and formatting
- Add links to external resources if helpful

### 15. Style and Polish the Interface

- Ensure consistent spacing using Tailwind utilities
- Apply proper typography (font sizes, weights, line heights)
- Add subtle shadows and borders to sections
- Implement smooth transitions for interactive elements
- Verify dark mode styles:
  - All text readable in both themes
  - Color swatches have borders in dark mode for visibility
  - Inputs and buttons styled appropriately
  - Background gradients work in both modes
- Make fully responsive:
  - Single column layout on mobile (<640px)
  - Two column layout on tablet (640px-1024px)
  - Three column or optimized layout on desktop (>1024px)
  - Color picker interface adapts to smaller screens
  - Swatches and buttons are appropriately sized for touch
- Add smooth animations:
  - Fade in/out for copied feedback
  - Smooth transitions for color changes
  - Hover effects on swatches and buttons
- Ensure consistent visual design with other tools in the app
- Test on various screen sizes and devices

### 16. Test Color Conversion Accuracy

- Test HEX to RGB conversion:
  - #000000 → rgb(0, 0, 0) Black
  - #FFFFFF → rgb(255, 255, 255) White
  - #FF0000 → rgb(255, 0, 0) Red
  - #00FF00 → rgb(0, 255, 0) Green
  - #0000FF → rgb(0, 0, 255) Blue
  - #3B82F6 → rgb(59, 130, 246) Blue
  - Short format: #FFF → #FFFFFF
- Test RGB to HSL conversion:
  - rgb(255, 0, 0) → hsl(0, 100%, 50%) Red
  - rgb(0, 255, 0) → hsl(120, 100%, 50%) Green
  - rgb(0, 0, 255) → hsl(240, 100%, 50%) Blue
  - rgb(128, 128, 128) → hsl(0, 0%, 50%) Gray
  - rgb(255, 255, 255) → hsl(0, 0%, 100%) White
- Test HSL to RGB (round-trip):
  - Convert color to HSL then back to RGB
  - Should match original (within rounding error)
- Test RGB to CMYK:
  - rgb(255, 0, 0) → cmyk(0%, 100%, 100%, 0%) Red
  - rgb(0, 0, 0) → cmyk(0%, 0%, 0%, 100%) Black
  - rgb(128, 128, 128) → cmyk(0%, 0%, 0%, 50%) Gray
- Verify all conversions are accurate to within 1 unit (rounding acceptable)
- Use online color converters to cross-check results

### 17. Test Contrast Ratio Calculations

- Test known contrast ratios:
  - Black on White: 21:1 (maximum contrast)
  - White on Black: 21:1
  - #777 on White: ~4.5:1 (passes AA normal)
  - #767676 on White: 4.54:1 (minimum AA normal)
  - #595959 on White: 7.0:1 (minimum AAA normal)
- Test WCAG compliance:
  - 4.5:1 passes AA normal, fails AAA normal
  - 7.0:1 passes both AA and AAA normal
  - 3.0:1 passes AA large, fails AA normal
  - 4.5:1 passes AAA large
- Verify calculations match official WCAG tools:
  - Use WebAIM Contrast Checker
  - Use Chrome DevTools contrast checker
  - Should match within 0.01
- Test edge cases:
  - Same color on same color: 1:1 (fails all tests)
  - Very similar colors: low ratio
  - Maximum contrast: 21:1

### 18. Test Palette Generation

- Test complementary palette:
  - Red (0°) should generate cyan (180°)
  - Blue (240°) should generate yellow (60°)
  - Verify exact hue angles
- Test analogous palette:
  - Blue (240°) → 210°, 240°, 270°
  - Verify spacing is ±30°
- Test triadic palette:
  - Red (0°) → 0°, 120°, 240° (Red, Green, Blue)
  - Verify spacing is 120°
- Test tetradic palette:
  - Blue (240°) → 240°, 330°, 60°, 150°
  - Verify spacing is 90°
- Test monochromatic palette:
  - Hue and saturation stay constant
  - Only lightness varies
  - Should have 5 distinct values
- Verify all generated colors are valid:
  - Hue wraps correctly (0-360)
  - Saturation and lightness in bounds (0-100)
- Ensure palette colors are visually harmonious

### 19. Test Clipboard Functionality

- Test copy HEX format:
  - Click copy button
  - Paste in text editor
  - Verify exact format: "#RRGGBB" or custom format
- Test copy RGB format:
  - Verify format: "rgb(255, 0, 0)" or "255, 0, 0"
- Test copy HSL format:
  - Verify format: "hsl(0, 100%, 50%)"
- Test copy entire palette:
  - Verify all colors copied
  - Verify format is useful (comma-separated, JSON, etc.)
- Test in different browsers:
  - Chrome, Firefox, Safari, Edge
  - Mobile Safari, Chrome Android
- Test clipboard permissions:
  - Verify permission prompt if needed
  - Handle denied permissions gracefully
  - Show error message if copy fails
- Test rapid copying:
  - Click copy multiple times quickly
  - Verify no errors or race conditions
- Verify "Copied!" feedback appears and disappears

### 20. Test Recent Colors History

- Test adding colors:
  - Pick a color
  - Verify it appears in recent colors
  - Pick 10 different colors
  - Verify oldest is removed when 11th is added
- Test clicking recent color:
  - Click a recent color swatch
  - Verify main color updates
  - Verify all displays update
- Test duplicate handling:
  - Pick same color twice
  - Verify it doesn't duplicate in history
  - Or moves to front of list
- Test localStorage persistence:
  - Pick colors
  - Refresh page
  - Verify recent colors persist
  - Close tab and reopen
  - Verify history maintained
- Test clear history:
  - Click clear/reset button
  - Verify all recent colors removed
  - Verify localStorage cleared
- Test private browsing:
  - Test in private/incognito mode
  - Verify tool works even if localStorage fails
  - Verify no errors in console

### 21. Test Eyedropper Functionality (if supported)

- Test in Chrome/Edge:
  - Click eyedropper button
  - Move cursor over different screen areas
  - Verify color preview updates in real-time
  - Click to select color
  - Verify selected color loads in tool
- Test cancellation:
  - Open eyedropper
  - Press Escape or click cancel
  - Verify tool state unchanged
  - Verify no errors
- Test unsupported browsers:
  - Open in Firefox or Safari (currently unsupported)
  - Verify button is disabled or shows "Not Supported"
  - Verify helpful message explaining limitation
  - Verify alternative text input works
- Test cross-origin restrictions:
  - Try to pick color from cross-origin iframe
  - Verify security restrictions are respected
- Test accessibility:
  - Keyboard activation of eyedropper
  - Screen reader announcements

### 22. Test Dark Mode Compatibility

- Enable dark mode using theme toggle
- Verify all sections are readable:
  - Text colors have sufficient contrast
  - Borders are visible
  - Background colors are appropriate
- Verify color swatches:
  - Light colors have dark borders for visibility
  - Dark colors have light borders or backgrounds
  - Color preview is always visible
- Test color picker interface:
  - Sliders visible and usable
  - Gradient backgrounds visible
  - Labels and values readable
- Test contrast checker:
  - Interface is accessible in dark mode
  - Example text is readable
  - Pass/fail indicators are clear
- Switch between light and dark mode multiple times:
  - Verify no flashing or layout shifts
  - Verify smooth transitions
  - Verify no state loss
- Test on multiple devices and browsers in dark mode

### 23. Test Responsive Layout

- Test mobile viewport (375px width):
  - Single column layout
  - Color picker interface is usable on small screen
  - Buttons and swatches are tappable (minimum 44x44px)
  - Text is readable (not too small)
  - No horizontal scrolling
  - All features accessible
- Test tablet viewport (768px width):
  - Two column or adjusted layout
  - Good use of screen space
  - No awkward gaps or cramped areas
- Test desktop viewport (1920px width):
  - Multi-column layout
  - Content not stretched too wide (max-width container)
  - Visual hierarchy is clear
  - Comfortable spacing
- Test landscape orientation:
  - Mobile landscape
  - Tablet landscape
  - Layout adjusts appropriately
- Test very small screens (320px):
  - All content accessible
  - Text doesn't overflow
  - Buttons remain tappable
- Test very large screens (2560px+):
  - Content doesn't stretch awkwardly
  - Max-width container keeps content readable
  - Good use of whitespace

### 24. Test Keyboard Navigation and Shortcuts

- Test tab navigation:
  - Tab through all interactive elements
  - Verify logical order (top to bottom, left to right)
  - Verify all elements receive focus
  - Verify visible focus indicators (rings/outlines)
- Test keyboard shortcuts:
  - Arrow keys to adjust color (if implemented)
  - C to copy (if implemented)
  - R to reset (if implemented)
  - Verify shortcuts work from any focused element
  - Verify shortcuts don't interfere with text input
- Test Escape key:
  - Closes modals or cancels operations
  - Returns focus appropriately
- Test Enter/Space on buttons:
  - Activates buttons correctly
  - Same behavior as mouse click
- Test in screen reader:
  - Use NVDA (Windows) or VoiceOver (Mac)
  - Navigate with screen reader keys
  - Verify all content is announced
  - Verify color values are read correctly
  - Verify button purposes are clear
  - Verify form labels are associated
- Verify no keyboard traps:
  - Can always tab out of any section
  - Can navigate entire page with keyboard only

### 25. Test Text Input for Colors

- Test HEX input:
  - Enter "#FF0000" → should load red
  - Enter "FF0000" (no #) → should work or auto-add #
  - Enter "#FFF" → should expand to #FFFFFF
  - Enter invalid: "ZZZ" → should show error
  - Enter partial: "#FF" → should show error or ignore
- Test RGB input (if implemented):
  - Enter "rgb(255, 0, 0)" → should load red
  - Enter "255, 0, 0" → should parse correctly
  - Enter invalid: "rgb(300, 0, 0)" → should show error (out of range)
- Test HSL input (if implemented):
  - Enter "hsl(0, 100%, 50%)" → should load red
  - Enter "0, 100%, 50%" → should parse correctly
- Test paste functionality:
  - Paste color value from external source
  - Verify it parses correctly
  - Handle various formats gracefully
- Test auto-correction:
  - Decide if invalid input should be corrected or rejected
  - Provide clear error messages
  - Don't lose user input on error

### 26. Test Accessibility Compliance

- Run automated accessibility tests:
  - Use Chrome DevTools Lighthouse
  - Use axe DevTools browser extension
  - Fix any reported issues
- Verify color contrast:
  - All text meets WCAG AA at minimum
  - Important text meets AAA if possible
  - Use contrast checker on own interface
- Test with keyboard only:
  - Complete all tasks without mouse
  - Verify all features accessible
- Test with screen reader:
  - Navigate entire page
  - Verify all content understandable
  - Verify dynamic changes announced
- Test with browser zoom:
  - Zoom to 200%
  - Verify layout doesn't break
  - Verify text remains readable
  - Verify no content is cut off
- Check focus indicators:
  - All interactive elements have visible focus
  - Focus indicators meet contrast requirements
  - Custom focus styles are clear
- Verify form labels:
  - All inputs have associated labels
  - Labels are descriptive and clear
  - Placeholder text is not sole label

### 27. Performance Testing and Optimization

- Test color conversion performance:
  - Rapidly change color with picker
  - Verify smooth updates (no lag)
  - Check for any performance bottlenecks
- Test with DevTools Performance profiler:
  - Record interaction session
  - Look for long tasks or jank
  - Optimize if needed
- Test memory usage:
  - Open DevTools Memory profiler
  - Use tool extensively
  - Take heap snapshots
  - Verify no memory leaks
  - Verify recent colors array doesn't grow unbounded
- Test bundle size impact:
  - Check build output for size increase
  - Verify color picker doesn't add significant bundle size
  - All code is client-side, no external libraries needed
- Test initial load time:
  - Measure time to interactive
  - Verify page loads quickly
  - Check for render-blocking resources
- Optimize if needed:
  - Debounce rapid color changes if laggy
  - Memoize expensive calculations
  - Lazy load non-critical components

### 28. End-to-End Testing Scenarios

- **Scenario 1: Pick and Copy Color**
  - Navigate to /tools/color-picker
  - Move hue slider to 240° (blue)
  - Adjust saturation to 80%, lightness to 60%
  - Verify preview shows blue color
  - Click copy HEX button
  - Verify "Copied!" feedback
  - Paste in text editor → should be hex code

- **Scenario 2: Check Contrast**
  - Enter white background (#FFFFFF)
  - Enter gray foreground (#767676)
  - Verify contrast ratio shown is ~4.5:1
  - Verify AA Normal shows pass
  - Verify AAA Normal shows fail
  - Read example text to verify it's readable

- **Scenario 3: Generate Palette**
  - Select a blue color (HSL: 240, 80%, 60%)
  - Choose "Triadic" palette type
  - Verify 3 colors generated
  - Verify colors are blue, yellow-ish, red-ish (120° apart)
  - Click to copy one of the generated colors
  - Verify it becomes the main color

- **Scenario 4: Use Recent Colors**
  - Pick 5 different colors sequentially
  - Verify all 5 appear in recent colors
  - Click on the first recent color
  - Verify it loads as main color
  - Refresh page
  - Verify recent colors persist

- **Scenario 5: Use Eyedropper (Chrome)**
  - Click eyedropper button
  - Move over a red element on screen
  - Click to select
  - Verify red color loads in tool
  - Verify all formats update

- **Scenario 6: Dark Mode**
  - Toggle to dark mode
  - Verify entire interface switches
  - Pick a light color (pastel)
  - Verify it's visible in preview
  - Verify text is readable
  - Toggle back to light mode
  - Verify everything still works

### 29. Code Quality and Cleanup

- Review all TypeScript types:
  - No `any` types (use proper types or `unknown`)
  - All props interfaces properly defined
  - All function signatures typed
  - No type assertions unless absolutely necessary
- Check code formatting:
  - Consistent indentation (2 spaces)
  - Proper import ordering
  - No unused imports or variables
  - No commented-out code
- Add JSDoc comments:
  - Document all utility functions
  - Explain complex algorithms (conversion formulas)
  - Add examples in comments where helpful
- Ensure error handling:
  - All async functions have try/catch
  - User-facing error messages are clear
  - Technical errors logged to console
  - Graceful degradation when features unavailable
- Verify naming conventions:
  - Components in PascalCase
  - Functions in camelCase
  - Constants in UPPER_SNAKE_CASE
  - Variables descriptive and clear
- Check for console.log statements:
  - Remove debug logs
  - Keep intentional error logs
- Run ESLint and fix all warnings/errors
- Run TypeScript compiler and fix all errors

### 30. Documentation and Comments

- Add inline comments for complex logic:
  - Color conversion formulas
  - Contrast ratio calculations
  - Palette generation algorithms
- Document all utility functions with JSDoc:
  - Parameters and their types
  - Return values
  - Possible exceptions
  - Usage examples
- Add comments explaining non-obvious choices:
  - Why specific algorithms chosen
  - Browser compatibility notes
  - Performance considerations
- Ensure constants are well-named and explained:
  - WCAG standards and their meanings
  - Default color choice rationale
- Verify informational content on page is accurate:
  - Color theory explanations
  - WCAG guidelines
  - Format descriptions
  - Tips and best practices

### 31. Run Validation Commands

Execute validation commands to ensure the feature works correctly with zero regressions.

- Run `cd app && npm run lint`:
  - Verify zero ESLint errors
  - Verify zero ESLint warnings (or only pre-existing warnings)
  - Fix any issues found

- Run `cd app && npm run build`:
  - Verify successful build
  - Verify zero TypeScript errors
  - Verify zero build warnings
  - Check build output size

- Run `cd app && npm run dev`:
  - Start development server
  - Navigate to http://localhost:3000
  - Perform comprehensive manual testing
  - Test all features described above
  - Verify no console errors or warnings
  - Test in multiple browsers

## Testing Strategy

### Unit Tests

Since this application doesn't currently have a testing framework, unit tests are not included. However, if testing is added in the future, consider testing:

- **Color Conversion Functions**: Test all conversion paths (HEX→RGB→HSL→HSV, etc.) with known values
- **Validation Functions**: Test hex validation, RGB bounds checking, etc.
- **Contrast Calculation**: Test luminance calculation and contrast ratio with known values
- **Palette Generation**: Test each palette type generates correct hue angles
- **Format Helpers**: Test string formatting functions for each color format
- **Edge Cases**: Test boundary values (0, 360 for hue; 0, 100 for saturation/lightness)

### Integration Tests

Manual integration tests to perform:

- **Picker to Display**: Changing color in picker updates all format displays
- **Format Input to Picker**: Entering a color value updates picker position
- **Recent Colors to Main**: Clicking recent color updates picker and displays
- **Palette to Main**: Clicking palette color updates main color
- **Contrast Checker Integration**: Changing colors updates contrast ratio in real-time
- **Clipboard Integration**: Copy buttons successfully write to clipboard
- **LocalStorage Integration**: Recent colors persist across page reloads
- **Theme Integration**: Dark mode toggle affects entire color picker page
- **Responsive Integration**: Layout adapts correctly at all breakpoints

### Edge Cases

- **Invalid Color Input**: Entering invalid hex codes, out-of-range RGB values
- **Extreme Values**: Hue at 0° and 360° (should be same red), saturation/lightness at 0% and 100%
- **Black and White**: Ensure conversion formulas handle black (0,0,0) and white (255,255,255) correctly
- **Grayscale Colors**: Hue is undefined for grayscale, ensure no NaN values
- **Same Color Contrast**: Contrast ratio should be 1:1
- **Maximum Contrast**: Black on white or white on black should be 21:1
- **Eyedropper Cancellation**: User cancels eyedropper, no error
- **Clipboard Denied**: User denies clipboard permission, graceful error
- **LocalStorage Full**: localStorage quota exceeded, handle gracefully
- **No LocalStorage**: Private browsing mode, tool still works without recent colors
- **Rapid Interactions**: Clicking multiple buttons rapidly, dragging picker fast
- **Very Long Recent Colors**: Verify old colors are removed when limit reached
- **Hue Wraparound**: 361° wraps to 1°, -1° wraps to 359°
- **Floating Point Precision**: Small rounding errors in conversions are acceptable (within 1 unit)

## Acceptance Criteria

1. **Tool Visibility**:
   - Color Picker tool is accessible via /tools/color-picker route
   - Tool already appears on homepage (no changes needed)
   - Page loads without errors

2. **Color Picker Interface**:
   - Interactive hue slider (0-360°)
   - Interactive saturation/lightness picker
   - Visual preview of selected color updates in real-time
   - Manual input fields for H, S, L values
   - All interactions smooth and responsive

3. **Color Format Display**:
   - Displays HEX, RGB, HSL, HSV, and CMYK formats simultaneously
   - All formats update when color changes
   - Large color preview swatch is clearly visible
   - Format values are accurate and correctly formatted

4. **Copy to Clipboard**:
   - Copy button for each color format
   - Clipboard copy works in all major browsers
   - "Copied!" feedback appears and disappears
   - Copy entire palette functionality works
   - Handles clipboard permission errors gracefully

5. **Color Conversion Accuracy**:
   - All color conversions are mathematically accurate (within rounding tolerance)
   - Round-trip conversions (RGB→HSL→RGB) preserve original color
   - Conversions match online color converter tools
   - No NaN or invalid values produced

6. **Contrast Checker**:
   - Calculates contrast ratio correctly using WCAG formula
   - Displays ratio as X.XX:1 format
   - Shows pass/fail for AA and AAA (normal and large text)
   - Example text preview demonstrates actual contrast
   - Updates in real-time as colors change

7. **Palette Generation**:
   - Generates complementary, analogous, triadic, tetradic, and monochromatic palettes
   - Generated colors are mathematically correct (hue angles)
   - Palettes are visually harmonious
   - Click palette color to make it the main color
   - Copy palette functionality works

8. **Recent Colors History**:
   - Recent colors appear as clickable swatches
   - Maximum 10 recent colors stored
   - Clicking recent color loads it as main color
   - Recent colors persist across page reloads (localStorage)
   - Works gracefully when localStorage unavailable
   - Clear history button removes all recent colors

9. **Eyedropper Tool**:
   - Eyedropper button appears and is functional in supported browsers (Chrome, Edge)
   - Opens native eyedropper interface
   - Selected color loads into tool
   - Cancellation handled gracefully
   - Shows "Not Supported" message in unsupported browsers
   - Provides alternative (text input) in all browsers

10. **User Interface**:
    - Consistent header with back link and theme toggle
    - Responsive layout (single column mobile, multi-column desktop)
    - All interactive elements have hover and focus states
    - Typography and spacing consistent with other tools
    - Info section explains color formats, harmonies, and WCAG standards

11. **Dark Mode Support**:
    - All UI elements visible and styled correctly in dark mode
    - Color swatches visible against dark background
    - Text has sufficient contrast in dark mode
    - Smooth transition between light and dark modes
    - No layout shifts when toggling theme

12. **Accessibility**:
    - All interactive elements keyboard accessible
    - Logical tab order throughout page
    - Visible focus indicators on all elements
    - All inputs have associated labels
    - Color values announced by screen readers
    - Error messages announced to screen readers
    - Color contrast meets WCAG AA for interface itself
    - Works with 200% browser zoom

13. **Responsive Design**:
    - Works on mobile (375px+), tablet (768px+), and desktop (1024px+)
    - Single column layout on mobile
    - Multi-column layout on larger screens
    - Touch targets minimum 44x44px on mobile
    - No horizontal scrolling at any viewport size
    - Content is readable at all sizes

14. **Performance**:
    - Color conversions are instant (no perceptible lag)
    - Smooth interactions with picker and sliders
    - No memory leaks with extended use
    - Recent colors array bounded to prevent memory growth
    - Page loads quickly
    - No bundle size issues

15. **Browser Compatibility**:
    - Works in Chrome, Firefox, Safari, and Edge
    - Clipboard copy works in all supported browsers
    - Eyedropper works in Chrome/Edge, gracefully unavailable in others
    - No console errors in any browser
    - Layout consistent across browsers

16. **Privacy**:
    - All processing happens client-side
    - No external API calls or data transmission
    - Recent colors stored locally only (localStorage)
    - Privacy note clearly stated on page

17. **Code Quality**:
    - Proper TypeScript types throughout
    - Zero ESLint errors
    - Zero TypeScript compilation errors
    - Build completes successfully
    - Code follows project conventions
    - No unused imports or variables
    - Functions and variables well-named
    - Complex logic commented

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `cd app && npm run lint` - Run linting to validate code quality. Must pass with zero errors. Pre-existing warnings from other files are acceptable.

- `cd app && npm run build` - Build the Next.js app to validate there are no TypeScript errors or build failures. Must complete successfully.

- `cd app && npm run dev` - Start development server and perform comprehensive manual testing:
  - Navigate to http://localhost:3000
  - Verify "Color Picker" tool card appears on homepage
  - Click Color Picker card
  - Verify page loads at /tools/color-picker
  - Test color picker interface:
    - Move hue slider, verify color updates
    - Adjust saturation/lightness, verify color updates
    - Enter hex value manually: "#3B82F6"
    - Verify all formats update correctly
  - Test clipboard copy:
    - Click copy HEX button
    - Paste in text editor
    - Verify correct hex value
    - Try copying RGB, HSL, HSV, CMYK
  - Test contrast checker:
    - Enter foreground: #000000 (black)
    - Enter background: #FFFFFF (white)
    - Verify ratio shows 21:1
    - Verify all WCAG tests pass
    - Try failing combination: #999 on #BBB
    - Verify fails show correctly
  - Test palette generator:
    - Select "Triadic" palette type
    - Verify 3 colors generated 120° apart
    - Click a palette color
    - Verify it becomes main color
    - Try all palette types
  - Test recent colors:
    - Pick 5 different colors
    - Verify all appear in recent colors
    - Click a recent color
    - Verify it loads
    - Refresh page
    - Verify recent colors persist
  - Test eyedropper (Chrome only):
    - Click eyedropper button
    - Pick a color from screen
    - Verify it loads
    - Or verify "Not Supported" in Firefox/Safari
  - Test dark mode:
    - Toggle dark mode
    - Verify interface adapts
    - Verify colors are visible
    - Verify text is readable
  - Test responsive:
    - Resize window to 375px width
    - Verify single column layout
    - Verify all features accessible
    - Resize to 1920px
    - Verify multi-column layout
  - Test keyboard navigation:
    - Tab through all elements
    - Verify focus indicators visible
    - Verify logical tab order
  - Verify no console errors or warnings
  - Test in Firefox and Safari if possible
  - Navigate back to homepage
  - Verify no regressions to existing tools

## Notes

### Color Conversion Accuracy

Color conversion between different color spaces is mathematically well-defined but can have rounding errors. The implementations should:
- Use floating-point arithmetic for intermediate calculations
- Round to integers only at the final step
- Accept rounding errors of ±1 unit for RGB values (0-255 scale)
- Ensure round-trip conversions (e.g., RGB→HSL→RGB) preserve color within rounding tolerance

Reference formulas:
- RGB↔HEX: Direct mapping with base-16 conversion
- RGB↔HSL: Standard color space transformation formulas
- RGB↔HSV: Similar to HSL but different lightness calculation
- RGB↔CMYK: Subtractive color model conversion (approximate for display)

### WCAG Contrast Ratio Standards

The Web Content Accessibility Guidelines (WCAG) define contrast ratios for accessibility:

**Level AA (Minimum)**:
- Normal text (< 18pt or < 14pt bold): 4.5:1
- Large text (≥ 18pt or ≥ 14pt bold): 3.0:1

**Level AAA (Enhanced)**:
- Normal text: 7.0:1
- Large text: 4.5:1

The relative luminance formula is defined by WCAG and must be calculated precisely:
```
L = 0.2126 * R + 0.7152 * G + 0.0722 * B
```
Where R, G, B are sRGB values (gamma-corrected).

Contrast ratio formula:
```
(L1 + 0.05) / (L2 + 0.05)
```
Where L1 is the lighter color's luminance and L2 is the darker color's luminance.

### EyeDropper API Browser Support

The EyeDropper API is currently supported in:
- Chrome 95+ (September 2021)
- Edge 95+ (Chromium-based)

Not yet supported in:
- Firefox (as of 2024)
- Safari (as of 2024)

The feature should:
- Detect support: `if ('EyeDropper' in window)`
- Disable button with explanation in unsupported browsers
- Provide alternative color input methods for all browsers
- Not block or break functionality when unavailable

### LocalStorage Considerations

Recent colors are stored in localStorage for persistence. Considerations:
- **Storage key**: Use namespaced key like "pyramid-tools-recent-colors"
- **Data format**: JSON array of hex strings
- **Size limit**: Limit to 10 colors (approximately 100 bytes)
- **Private browsing**: localStorage may be unavailable; handle gracefully
- **Corrupted data**: Wrap reads in try/catch; clear if parsing fails
- **Quota exceeded**: Unlikely with small data, but handle gracefully
- **Cross-tab sync**: Changes in one tab won't sync to another; acceptable limitation

### Color Theory for Palette Generation

**Complementary**: Two colors opposite on the color wheel (180° apart). High contrast, vibrant. Example: Blue and Orange.

**Analogous**: Three colors adjacent on the wheel (30° apart). Harmonious, pleasing. Example: Blue, Blue-Green, Green.

**Triadic**: Three colors evenly spaced (120° apart). Balanced, vibrant. Example: Red, Yellow, Blue (primary colors).

**Tetradic (Double Complementary)**: Four colors forming a rectangle (90° apart). Rich, versatile. Example: Blue, Orange, Yellow, Purple.

**Monochromatic**: Variations of a single hue with different saturation and lightness. Cohesive, elegant. Example: Light Blue, Medium Blue, Dark Blue.

Implementation ensures generated palettes follow these mathematical relationships.

### Future Enhancements

Potential features for future iterations:
- **Color Blind Simulator**: Show how colors appear to users with different types of color blindness
- **Color Name Lookup**: Show nearest named color (e.g., "Cornflower Blue")
- **Gradient Generator**: Create CSS gradients between two or more colors
- **Color Extraction**: Upload image and extract dominant colors
- **Save Color Palettes**: Allow users to save and name custom palettes
- **Export Options**: Export palettes as CSS, SCSS, JSON, or other formats
- **Shade and Tint Generator**: Generate lighter/darker variations of a color
- **Temperature Indicator**: Show if color is warm or cool
- **Color Psychology**: Information about psychological associations of colors
- **Material Design/Tailwind Palettes**: Generate palettes matching design system standards

### Performance Considerations

Color picker can be computationally intensive with frequent updates. Optimizations:
- **Debounce slider inputs**: Avoid recalculating on every pixel of drag
- **Memoize conversions**: Cache results of expensive calculations
- **RequestAnimationFrame**: Use for smooth visual updates
- **Avoid unnecessary re-renders**: Use React.memo for components that don't need frequent updates
- **Limit history size**: Cap recent colors at 10 to prevent unbounded growth

### Accessibility Best Practices

The color picker tool itself should model good accessibility:
- Use WCAG AA contrast ratios for all text
- Ensure interactive elements are keyboard accessible
- Provide clear labels and instructions
- Don't rely solely on color to convey information (use text labels, icons)
- Test with screen readers and keyboard-only navigation
- Ensure the tool can be used by people with color blindness (irony if not!)

### Testing Resources

Useful tools for validating the color picker:
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Coolors**: https://coolors.co/ (for palette inspiration and validation)
- **Color Hex**: https://www.color-hex.com/ (color information database)
- **Coblis Color Blindness Simulator**: https://www.color-blindness.com/coblis-color-blindness-simulator/
- **Chrome DevTools**: Built-in color picker and contrast checker

### Code Organization

Files are organized by purpose:
- **Types** (`types/color-picker.ts`): All TypeScript interfaces and constants
- **Logic** (`lib/color-picker.ts`): Pure functions for calculations and conversions
- **Components** (`components/*.tsx`): Reusable UI components
- **Page** (`app/tools/color-picker/page.tsx`): Main page composition and state management

This separation of concerns makes the code maintainable, testable, and reusable.
