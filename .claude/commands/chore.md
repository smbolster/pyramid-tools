# Chore Planning

## Description

Plan and create a new chore/task with GitHub integration.

### Options

- `--current-branch` - Use the current branch instead of creating a new chore branch
  - Example: `/chore --current-branch Update documentation for API endpoints`
  - Without this flag, a new branch will be created automatically

### Usage

```bash
# Create new chore branch and plan
/chore Update configuration files for new environment

# Use current branch for chore
/chore --current-branch Refactor service layer documentation
```

## Branch Management

Check if `--current-branch` flag is present in $ARGUMENTS:

- **If `--current-branch` is NOT present:** Create a new branch for this chore
  - Execute: `/create-branch chore $ARGUMENTS`
  - This will create and checkout a new branch like `chore/task-description`
  - Then proceed with planning below

- **If `--current-branch` IS present:** Skip branch creation
  - Use the current branch for the chore
  - Strip the `--current-branch` flag from $ARGUMENTS before using it
  - Proceed with planning below

Create a new plan in specs/\*.md to resolve the `Chore` using the exact specified markdown `Plan Format`. Follow the `Instructions` to create the plan.

## Instructions

1. **Read Project Configuration**

   Read the following files in the `.claude/` directory:
   - `project-config.json` - For GitHub settings and build commands
   - `project-context.md` - For relevant files and project structure

2. **Research and Plan**

   - You're writing a plan to resolve a chore, it should be simple but we need to be thorough and precise so we don't miss anything or waste time with any second round of changes.
   - Create the plan in the `specs/*.md` file. Name it appropriately based on the `Chore` and prefix the the spec with a 3 digit number in sequence, start with 001 if there are no numbered specs already.
   - Use the plan format below to create the plan.
   - Research the codebase and put together a plan to accomplish the chore.
   - IMPORTANT: Replace every <placeholder> in the `Plan Format` with the requested value. Add as much detail as needed to accomplish the chore.
   - Use your reasoning model: THINK HARD about the plan and the steps to accomplish the chore.
   - Reference the `project-context.md` for relevant files to focus on.
   - Start your research by reading the `CLAUDE.md` file for project overview and architecture.

## GitHub Integration

After creating the spec file, create a Task/Chore issue in GitHub.

### 1. Verify GitHub CLI Authentication

Run `gh auth status` to verify authentication. If not authenticated, inform user to run `gh auth login`.

### 2. Create Task Issue

Create a Task issue using the chore name and description from the spec:

```bash
gh issue create --repo <github.owner>/<github.repo> --title "<chore name>" --body "<issue body>" --label "chore"
```

The issue body should include:
- Chore description from spec
- Task checklist

Use a HEREDOC for the body to ensure proper formatting.

### 3. Extract Issue Number

- Extract the Issue number from the gh output
- Store this number for updating the spec

### 4. Update Spec with Issue Number

After creating the Task issue, update the spec file with the GitHub Issue number:

- Replace `<issue-number>` in the `## GitHub Issue:` section with the actual Issue number
- This allows `/implement` and `/commit-with-pr` commands to reference the Task directly

### 5. Confirm Success

After creating the issue:

- Output: "Task issue created successfully in GitHub!"
- Show Issue number, title, and URL

### 6. STOP - Do Not Implement

**IMPORTANT:** After creating the spec and GitHub issue, STOP.

- Do NOT start implementing the chore
- Do NOT write any code
- Do NOT modify any source files

## Plan Format

```md
# Chore: <chore name>

## GitHub Issue: #<issue-number>

## Chore Plan Created: <chore filepath>

## Chore Description

<describe the chore in detail>

## Relevant Files

Use these files to resolve the chore:

<find and list the files that are relevant to the chore describe why they are relevant in bullet points. If there are new files that need to be created to accomplish the chore, list them in an h3 'New Files' section.>

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers plus bullet points. use as many h3 headers as needed to accomplish the chore. Order matters, start with the foundational shared changes required to fix the chore then move on to the specific changes required to fix the chore. Your last step should be running the `Validation Commands` to validate the chore is complete with zero regressions.>

## Validation Commands

Execute every command to validate the chore is complete with zero regressions.

<list commands from project-config.json validation array, plus any chore-specific validation commands>

## Notes

<optionally list any additional notes or context that are relevant to the chore that will be helpful to the developer>
```

## Chore

$ARGUMENTS
