# Commit and Push Changes

Commit all staged and unstaged changes and push to the current branch.

## Instructions

1. **Verify Current Branch**
   - Run `git branch --show-current` to get the current branch
   - Ensure we're NOT on master branch
   - If on master, abort with error message

2. **Show Current Status**
   - Run `git status` to show what will be committed
   - Run `git diff --stat` to show file changes summary

3. **Stage All Changes**
   - Run `git add .` to stage all changes

4. **Create Commit**
   - Use the commit message from $ARGUMENTS
   - Format the commit with Claude Code attribution:
     ```
     <commit message>

     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```
   - Use a HEREDOC to ensure proper formatting

5. **Push to Origin**
   - Run `git push -u origin <current-branch>` to push changes
   - If push fails, show error and suggest solutions

6. **Confirm Success**
   - Output: "✓ Changes committed and pushed successfully!"
   - Show branch name and commit message
   - Suggest next step: "Run /pr to create a pull request"

## Commit Message

$ARGUMENTS
