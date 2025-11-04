# Chore: QR Code Generator Styling Consistency

## Chore Description
Update the QR Code Generator page to follow the same styling patterns and design system used in other tools (HEIC to JPEG converter and PDF Merger). The current QR Code Generator uses custom Tailwind classes with hardcoded colors (e.g., `bg-gray-50`, `text-blue-600`) instead of the theme-based CSS variables used in other tools. This creates visual inconsistency and doesn't properly integrate with the app's theme system.

The goal is to replace all hardcoded color classes with semantic theme variables (`background`, `foreground`, `primary`, `accent`, `card`, `border`, `muted-foreground`, etc.) to ensure consistent styling across all tools and proper theme integration.

## Relevant Files
Use these files to resolve the chore:

- **app/app/tools/qr-code-generator/page.tsx** - The main QR Code Generator page that needs styling updates. Contains hardcoded Tailwind classes that need to be replaced with theme variables.
- **app/app/tools/heic-to-jpeg/page.tsx** - Reference file showing the correct styling pattern with theme variables (e.g., `bg-gradient-to-b from-background to-secondary/20`, `text-foreground`, `bg-card`, `border-border`).
- **app/app/tools/pdf-merger/page.tsx** - Another reference file demonstrating consistent use of theme-based styling.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Container and Background Styling
- Replace the QR Code Generator's root container background class from `bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800` to match the pattern used in other tools: `bg-gradient-to-b from-background to-secondary/20`
- Update container padding and max-width to match: `container mx-auto px-4 py-16 sm:px-6 lg:px-8 max-w-4xl` (currently uses `max-w-7xl` and different padding)

### 2. Update Header Section Styling
- Replace "Back to Home" link text color classes from `text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100` to `text-muted-foreground hover:text-primary`
- Update the header icon color from `text-blue-600 dark:text-blue-400` to use primary color
- Replace heading text color from `text-gray-900 dark:text-white` to `text-foreground`
- Update description text from `text-gray-600 dark:text-gray-400` to `text-muted-foreground`
- Add the gradient underline decoration that other tools have: `<div className="mx-auto mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent"></div>`
- Restructure header to match the centered layout pattern from other tools

### 3. Update Card/Section Styling
- Replace all section backgrounds from `bg-white dark:bg-gray-800` to `bg-card`
- Replace all section borders from `border-gray-200 dark:border-gray-700` to `border-border`
- Ensure consistent border radius (`rounded-lg`) and shadow (`shadow-sm` if needed, though other tools don't use it)
- Update all section heading colors from `text-gray-900 dark:text-white` to `text-foreground`

### 4. Update Form Input Styling
- Replace textarea and text input background from `bg-white dark:bg-gray-900` to `bg-background`
- Replace input border colors from `border-gray-300 dark:border-gray-600` to `border-border`
- Update placeholder colors from `placeholder-gray-500 dark:placeholder-gray-400` to `placeholder-muted-foreground`
- Replace input text colors from `text-gray-900 dark:text-white` to `text-foreground`
- Update focus ring colors from `focus:ring-blue-500 dark:focus:ring-blue-400` to `focus:ring-primary`
- Replace error state borders from `border-red-500 dark:border-red-400` to `border-destructive`
- Update character counter colors to use `text-muted-foreground` for normal state and `text-destructive` for over-limit state

### 5. Update Radio Button and Label Styling
- Replace radio button colors from `text-blue-600 dark:text-blue-400` to use primary color or remove custom color (let Button component handle it)
- Update label text from `text-gray-900 dark:text-white` to `text-foreground`
- Replace hover states from `group-hover:text-blue-600 dark:group-hover:text-blue-400` to `group-hover:text-primary`
- Update helper text from `text-gray-500 dark:text-gray-400` to `text-muted-foreground`

### 6. Update Color Picker Styling
- Replace label colors from `text-gray-700 dark:text-gray-300` to `text-foreground`
- Update color input borders from `border-gray-300 dark:border-gray-600` to `border-border`
- Replace text input backgrounds from `bg-white dark:bg-gray-900` to `bg-background`

### 7. Update Warning and Alert Styling
- Replace contrast warning background from `bg-yellow-50 dark:bg-yellow-900/20` to a theme-appropriate warning style (check if there's a `warning` variant, otherwise use `bg-accent/20` or similar)
- Update warning border from `border-yellow-200 dark:border-yellow-700` to `border-accent` or appropriate theme color
- Replace warning text from `text-yellow-800 dark:text-yellow-300` to `text-foreground` or appropriate theme color
- Update warning icon color from `text-yellow-600 dark:text-yellow-400` to match

### 8. Update Advanced Options Styling
- Replace range slider background from `bg-gray-200 dark:bg-gray-700` to `bg-secondary`
- Update range slider accent from `accent-blue-600 dark:accent-blue-400` to `accent-primary`
- Replace helper text colors from `text-gray-500 dark:text-gray-400` to `text-muted-foreground`

### 9. Update Information Section Styling
- Replace section background from `bg-white dark:bg-gray-800` to `bg-card`
- Update border from `border-gray-200 dark:border-gray-700` to `border-border`
- Replace heading colors from `text-gray-900 dark:text-white` to `text-foreground`
- Update body text from `text-gray-600 dark:text-gray-400` to `text-muted-foreground`
- Replace nested borders from `border-gray-200 dark:border-gray-700` to `border-border`
- Update small text from `text-gray-500 dark:text-gray-400` to `text-muted-foreground`

### 10. Update Grid Layout
- Change the two-column grid from `lg:grid-cols-2` to a single column layout OR keep it but ensure consistent spacing with other tools
- Verify spacing classes match the pattern used in other tools

### 11. Run Validation Commands
Execute all validation commands listed below to ensure the chore is complete with zero regressions.

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `cd app && npm run build` - Build the app to ensure no TypeScript or build errors
- `cd app && npm run lint` - Run linter to ensure code quality
- Visual inspection: Start the dev server and verify that the QR Code Generator page styling now matches the HEIC to JPEG and PDF Merger pages in terms of:
  - Background gradients and colors
  - Card/section styling
  - Typography and spacing
  - Form input appearance
  - Button styling (should already be consistent via Button component)
  - Theme toggle integration (light/dark mode switching)
  - Header layout with centered title and gradient underline

## Notes
- The QR Code Generator has a two-column layout which differs from the single-column layouts of the other tools. This is acceptable as long as the individual component styling (cards, inputs, buttons, text colors) follows the same theme system.
- All color-related Tailwind classes should use semantic theme variables rather than hardcoded gray/blue/yellow color scales.
- The Button component from `@/components/ui/button` already uses theme variables, so button styling should remain unchanged.
- Pay special attention to the contrast warning message styling - ensure it fits within the theme system while remaining visually distinct as a warning.
- After completion, the page should seamlessly switch between light and dark modes using the ThemeToggle component without any hardcoded color class conflicts.
