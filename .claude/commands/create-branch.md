# Create Branch

Automatically creates and checks out a git branch for feature/chore/bug work.

## Usage

This command is typically called from `/feature`, `/chore`, or `/bug` commands, but can be used standalone:

- `/create-branch feature Add dark mode toggle`
- `/create-branch chore Update dependencies`
- `/create-branch bug Fix PDF preview loading`

## Instructions

1. **Read Project Configuration**

   Read the `project-config.json` file in the `.claude/` directory to get:
   - `github.baseBranch` - The base branch to create from (e.g., `main` or `master`)

2. **Parse Arguments**

   - First argument: `<type>` (must be: feature, chore, or bug)
   - Remaining arguments: `<description>` (the feature/chore/bug description)

3. **Check Current Branch**

   - Run `git branch --show-current` to get current branch name
   - Determine if we're on the base branch or a `feature/*`, `chore/*`, or `bug/*` branch

4. **Branch Creation Logic**

   **If on base branch:**

   - Proceed to create new branch (skip to step 5)

   **If on feature/*, chore/*, or bug/* branch:**

   - Use the AskUserQuestion tool to ask the user:
     - Question: "You're currently on branch `{current_branch}`. How would you like to proceed?"
     - Options:
       - "Create new branch from {baseBranch}" (description: "Checkout {baseBranch}, pull latest, and create new {type} branch")
       - "Stay on current branch" (description: "Continue working on {current_branch} without creating a new branch")
   - If user chooses "Stay on current branch": Exit successfully without creating branch
   - If user chooses "Create new branch": Continue to step 5

5. **Slugify Description**

   - Convert description to lowercase
   - Replace spaces with hyphens
   - Remove special characters (keep only: a-z, 0-9, hyphens)
   - Remove leading/trailing hyphens
   - Example: "Add Dark Mode!" -> "add-dark-mode"

6. **Create Branch from Base**

   - Checkout base branch: `git checkout {baseBranch}`
   - Pull latest changes: `git pull origin {baseBranch}`
   - Create and checkout new branch: `git checkout -b {type}/{slugified-description}`

7. **Confirm Success**
   - Output: "Created and checked out branch: {type}/{slugified-description}"
   - The calling command (feature/chore/bug) will continue with its planning

## Arguments

$ARGUMENTS
