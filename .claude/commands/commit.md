# Commit and Push Changes

Commit all staged and unstaged changes and push to the current branch.

## Instructions

1. **Read Project Configuration**

   Read `.claude/project-config.json` to get:
   - `github.baseBranch` - The base branch name (to ensure we're not on it)

2. **Verify Current Branch**

   - Run `git branch --show-current` to get the current branch
   - Ensure we're NOT on the base branch (from config)
   - If on base branch, abort with error message

3. **Show Current Status**

   - Run `git status` to show what will be committed
   - Run `git diff --stat` to show file changes summary

4. **Stage All Changes**

   - Run `git add .` to stage all changes

5. **Create Commit**

   - Use the commit message from $ARGUMENTS
   - Format the commit with Claude Code attribution:

     ```
     <commit message>

     Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```

   - Use a HEREDOC to ensure proper formatting

6. **Push to Origin**

   - Run `git push -u origin <current-branch>` to push changes
   - If push fails, show error and suggest solutions

7. **Confirm Success**
   - Output: "Changes committed and pushed successfully!"
   - Show branch name and commit message
   - Suggest next step: "Run /pr to create a pull request"

## Commit Message

$ARGUMENTS
