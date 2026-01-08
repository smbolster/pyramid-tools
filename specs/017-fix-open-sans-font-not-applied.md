# Bug: Open Sans font not applied to body text

## GitHub Issue: #11

## Bug Plan Created: specs/017-fix-open-sans-font-not-applied.md

## Bug Description

The site is supposed to use Open Sans as the body font according to the McKim & Creed brand guidelines (spec 016), but the font is not being applied. Despite the font being correctly loaded via Next.js Google Fonts and the CSS variable being properly defined, the browser falls back to system default fonts instead of displaying Open Sans.

## Problem Statement

The Open Sans font is loaded and the CSS variable `--font-open-sans` is correctly set up, but the Tailwind `font-sans` utility class that would apply the font family is never used on the body element. The body only has `bg-background text-foreground` applied in the CSS base layer, missing the `font-sans` class.

## Solution Statement

Add `font-sans` to the body element's Tailwind classes in the `globals.css` base layer. This will apply `font-family: var(--font-sans)` which resolves to `var(--font-open-sans)`, correctly using the loaded Open Sans font.

## Steps to Reproduce

1. Start the development server with `cd app && npm run dev`
2. Open the site in a browser
3. Inspect the body element in DevTools
4. Observe that no `font-family` style is applied to the body
5. Notice the browser is using system default fonts instead of Open Sans

## Root Cause Analysis

In `app/app/globals.css`, the base layer styles for the body element are defined as:

```css
@layer base {
  body {
    @apply bg-background text-foreground;
  }
}
```

While the font variable is correctly configured in the `@theme inline` block:
```css
--font-sans: var(--font-open-sans);
```

The `font-sans` utility class is never applied to the body, so Tailwind never generates the `font-family` CSS property for the body element. The Open Sans font is loaded by Next.js but never used.

## Relevant Files

Use these files to fix the bug:

- `app/app/globals.css` - Contains the base layer styles where `font-sans` needs to be added to the body selector. Lines 115-122 contain the `@layer base` block.
- `app/app/layout.tsx` - Contains the font loading and CSS variable setup. Already correctly configured (lines 6-14 and line 46). No changes needed here.

## Step by Step Tasks

### Step 1: Add font-sans to body in globals.css

- Open `app/app/globals.css`
- Locate the `@layer base` block (lines 115-122)
- Update the body selector to include `font-sans`:
  ```css
  @layer base {
    * {
      @apply border-border outline-ring/50;
    }
    body {
      @apply bg-background text-foreground font-sans;
    }
  }
  ```

### Step 2: Validate Build and Lint

Run the validation commands to ensure no regressions:

```bash
cd app && npm run build
cd app && npm run lint
```

### Step 3: Visual Verification

Start the development server and verify:
- Open Sans font is now applied to body text
- Inspect the body element in DevTools to confirm `font-family` includes Open Sans
- All text throughout the site displays in Open Sans

## Validation Commands

Execute every command to validate the bug is fixed with zero regressions.

```bash
cd app && npm run build
cd app && npm run lint
```

## Notes

- This is a one-line fix that was missed in the original brand colors/font update (spec 016)
- The fix only affects `globals.css` - no other files need modification
- The font loading in `layout.tsx` is already correct and does not need changes
