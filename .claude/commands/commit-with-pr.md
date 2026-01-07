# Commit and Push Changes

Commit all staged and unstaged changes, push to the current branch and create a pull request.

## Instructions

1. **Read Project Configuration**

   Read `.claude/project-config.json` to get:
   - `github.owner` - GitHub owner (username or organization)
   - `github.repo` - GitHub repository name
   - `github.baseBranch` - The base branch name

2. **Verify Current Branch**

   - Run `git branch --show-current` to get the current branch
   - Ensure we're NOT on the base branch
   - If on base branch, abort with error message

3. **Show Current Status**

   - Run `git status` to show what will be committed
   - Run `git diff --stat` to show file changes summary

4. **Stage All Changes**

   - Run `git add .` to stage all changes

5. **Get Issue Number**

   - Look for a spec file in `specs/` directory that matches the current branch name
   - If found, extract the issue number from:
     - `## GitHub Issue:` - For feature specs (created by `/feature`)
     - `## GitHub Issue:` - For chore specs (created by `/chore`)
     - `## GitHub Issue:` - For bug specs (created by `/bug`)
   - If not found in spec, query for open issues:
     ```bash
     gh issue list --repo <github.owner>/<github.repo> --state open --limit 20
     ```
   - Ask the user which issue number to use if multiple found, or confirm if only one matches
   - Store the issue number for use in the commit message

6. **Create Commit**

   - Prepend the issue reference to the commit message in the format `#<issue-number>`
   - Format the commit with Claude Code attribution:

     ```
     #<issue-number> <commit message>

     Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```

   - Use a HEREDOC to ensure proper formatting

7. **Push to Origin**

   - Run `git push -u origin <current-branch>` to push changes
   - If push fails, show error and suggest solutions

8. **Confirm Success**

   - Output: "Changes committed and pushed successfully!"
   - Show branch name and commit message

9. **Close Issue in GitHub**

   - Use the issue number obtained in step 5
   - Close the issue with a comment:
     ```bash
     gh issue close <issue-number> --repo <github.owner>/<github.repo> --comment "Resolved in this branch. PR incoming."
     ```
   - Output: "Issue #<id> closed in GitHub"

10. **Create Pull Request**
   - Run the /pr command to create the pull request

## Commit Message

$ARGUMENTS
