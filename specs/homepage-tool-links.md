# Chore: Create Homepage with Tool Links

## Chore Description
Create a homepage that displays a collection of tool links presented as icons with tool names. Each tool should be clickable and represented visually with an icon and descriptive label. The first example tool is "HEIC to JPEG". The homepage should be clean, responsive, and use the existing Next.js + TypeScript + Tailwind CSS + shadcn/ui stack.

## Relevant Files
Use these files to resolve the chore:

- **app/app/page.tsx** - Main homepage component that currently displays the Next.js starter template. This needs to be completely redesigned to show a grid/list of tool links with icons and names.
- **app/app/layout.tsx** - Root layout component. Metadata needs to be updated to reflect "Pyramid Tools" branding instead of generic "Create Next App".
- **app/components/ui/button.tsx** - Existing shadcn/ui button component that can be used or adapted for tool cards/links.
- **app/lib/utils.ts** - Utility functions for className merging, will be used by new components.
- **app/app/globals.css** - Global styles with Tailwind CSS and theme variables. May need minor additions for tool card styling.
- **app/package.json** - Dependencies list. Includes lucide-react for icons, which is perfect for tool icons.

### New Files
- **app/components/tool-card.tsx** - New component to display individual tool cards with icon, name, and link. This will be a reusable component for each tool.
- **app/lib/tools.ts** - Configuration file to define available tools with their metadata (name, icon, description, route/URL).
- **app/public/icons/** - Directory for custom tool icons if needed (though lucide-react provides many icons).

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Update Application Metadata
- Open `app/app/layout.tsx`
- Change the title from "Create Next App" to "Pyramid Tools"
- Update the description to reflect "A collection of useful web-based tools"
- This establishes the proper branding for the application

### 2. Create Tools Configuration File
- Create `app/lib/tools.ts`
- Define a TypeScript interface for tool metadata including:
  - `id`: unique identifier
  - `name`: display name (e.g., "HEIC to JPEG")
  - `description`: brief description of what the tool does
  - `icon`: lucide-react icon name
  - `href`: route or URL to the tool
  - `category`: optional category for future filtering
- Export an array of tools starting with HEIC to JPEG as the first example
- Add placeholder entries for 3-5 additional tools to demonstrate the layout
- This provides a centralized, scalable way to manage tool definitions

### 3. Create Tool Card Component
- Create `app/components/tool-card.tsx`
- Build a reusable component that accepts tool metadata as props
- Use shadcn/ui button or create a custom card design with:
  - Icon displayed prominently (using lucide-react)
  - Tool name as heading
  - Optional brief description
  - Hover effects for interactivity
  - Proper accessibility attributes (aria-label, role, etc.)
- Make it responsive for mobile, tablet, and desktop viewports
- Use Tailwind CSS classes consistent with the existing design system
- Implement as a Link or clickable card that navigates to the tool route

### 4. Redesign Homepage Layout
- Open `app/app/page.tsx`
- Remove all existing starter template content
- Import the ToolCard component and tools configuration
- Create a new layout with:
  - Header section with "Pyramid Tools" title and tagline/description
  - Main content area with a responsive grid of tool cards
  - Use CSS Grid or Flexbox for layout (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 or similar)
  - Proper spacing and padding throughout
- Map over the tools array to render ToolCard components
- Ensure dark mode compatibility with existing dark: classes
- Keep the layout clean and focused on the tools

### 5. Test Visual Design and Responsiveness
- Start the development server with `cd app && npm run dev`
- Verify the homepage displays correctly at various breakpoints:
  - Mobile (320px-640px): single column
  - Tablet (641px-1024px): two columns
  - Desktop (1025px+): three or more columns
- Check dark mode toggle works properly
- Verify all tool cards are visible and clickable
- Ensure icons load correctly from lucide-react
- Test keyboard navigation and accessibility

### 6. Validation Commands
Execute every command to validate the chore is complete with zero regressions.

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `cd app && npm run lint` - Ensure no ESLint errors in the new code
- `cd app && npm run build` - Verify the application builds successfully without errors
- `cd app && npm run dev` - Start dev server and manually verify the homepage displays tool cards with icons correctly
- Visual inspection: Open http://localhost:3000 and verify:
  - Homepage shows "Pyramid Tools" branding
  - Tool cards display in a responsive grid
  - HEIC to JPEG tool is visible with an appropriate icon
  - All cards have hover effects
  - Dark mode works correctly
  - No console errors in browser DevTools

## Notes
- The project uses Next.js 16 with the App Router, so all components should be React Server Components by default unless client interactivity is needed
- lucide-react is already installed and provides 1000+ icons - use appropriate icons for each tool (e.g., ImageIcon, FileImageIcon, etc.)
- The existing color scheme and design system in globals.css should be maintained for consistency
- Tool routes (href) can be placeholder routes for now (e.g., `/tools/heic-to-jpeg`) - actual tool functionality will be implemented separately
- Consider adding a subtle animation or transition effect on hover for better UX
- Future enhancements could include: search/filter functionality, tool categories, favorites, recently used tools
