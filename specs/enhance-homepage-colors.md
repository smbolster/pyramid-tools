# Chore: Enhance Homepage with McKim & Creed Color Scheme

## Chore Description
Enhance the Pyramid Tools homepage by implementing a professional color scheme inspired by the McKim & Creed website (https://www.mckimcreed.com). The enhancement will replace the current grayscale theme with a vibrant green (#61a229) as the primary color, maintaining a clean, professional aesthetic with modern design principles. The color scheme will include proper light and dark mode variants, ensuring accessibility and visual hierarchy while creating a more engaging and polished user experience.

## Relevant Files
Use these files to resolve the chore:

- **app/app/globals.css** - Contains all CSS custom properties and theme variables. This is where the primary color transformation will occur. Currently uses grayscale oklch values that need to be replaced with green-based color scheme. Critical for establishing the new visual identity.

- **app/app/page.tsx** - Homepage layout component. May need minor adjustments to enhance visual hierarchy with the new color scheme, such as adding accent sections or improving spacing to complement the green theme.

- **app/components/tool-card.tsx** - Tool card component that uses primary colors for hover states and icon backgrounds. Will automatically inherit the new color scheme but may benefit from enhanced hover effects or additional visual polish.

- **app/app/layout.tsx** - Root layout containing metadata. No changes expected but should be reviewed to ensure consistency.

### New Files
No new files are required for this chore. All changes will be modifications to existing files.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Convert McKim & Creed Colors to OKLCH
- Research and convert the McKim & Creed color palette to OKLCH format for Tailwind CSS v4 compatibility
- Primary green #61a229 needs to be converted to OKLCH
- Calculate proper hover state (darker green #4e8221) in OKLCH
- Determine complementary grays (#898888, #b1a6a6) for borders and secondary elements
- Create a full color palette including:
  - Light mode primary, secondary, accent, muted, border colors
  - Dark mode variants that maintain proper contrast ratios
  - Ensure WCAG AA accessibility standards are met (4.5:1 for normal text, 3:1 for large text)

### 2. Update Global CSS Theme Variables
- Open `app/app/globals.css`
- Replace the `:root` light mode color variables:
  - Update `--primary` from grayscale to green OKLCH value (#61a229)
  - Update `--primary-foreground` to white for contrast on green buttons
  - Update `--accent` to use a lighter green tint for hover states
  - Update `--accent-foreground` accordingly
  - Update `--secondary` to use light gray (#f5f5f5 or similar)
  - Keep `--background` as white but ensure it's crisp
  - Update `--border` to use subtle gray (#e5e5e5 or similar)
  - Adjust `--muted` and `--muted-foreground` to complement the green
  - Update `--ring` (focus ring) to use the primary green
- Replace the `.dark` dark mode color variables:
  - Update `--primary` to a slightly lighter/more vibrant green for dark backgrounds
  - Ensure all dark mode colors maintain proper contrast
  - Update borders to be more subtle in dark mode
  - Adjust card and background colors to create proper depth
- Keep all sidebar, chart, and other utility colors consistent with the new theme

### 3. Enhance Homepage Visual Hierarchy
- Open `app/app/page.tsx`
- Consider adding a subtle background treatment:
  - Add a very light green tint to the background (#f8faf7 or similar)
  - Or add a subtle gradient from white to light green
- Enhance the header section:
  - Consider adding a green accent underline or decorative element below the title
  - Potentially add a subtle shadow or border to create depth
- Improve spacing and visual rhythm:
  - Ensure the header section has optimal padding
  - Verify grid gap is visually balanced with new colors
- Add any subtle visual enhancements that complement the professional green theme

### 4. Refine Tool Card Interactions
- Open `app/components/tool-card.tsx`
- Review hover states with new green color:
  - Verify `hover:border-primary` looks good with green
  - Check `group-hover:text-primary` creates proper emphasis
  - Ensure icon background `bg-primary/10` has good contrast
- Consider enhancing hover effects:
  - Potentially add a subtle green glow/shadow on hover
  - Verify scale transition (scale-105) works well with new colors
  - Check that category badges are visually distinct
- Ensure dark mode hover states are properly tuned
- Verify focus states (ring) are visible and accessible

### 5. Visual Quality Assurance
- Start development server with `cd app && npm run dev`
- Open http://localhost:3000 in browser
- Test light mode:
  - Verify primary green appears correctly
  - Check tool card hover states look professional
  - Ensure text has proper contrast and readability
  - Verify category badges are visible but not distracting
  - Test focus states with keyboard navigation
- Test dark mode (toggle system preference or browser dev tools):
  - Verify green works well on dark background
  - Check that all text remains readable
  - Ensure hover effects are visible
  - Verify borders and shadows create proper depth
- Test responsive design at various breakpoints
- Check for any visual inconsistencies or color clashes

### 6. Run Validation Commands
Execute every command to validate the chore is complete with zero regressions.

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `cd app && npm run lint` - Ensure no ESLint errors introduced by changes
- `cd app && npm run build` - Verify application builds successfully with new color scheme
- `cd app && npm run dev` - Start development server for manual visual inspection
- Visual validation checklist:
  - Homepage displays with green primary color (#61a229 equivalent in OKLCH)
  - Tool cards have green icon backgrounds and green hover states
  - Text contrast meets WCAG AA standards (check with browser dev tools contrast checker)
  - Dark mode green is vibrant but not overwhelming
  - All hover, focus, and active states are visually clear
  - Category badges are readable
  - Overall aesthetic is clean, professional, and modern
  - No console errors or warnings in browser DevTools

## Notes

### Color Conversion Reference
- McKim & Creed Green: #61a229
  - This is a vibrant, professional green suggesting growth and sustainability
  - In RGB: rgb(97, 162, 41)
  - Approximate OKLCH: oklch(0.62 0.15 135) - may need fine-tuning

### Design Philosophy
- The McKim & Creed website uses green very intentionally - primarily for CTAs and interactive elements
- Maintain generous whitespace for a clean, uncluttered look
- Use green as an accent, not overwhelmingly throughout the design
- The goal is professional and trustworthy, not flashy or overwhelming

### Accessibility Considerations
- Green on white should have sufficient contrast (check with tools)
- Avoid using green as the only indicator of interactive elements (use underlines, borders, etc.)
- Ensure focus states are clearly visible for keyboard navigation
- Test with browser accessibility tools to verify WCAG compliance

### Dark Mode Strategy
- Dark mode green should be slightly more vibrant/saturated than light mode
- Maintain the same professional aesthetic in dark mode
- Use deeper backgrounds and subtle borders to create hierarchy
- Ensure the green "pops" against dark backgrounds without causing eye strain

### Future Enhancements (Not in Scope)
- Adding animated gradient backgrounds
- Implementing theme toggle button
- Adding more complex visual effects or patterns
- Creating custom illustrations with the green color scheme
