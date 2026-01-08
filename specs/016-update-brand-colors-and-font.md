# Chore: Update Brand Colors and Font to McKim & Creed Style

## GitHub Issue: #10

## Chore Plan Created: specs/016-update-brand-colors-and-font.md

## Chore Description

Update the Pyramid Tools application to use McKim & Creed brand colors and typography according to the 2021 Brand Refresh guidelines. The current styling uses green-based colors (oklch hue ~135) with Geist Sans/Mono fonts. This needs to be replaced with:

**Brand Colors:**
- Primary Purple: `#582D82` (oklch ~0.38 0.16 302) - Primary brand color, headings, main CTAs
- Primary Gray: `#343741` (oklch ~0.31 0.01 265) - Body text, secondary elements
- Secondary Purple: `#2E1A47` (oklch ~0.25 0.12 300) - Hover states, dark accents
- Accent Blue: `#00A9DF` (oklch ~0.68 0.14 220) - Links, highlights, secondary CTAs

**Typography:**
- Body Font: Open Sans (replacing Geist Sans)
- Keep monospace font for code-related content

## Relevant Files

Use these files to resolve the chore:

- `app/app/globals.css` - Contains all CSS custom properties for colors in `:root` and `.dark` selectors. This is the primary file for color updates.
- `app/app/layout.tsx` - Defines font imports (currently Geist, needs to change to Open Sans). Root layout that applies fonts to the body.

### New Files

None required - all changes are to existing files.

## Step by Step Tasks

### Step 1: Update Font Configuration in layout.tsx

- Replace `Geist` import with `Open_Sans` from `next/font/google`
- Update the CSS variable name from `--font-geist-sans` to `--font-open-sans`
- Keep or update the monospace font as needed (can keep Geist_Mono or replace)
- Update the body className to use the new font variable

### Step 2: Update Font References in globals.css

- Update `@theme inline` block to reference `--font-open-sans` instead of `--font-geist-sans`
- Keep the mono font reference as-is for code blocks

### Step 3: Update Light Mode Colors in globals.css (:root)

Replace the green-based oklch colors with McKim & Creed purple-based colors:

| CSS Variable | Current (Green) | New (Purple) | Notes |
|--------------|-----------------|--------------|-------|
| `--primary` | `oklch(0.62 0.15 135)` | `oklch(0.38 0.16 302)` | Primary Purple #582D82 |
| `--primary-foreground` | `oklch(0.99 0 0)` | `oklch(0.99 0 0)` | Keep white |
| `--secondary` | `oklch(0.96 0.005 135)` | `oklch(0.96 0.005 302)` | Light purple tint |
| `--secondary-foreground` | `oklch(0.145 0 0)` | `oklch(0.145 0 0)` | Keep dark |
| `--muted` | `oklch(0.96 0.005 135)` | `oklch(0.96 0.005 302)` | Light purple tint |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.556 0 0)` | Keep gray |
| `--accent` | `oklch(0.70 0.12 135)` | `oklch(0.68 0.14 220)` | Accent Blue #00A9DF |
| `--accent-foreground` | `oklch(0.99 0 0)` | `oklch(0.99 0 0)` | Keep white |
| `--border` | `oklch(0.90 0.005 135)` | `oklch(0.90 0.005 302)` | Light purple tint |
| `--input` | `oklch(0.90 0.005 135)` | `oklch(0.90 0.005 302)` | Light purple tint |
| `--ring` | `oklch(0.62 0.15 135)` | `oklch(0.38 0.16 302)` | Primary Purple |
| `--chart-1` | `oklch(0.62 0.15 135)` | `oklch(0.38 0.16 302)` | Primary Purple |
| `--sidebar-primary` | `oklch(0.62 0.15 135)` | `oklch(0.38 0.16 302)` | Primary Purple |
| `--sidebar-accent` | `oklch(0.96 0.005 135)` | `oklch(0.96 0.005 302)` | Light purple tint |
| `--sidebar-border` | `oklch(0.90 0.005 135)` | `oklch(0.90 0.005 302)` | Light purple tint |
| `--sidebar-ring` | `oklch(0.62 0.15 135)` | `oklch(0.38 0.16 302)` | Primary Purple |

### Step 4: Update Dark Mode Colors in globals.css (.dark)

Replace the green-based oklch colors with McKim & Creed purple-based colors:

| CSS Variable | Current (Green) | New (Purple) | Notes |
|--------------|-----------------|--------------|-------|
| `--primary` | `oklch(0.68 0.17 135)` | `oklch(0.50 0.15 302)` | Lighter purple for dark mode |
| `--primary-foreground` | `oklch(0.145 0 0)` | `oklch(0.99 0 0)` | White text on purple |
| `--secondary` | `oklch(0.269 0.02 135)` | `oklch(0.269 0.02 302)` | Dark purple tint |
| `--secondary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` | Keep white |
| `--muted` | `oklch(0.269 0.02 135)` | `oklch(0.269 0.02 302)` | Dark purple tint |
| `--accent` | `oklch(0.75 0.15 135)` | `oklch(0.70 0.14 220)` | Accent Blue |
| `--accent-foreground` | `oklch(0.145 0 0)` | `oklch(0.145 0 0)` | Keep dark |
| `--border` | `oklch(0.35 0.02 135)` | `oklch(0.35 0.02 302)` | Dark purple tint |
| `--input` | `oklch(0.30 0.02 135)` | `oklch(0.30 0.02 302)` | Dark purple tint |
| `--ring` | `oklch(0.68 0.17 135)` | `oklch(0.50 0.15 302)` | Primary Purple |
| `--chart-1` | `oklch(0.68 0.17 135)` | `oklch(0.50 0.15 302)` | Primary Purple |
| `--sidebar-primary` | `oklch(0.68 0.17 135)` | `oklch(0.50 0.15 302)` | Primary Purple |
| `--sidebar-accent` | `oklch(0.269 0.02 135)` | `oklch(0.269 0.02 302)` | Dark purple tint |
| `--sidebar-border` | `oklch(0.35 0.02 135)` | `oklch(0.35 0.02 302)` | Dark purple tint |
| `--sidebar-ring` | `oklch(0.68 0.17 135)` | `oklch(0.50 0.15 302)` | Primary Purple |

### Step 5: Validate Build and Lint

Run the validation commands to ensure no regressions:

```bash
cd app && npm run build
cd app && npm run lint
```

### Step 6: Visual Verification

Start the development server and visually verify:
- Light mode colors display correctly with purple theme
- Dark mode colors display correctly with purple theme
- Open Sans font is applied to body text
- All interactive elements (buttons, links, inputs) use appropriate brand colors
- Hover states use Secondary Purple or appropriate darker shades

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

```bash
cd app && npm run build
cd app && npm run lint
```

## Notes

### Color Conversion Reference

The oklch color space uses:
- L (lightness): 0-1
- C (chroma): 0-0.4 typical
- H (hue): 0-360 degrees

McKim & Creed brand colors converted to oklch:
- Primary Purple (#582D82): ~oklch(0.38 0.16 302)
- Primary Gray (#343741): ~oklch(0.31 0.01 265)
- Secondary Purple (#2E1A47): ~oklch(0.25 0.12 300)
- Accent Blue (#00A9DF): ~oklch(0.68 0.14 220)

### Font Considerations

- Open Sans is available on Google Fonts and is the brand standard for body text
- The existing font loading pattern in Next.js can be maintained, just swap the import
- Fallback stack should be: `'Open Sans', Arial, sans-serif`
