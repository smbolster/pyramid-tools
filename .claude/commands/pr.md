# Create Pull Request

Create a GitHub pull request for the current branch using the GitHub CLI.

## Instructions

1. **Verify Prerequisites**
   - Check that `gh` CLI is installed (run `gh --version`)
   - If not installed, inform user to install: `brew install gh`
   - Check authentication status with `gh auth status`
   - If not authenticated, inform user to run: `gh auth login`

2. **Verify Current Branch**
   - Run `git branch --show-current` to get current branch
   - Ensure we're NOT on master branch
   - If on master, abort with error message

3. **Generate PR Title**
   - If $ARGUMENTS is provided, use it as the PR title
   - If not provided, auto-generate from branch name:
     - Remove prefix (feature/, chore/, bug/)
     - Replace hyphens with spaces
     - Capitalize first letter of each word

4. **Gather Information for Description**
   - Run `git log master..HEAD --pretty=format:"- %s"` to get commits
   - Look for related spec file in specs/ directory that matches branch name
   - Get current branch type (feature/chore/bug)

5. **Build PR Description**
   ```markdown
   ## Summary

   This <type> branch includes the following changes:

   ### Commits
   <commit list>

   ### Related Spec (if found)
   See `specs/<spec-file>` for detailed planning.

   ## Test Plan
   - [ ] Tested locally
   - [ ] Linting passed
   - [ ] Build succeeded

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```

6. **Create Pull Request**
   - Use `gh pr create --title "<title>" --body "<description>"`
   - Use HEREDOC for the body to ensure proper formatting
   - If $ARGUMENTS contains "--draft", add `--draft` flag

7. **Confirm Success**
   - Extract and display the PR URL from gh output
   - Output: "✓ Pull request created successfully!"
   - Show branch name, PR title, and URL

## Arguments

$ARGUMENTS
