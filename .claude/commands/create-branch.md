# Create Branch

Automatically creates and checks out a git branch for feature/chore/bug work.

## Usage

This command is typically called from `/feature`, `/chore`, or `/bug` commands, but can be used standalone:
- `/create-branch feature Add dark mode toggle`
- `/create-branch chore Update dependencies`
- `/create-branch bug Fix PDF preview loading`

## Instructions

1. **Parse Arguments**
   - First argument: `<type>` (must be: feature, chore, or bug)
   - Remaining arguments: `<description>` (the feature/chore/bug description)

2. **Check Current Branch**
   - Run `git branch --show-current` to get current branch name
   - Determine if we're on `master` or a `feature/*`, `chore/*`, or `bug/*` branch

3. **Branch Creation Logic**

   **If on master branch:**
   - Proceed to create new branch (skip to step 4)

   **If on feature/*, chore/*, or bug/* branch:**
   - Use the AskUserQuestion tool to ask the user:
     - Question: "You're currently on branch `{current_branch}`. How would you like to proceed?"
     - Options:
       - "Create new branch from master" (description: "Checkout master, pull latest, and create new {type} branch")
       - "Stay on current branch" (description: "Continue working on {current_branch} without creating a new branch")
   - If user chooses "Stay on current branch": Exit successfully without creating branch
   - If user chooses "Create new branch from master": Continue to step 4

4. **Slugify Description**
   - Convert description to lowercase
   - Replace spaces with hyphens
   - Remove special characters (keep only: a-z, 0-9, hyphens)
   - Remove leading/trailing hyphens
   - Example: "Add Dark Mode!" → "add-dark-mode"

5. **Create Branch from Master**
   - Checkout master: `git checkout master`
   - Pull latest changes: `git pull origin master`
   - Create and checkout new branch: `git checkout -b {type}/{slugified-description}`

6. **Confirm Success**
   - Output: "✓ Created and checked out branch: {type}/{slugified-description}"
   - The calling command (feature/chore/bug) will continue with its planning

## Arguments

$ARGUMENTS
