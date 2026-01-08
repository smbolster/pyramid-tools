# Create Pull Request

Create a GitHub pull request for the current branch using the GitHub CLI.

## Instructions

1. **Read Project Configuration**

   Read `.claude/project-config.json` to get:
   - `github.owner` - GitHub owner (username or organization)
   - `github.repo` - GitHub repository name
   - `github.baseBranch` - The target branch for the PR
   - `build.solution` - Solution file name for test plan

2. **Verify GitHub CLI Authentication**

   - Run `gh auth status` to verify authentication
   - If not authenticated, inform user to run `gh auth login`

3. **Verify Current Branch**

   - Run `git branch --show-current` to get current branch
   - Ensure we're NOT on the base branch
   - If on base branch, abort with error message

4. **Push Current Branch**

   - Ensure current branch is pushed to remote: `git push -u origin <current-branch>`
   - If already pushed and up to date, continue
   - If push fails, abort with error message

5. **Generate PR Title**

   - If $ARGUMENTS is provided, use it as the PR title
   - If not provided, auto-generate from branch name:
     - Remove prefix (feature/, chore/, bug/)
     - Replace hyphens with spaces
     - Capitalize first letter of each word

6. **Gather Information for Description**

   - Run `git log <baseBranch>..HEAD --pretty=format:"- %s"` to get commits
   - Look for related spec file in specs/ directory that matches branch name
   - Get current branch type (feature/chore/bug)

7. **Build PR Description**

   ```markdown
   ## Summary

   This <type> branch includes the following changes:

   ### Commits

   <commit list>

   ### Related Spec (if found)

   See `specs/<spec-file>` for detailed planning.

   ## Test Plan

   - [ ] Tested locally
   - [ ] Build succeeded: `<build.buildCommand from config>`
   - [ ] Validated changes align with project structure

   Generated with [Claude Code](https://claude.com/claude-code)
   ```

8. **Create Pull Request**

   - Use `gh pr create --title "<title>" --body "<description>" --base <baseBranch>`
   - Use HEREDOC for the body to ensure proper formatting
   - If $ARGUMENTS contains "--draft", add `--draft` flag

9. **Confirm Success**
   - Extract and display the PR URL from gh output
   - Output: "Pull request created successfully!"
   - Show branch name, PR title, and URL

## Arguments

$ARGUMENTS
