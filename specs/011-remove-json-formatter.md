# Chore: Remove JSON Formatter from Home Page

## Chore Plan Created: specs/011-remove-json-formatter.md

## Chore Description
Remove the JSON Formatter tool card from the home page. The JSON Formatter is currently listed in the tools array (`app/lib/tools.ts`) and appears as a tool card on the home page, but there is no actual implementation page for this tool (no `/tools/json-formatter` page exists). This chore involves removing the JSON Formatter entry from the tools configuration to clean up the home page and prevent users from clicking on a non-existent tool.

## Relevant Files
Use these files to resolve the chore:

- `app/lib/tools.ts` (lines 44-50) - Contains the tools array that defines all tool cards displayed on the home page. The JSON Formatter tool object needs to be removed from this array.
- `app/app/page.tsx` - The home page that renders the tool cards. No changes needed here as it dynamically renders from the tools array.
- `app/components/tool-card.tsx` - The component that renders individual tool cards. No changes needed here.

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### Remove JSON Formatter from Tools Array
- Open `app/lib/tools.ts`
- Locate the JSON Formatter tool object (lines 44-50)
- Delete the entire JSON Formatter object including:
  - The object definition
  - The trailing comma if it's not the last item
- Ensure the array syntax remains valid after removal
- Save the file

### Verify No Broken References
- Check that no other files import or reference the JSON Formatter tool specifically
- Confirm that the home page dynamically renders from the tools array and requires no additional changes
- Ensure the Color Picker tool (which comes after JSON Formatter in the array) is not affected

### Run Validation Commands
- Execute the validation commands listed below to ensure the chore is complete with zero regressions
- Fix any errors that arise from the validation commands
- Re-run validation until all commands pass successfully

## Validation Commands
Execute every command to validate the chore is complete with zero regressions.

- `cd app && npm run lint` - Run linting to validate code quality
- `cd app && npm run build` - Build the Next.js app to validate there are no build errors

## Notes
- The JSON Formatter tool has no actual implementation page (`/tools/json-formatter` does not exist), so removing it prevents users from clicking on a broken link
- The Color Picker tool also appears to have no implementation page, but it is not part of this chore
- After removal, the tools array will contain 8 tools instead of 9
- The home page grid layout will automatically adjust since it uses dynamic rendering
