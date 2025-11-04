# Feature: Dark Mode Toggle

## Feature Description

Add a dark mode toggle to the Pyramid Tools website that allows users to switch between light and dark color themes. The dark mode styles are already defined in the CSS, but there's currently no UI control to activate them. This feature will add a theme toggle button in the header that persists the user's preference across sessions and automatically applies the appropriate theme class to the HTML element. The implementation will provide a smooth, accessible theme switching experience that respects system preferences while allowing manual override.

## User Story

As a user of Pyramid Tools
I want to toggle between light and dark color themes
So that I can use the site comfortably in different lighting conditions and match my personal preference or system theme

## Problem Statement

The application already has a complete dark mode theme defined in `globals.css` with CSS variables for dark mode colors (lines 81-113), and many components already include dark mode styling variants. However, there is no user interface control to activate dark mode, meaning users cannot switch to the dark theme even though it's fully implemented at the CSS level. Users who prefer dark mode or work in low-light environments need a way to enable the dark theme, and the application should respect their system preferences while also allowing manual override.

## Solution Statement

Implement a client-side dark mode toggle system that:
- Adds a theme toggle button (sun/moon icon) to the header of all pages
- Detects and respects the user's system color scheme preference on first visit
- Applies or removes the `dark` class on the `<html>` element to activate dark mode
- Persists the user's theme choice in localStorage for consistency across sessions and page navigation
- Provides smooth transitions between themes with visual feedback
- Uses React Context API to manage theme state globally across the application
- Includes keyboard accessibility and clear visual indicators
- Works seamlessly with all existing components that already have dark mode styles
- Provides a consistent theme toggle experience on both the homepage and all tool pages

## Relevant Files

Use these files to implement the feature:

- **app/app/layout.tsx** - Root layout component (lines 20-34). Currently wraps children with font classes. Needs to be modified to include the ThemeProvider context and apply the theme class to the `<html>` element. This is where theme initialization and system preference detection will occur.

- **app/app/globals.css** - Global styles with dark mode CSS variables already defined (lines 81-113). The `.dark` class selector contains all dark theme color values. No changes needed to CSS, just need to apply the class to the HTML element.

- **app/app/page.tsx** - Homepage component (lines 4-28). Contains the main header with "Pyramid Tools" title. This is where the theme toggle button will be added to the header section.

- **app/app/tools/heic-to-jpeg/page.tsx** - Example tool page (lines 160-254). Shows the existing page structure with a header containing back link and title. The theme toggle should appear consistently on all tool pages, so this file demonstrates the pattern to follow.

- **app/app/tools/pdf-merger/page.tsx** - Another tool page that follows the same header pattern. Will need the theme toggle added.

- **app/components/ui/button.tsx** - Existing shadcn/ui button component. Will be used for the theme toggle button with variant styling.

- **app/lib/utils.ts** - Utility functions including the `cn` helper for class names. May be used for conditional theme-related classes.

### New Files

- **app/contexts/theme-context.tsx** - React Context provider for theme state management. Exports ThemeProvider component and useTheme hook. Handles:
  - Theme state (light, dark, system)
  - System preference detection using `window.matchMedia('(prefers-color-scheme: dark)')`
  - localStorage persistence with key 'pyramid-tools-theme'
  - Applying/removing 'dark' class on document.documentElement
  - Theme toggle function
  - Initial theme loading and hydration

- **app/components/theme-toggle.tsx** - Reusable theme toggle button component. Displays sun icon for light mode, moon icon for dark mode. Uses lucide-react icons (Sun, Moon). Includes:
  - Button with icon that changes based on current theme
  - Click handler to toggle theme
  - Accessible aria-label describing the action
  - Tooltip or visual feedback for current theme
  - Smooth icon transition animation

- **app/types/theme.ts** - TypeScript type definitions for theme system. Includes:
  - Theme type: 'light' | 'dark' | 'system'
  - ThemeContextType interface
  - Constants for theme values and storage keys

## Implementation Plan

### Phase 1: Foundation

1. Create TypeScript type definitions for theme system (theme types, context interface, constants)
2. Create the ThemeContext with React Context API for global theme state management
3. Implement theme detection logic for system preferences using `prefers-color-scheme` media query
4. Implement localStorage persistence for theme preference
5. Create theme toggle logic that applies/removes the `dark` class on the HTML element
6. Handle initial theme loading and prevent flash of unstyled content (FOUC)

### Phase 2: Core Implementation

1. Create the theme toggle button component with sun/moon icons
2. Integrate ThemeProvider into the root layout to wrap the entire application
3. Add theme toggle button to the homepage header
4. Add theme toggle button to all tool page headers (HEIC converter, PDF merger)
5. Implement smooth transitions between themes
6. Add visual feedback and hover states for the toggle button

### Phase 3: Integration

1. Test theme persistence across page navigation and browser sessions
2. Test system preference detection on first visit
3. Verify all existing components display correctly in both light and dark modes
4. Test theme toggle on all pages (homepage, all tool pages)
5. Validate accessibility features (keyboard navigation, screen reader announcements, focus indicators)
6. Test edge cases (localStorage disabled, system preference changes, rapid theme switching)
7. Verify no flash of unstyled content on initial page load

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

### 1. Create Type Definitions

- Create `app/types/theme.ts`
- Define `Theme` type as union: `'light' | 'dark' | 'system'`
- Define `ThemeContextType` interface with:
  - `theme`: current effective theme ('light' | 'dark')
  - `themePreference`: user preference including 'system' option
  - `setTheme`: function to change theme preference
  - `toggleTheme`: function to toggle between light and dark
- Define constants:
  - `THEME_STORAGE_KEY = 'pyramid-tools-theme'`
  - `DEFAULT_THEME = 'system'`
- Export all types and constants

### 2. Create Theme Context

- Create `app/contexts/theme-context.tsx`
- Import React hooks: useState, useEffect, useContext, createContext
- Create ThemeContext with createContext<ThemeContextType | undefined>
- Implement `ThemeProvider` component that:
  - Manages theme state (themePreference, effectiveTheme)
  - Detects system color scheme preference on mount using `window.matchMedia('(prefers-color-scheme: dark)')`
  - Loads saved theme from localStorage on initial render
  - Updates HTML element class when theme changes
  - Listens for system preference changes when theme is set to 'system'
  - Saves theme preference to localStorage when it changes
- Implement `setTheme` function to update theme preference
- Implement `toggleTheme` function to switch between light and dark
- Implement `useTheme` custom hook that:
  - Uses useContext to access ThemeContext
  - Throws error if used outside ThemeProvider
  - Returns theme context value
- Handle server-side rendering (SSR) safely by checking for `window` object
- Prevent flash of unstyled content by initializing theme before first render

### 3. Add Theme Script to Layout

- Open `app/app/layout.tsx`
- Add inline script tag in the `<html>` element before `<body>` to:
  - Check localStorage for saved theme
  - Check system preference if no saved theme
  - Apply 'dark' class immediately if needed
  - This prevents FOUC by applying theme before React hydrates
- Add script with `dangerouslySetInnerHTML` containing minified theme initialization code
- This script runs synchronously before page renders

### 4. Integrate ThemeProvider into Layout

- Import ThemeProvider in `app/app/layout.tsx`
- Wrap the `{children}` with `<ThemeProvider>`
- Ensure ThemeProvider is inside the `<body>` tag but wraps all page content
- The layout should now provide theme context to all pages

### 5. Create Theme Toggle Button Component

- Create `app/components/theme-toggle.tsx`
- Import Sun and Moon icons from lucide-react
- Import useTheme hook from theme context
- Import Button component
- Implement component that:
  - Uses useTheme to access current theme and toggle function
  - Displays Sun icon when in dark mode (clicking will go to light)
  - Displays Moon icon when in light mode (clicking will go to dark)
  - Has accessible aria-label: "Toggle theme" or "Switch to [opposite] mode"
  - Uses Button component with "ghost" or "outline" variant
  - Includes hover and focus states
  - Has smooth icon transition animation
- Add onClick handler that calls toggleTheme
- Make button size appropriate (icon size 5-6)

### 6. Add Theme Toggle to Homepage Header

- Open `app/app/page.tsx`
- Import ThemeToggle component
- Add theme toggle button to the header section
- Position it in the top-right corner of the page
- Consider adding a fixed or sticky position container for the toggle
- Ensure it doesn't interfere with the "Pyramid Tools" heading and description
- Test responsive positioning on mobile, tablet, and desktop

### 7. Create Shared Header Component (Optional but Recommended)

- Create `app/components/page-header.tsx` to standardize header across pages
- Include props for:
  - title: string
  - description: string
  - showBackLink: boolean (default true)
  - backHref: string (default "/")
- Integrate ThemeToggle in the header
- Style header with flex layout: back link on left, title/description center/left, theme toggle on right
- Make responsive for mobile (stack or adjust layout)

### 8. Add Theme Toggle to Tool Pages

- Open `app/app/tools/heic-to-jpeg/page.tsx`
- Import ThemeToggle component
- Add theme toggle to the header section (near the back link, top-right position)
- Ensure consistent positioning with homepage
- Test that toggle works correctly on this page

### 9. Add Theme Toggle to PDF Merger Page

- Open `app/app/tools/pdf-merger/page.tsx`
- Import ThemeToggle component
- Add theme toggle to the header section
- Match positioning and styling from HEIC converter page
- Test toggle functionality

### 10. Add Smooth Theme Transitions

- Open `app/app/globals.css`
- Add transition classes if not already present:
  - Add `transition-colors duration-200` to elements that change color with theme
  - Consider adding to body or universal selector
- Test that theme changes are smooth and not jarring
- Ensure transitions don't apply on initial page load (only on theme toggle)

### 11. Style Theme Toggle Button

- Refine theme toggle button styling for consistency with design system
- Ensure button has proper:
  - Padding and sizing
  - Hover state (slight background color change)
  - Focus state (ring outline)
  - Active state (pressed effect)
- Verify icon visibility in both light and dark modes
- Test button appearance on different backgrounds

### 12. Test Theme Persistence

- Test that theme choice persists after page refresh
- Test that theme persists when navigating between pages
- Test that theme persists in new browser tabs (same session)
- Verify localStorage is correctly storing the theme value
- Test behavior when localStorage is disabled (should fallback gracefully)

### 13. Test System Preference Detection

- Clear localStorage to reset theme
- Change system color scheme preference (OS settings)
- Verify app detects and applies system preference on first visit
- Test that system preference changes are detected in real-time when theme is set to 'system'
- Verify manual theme selection overrides system preference

### 14. Test All Pages in Both Themes

- Homepage:
  - Verify header, title, description, tool cards render correctly
  - Check colors, borders, shadows, hover states
- HEIC to JPEG page:
  - Test upload zone, file list, buttons, info section
  - Verify all UI elements are visible and styled correctly
- PDF Merger page:
  - Test all UI components in both themes
  - Check for any styling issues or poor contrast
- Verify all existing dark mode styles work as expected

### 15. Test Edge Cases

- Test rapid theme toggling (multiple clicks)
- Test theme toggle during page navigation
- Test with JavaScript disabled (graceful degradation)
- Test with localStorage quota exceeded
- Test with system preference changing while app is open
- Test theme in incognito/private browsing mode
- Test initial load to ensure no flash of unstyled content

### 16. Accessibility Testing

- Test keyboard navigation:
  - Tab to theme toggle button
  - Press Enter or Space to toggle theme
- Test with screen reader:
  - Verify aria-label is announced
  - Verify theme change is announced (consider aria-live region)
- Test focus indicators:
  - Visible focus ring on theme toggle button
- Verify sufficient color contrast in both themes:
  - Text on backgrounds meets WCAG AA standards
  - Interactive elements are clearly visible
- Test with browser zoom at 200%

### 17. Performance Testing

- Verify theme switching is instant with no lag
- Check that theme initialization doesn't block page render
- Verify no console errors or warnings
- Check that theme context doesn't cause unnecessary re-renders
- Test on slower devices/connections

### 18. Final Polish

- Ensure theme toggle icon animations are smooth
- Verify consistent positioning across all pages
- Check responsive behavior on mobile devices
- Ensure theme toggle doesn't overlap with other UI elements
- Add tooltips if helpful (optional)
- Consider adding keyboard shortcut (optional, e.g., Ctrl+Shift+D)

### 19. Documentation

- Add comments to theme context explaining key logic
- Document theme system in code comments
- Ensure type definitions are clear and well-documented

### 20. Run Validation Commands

Execute validation commands to ensure the feature works correctly with zero regressions.

## Testing Strategy

### Unit Tests

Due to the client-side nature of this application and no existing testing framework, formal unit tests are not included. However, if a testing framework is added in the future, consider testing:
- Theme context state management (setTheme, toggleTheme)
- localStorage read/write operations
- System preference detection logic
- Theme class application to HTML element

### Integration Tests

Manual integration tests to perform:
- Theme toggle on homepage persists when navigating to tool pages
- Theme toggle on tool pages persists when navigating back to homepage
- System preference detection works on first visit
- Theme persists across browser sessions
- Theme context provides correct values to all consuming components

### Edge Cases

- **No localStorage**: Theme should fallback to system preference or default light mode
- **System preference changes**: App should react if theme is set to 'system'
- **Rapid toggling**: Multiple quick clicks should not break theme state
- **Page navigation during transition**: Theme should remain consistent
- **Incognito mode**: Theme should work but not persist across sessions
- **SSR/Hydration**: No flash of unstyled content on initial page load
- **Slow connections**: Theme should apply immediately even if other resources are loading
- **Multiple tabs**: Theme changes should not conflict between tabs (each tab maintains its own state)

## Acceptance Criteria

1. **Theme Toggle Button**:
   - Theme toggle button appears in the header on all pages (homepage and all tool pages)
   - Button displays sun icon in dark mode, moon icon in light mode
   - Button is clearly visible and accessible in both themes
   - Button has proper hover, focus, and active states

2. **Theme Switching**:
   - Clicking the toggle button switches between light and dark themes immediately
   - Theme switch is smooth with subtle transitions (no jarring color jumps)
   - All UI elements update correctly to reflect the new theme
   - No flash of unstyled content occurs when switching themes

3. **Persistence**:
   - User's theme choice persists across page navigation
   - Theme persists across browser sessions (stored in localStorage)
   - Theme persists when opening new tabs in the same browser session
   - Graceful fallback when localStorage is unavailable

4. **System Preference**:
   - On first visit (no saved preference), app detects and applies system color scheme preference
   - When theme is set to 'system', app responds to system preference changes in real-time
   - Manual theme selection overrides system preference

5. **Visual Design**:
   - All existing components display correctly in both light and dark modes
   - Color contrast meets WCAG AA standards in both themes
   - Text, borders, shadows, and backgrounds are clearly visible in both themes
   - Dark mode uses the pre-defined CSS variables (no new colors introduced)

6. **Accessibility**:
   - Theme toggle is keyboard accessible (Tab to focus, Enter/Space to activate)
   - Button has descriptive aria-label
   - Focus indicator is clearly visible
   - Screen readers can identify and activate the toggle
   - Theme toggle does not interfere with other keyboard navigation

7. **Performance**:
   - Theme switching happens instantly with no perceptible lag
   - No flash of unstyled content (FOUC) on initial page load
   - Theme initialization doesn't block page rendering
   - No console errors or warnings related to theme system

8. **Cross-Page Consistency**:
   - Theme toggle appears in the same position on all pages
   - Theme state is consistent across all pages
   - Theme persists when navigating between homepage and tool pages

9. **Edge Case Handling**:
   - App handles localStorage being disabled gracefully
   - App handles rapid theme toggling without breaking
   - App handles system preference changes while running
   - No issues in incognito/private browsing mode

10. **Code Quality**:
    - TypeScript types are properly defined
    - Theme context is properly typed and documented
    - Code follows existing patterns and conventions
    - No unnecessary re-renders or performance issues

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

- `cd app && npm run lint` - Run linting to validate code quality. Must complete with no errors.
- `cd app && npm run build` - Build the Next.js app to validate there are no TypeScript errors, type checking issues, or build failures. Must complete successfully with no errors.
- `cd app && npm run dev` - Start the development server and manually test the dark mode feature:
  - Navigate to http://localhost:3000
  - Verify theme toggle button appears in the header
  - Click theme toggle and verify smooth transition to dark mode
  - Verify all UI elements (header, cards, text, borders) display correctly in dark mode
  - Click toggle again to return to light mode
  - Navigate to /tools/heic-to-jpeg and verify theme persists
  - Verify theme toggle appears on the tool page
  - Toggle theme on tool page and verify it works
  - Navigate back to homepage and verify theme still persists
  - Refresh the page and verify theme persists across refresh
  - Open browser DevTools and check localStorage for 'pyramid-tools-theme' key
  - Clear localStorage and refresh to test system preference detection
  - Test keyboard navigation: Tab to theme toggle, press Enter to toggle
  - Test in different browsers (Chrome, Firefox, Safari, Edge)
  - Verify no console errors appear during any operation
  - Test on mobile device or with responsive design mode

## Notes

### Implementation Approach: Context API vs. Other Solutions

- **React Context API** is recommended for this implementation because:
  - It's built into React (no additional dependencies)
  - Perfect for global state like theme that affects entire app
  - Simple to implement and maintain
  - Works well with Next.js App Router
  - Avoids prop drilling

- Alternative approaches not chosen:
  - **next-themes library**: Would work but adds external dependency
  - **Zustand or Redux**: Overkill for simple theme state
  - **URL parameter or route**: Poor UX, not persistent

### Preventing Flash of Unstyled Content (FOUC)

Critical to inject a synchronous script in the HTML before React hydrates to:
1. Read theme from localStorage
2. Check system preference if no saved theme
3. Apply 'dark' class immediately
4. This happens before any content renders

Example pattern:
```html
<script>
  (function() {
    const theme = localStorage.getItem('pyramid-tools-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && systemDark)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

### Existing Dark Mode Support

The application already has excellent dark mode support:
- **globals.css** (lines 81-113): Complete dark mode CSS variables defined
- **tool-card.tsx** (lines 23, 27): Dark mode styles already implemented
- All components use CSS variables that automatically adapt

This means we only need to:
1. Add the toggle UI
2. Manage the 'dark' class on the HTML element
3. Persist the preference

### System Preference Handling

The media query `(prefers-color-scheme: dark)` detects system preference:
```javascript
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
const systemPrefersDark = darkModeQuery.matches;

// Listen for changes
darkModeQuery.addEventListener('change', (e) => {
  if (themePreference === 'system') {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});
```

### Browser Compatibility

- CSS custom properties: Supported in all modern browsers
- localStorage: Supported in all modern browsers (IE8+)
- matchMedia: Supported in all modern browsers
- prefers-color-scheme: Supported in Chrome 76+, Firefox 67+, Safari 12.1+

### Future Enhancements

- **Three-way toggle**: Add 'system' as a third option (light, dark, system) with a tri-state toggle or dropdown
- **Keyboard shortcut**: Add Ctrl+Shift+D or similar to toggle theme
- **Smooth icon animation**: Animate the sun/moon icon transition with rotation or fade
- **Theme preview**: Show a preview of the theme before applying
- **Per-page themes**: Allow users to set different themes for different tools (advanced)
- **Custom color schemes**: Allow users to customize colors within light/dark themes
- **Accessibility mode**: High contrast variant of light/dark themes

### Design Considerations

- **Toggle position**: Top-right corner of header is standard UX pattern
- **Icon choice**: Sun = light mode, Moon = dark mode (industry standard)
- **Transition duration**: 200ms is fast enough to feel instant but slow enough to be smooth
- **Button style**: Ghost or outline variant fits better than filled in header context
- **Mobile positioning**: Consider fixed or sticky positioning for easy access on mobile
- **Visual feedback**: Brief animation or ripple effect on click enhances UX (optional)
