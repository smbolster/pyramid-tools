# Bug Planning

## Description

Plan and create a new bug fix with GitHub integration.

### Options

- `--current-branch` - Use the current branch instead of creating a new bug branch
  - Example: `/bug --current-branch Fix login validation error`
  - Without this flag, a new branch will be created automatically

### Usage

```bash
# Create new bug branch and plan
/bug Fix navigation issue in Corporate Directory

# Use current branch for bug fix
/bug --current-branch Fix dropdown filter not clearing
```

## Branch Management

Check if `--current-branch` flag is present in $ARGUMENTS:

- **If `--current-branch` is NOT present:** Create a new branch for this bug fix
  - Execute: `/create-branch bug $ARGUMENTS`
  - This will create and checkout a new branch like `bug/fix-description`
  - Then proceed with planning below

- **If `--current-branch` IS present:** Skip branch creation
  - Use the current branch for the bug fix
  - Strip the `--current-branch` flag from $ARGUMENTS before using it
  - Proceed with planning below

Create a new plan in specs/\*.md to resolve the `Bug` using the exact specified markdown `Plan Format`. Follow the `Instructions` to create the plan.

## Instructions

1. **Read Project Configuration**

   Read the following files in the `.claude/` directory:
   - `project-config.json` - For GitHub settings and build commands
   - `project-context.md` - For relevant files and project structure

2. **Research and Plan**

   - You're writing a plan to resolve a bug, it should be thorough and precise so we fix the root cause and prevent regressions.
   - Create the plan in the `specs/*.md` file. Name it appropriately based on the `Bug` and prefix the spec with a 3 digit number in sequence, start with 001 if there are no numbered specs already.
   - Use the plan format below to create the plan.
   - Research the codebase to understand the bug, reproduce it, and put together a plan to fix it.
   - IMPORTANT: Replace every <placeholder> in the `Plan Format` with the requested value. Add as much detail as needed to fix the bug.
   - Use your reasoning model: THINK HARD about the bug, its root cause, and the steps to fix it properly.
   - IMPORTANT: Be surgical with your bug fix, solve the bug at hand and don't fall off track.
   - IMPORTANT: We want the minimal number of changes that will fix and address the bug.
   - Don't use decorators. Keep it simple.
   - If you need a new NuGet package, report it in the `Notes` section of the `Plan Format`.
   - Reference the `project-context.md` for relevant files to focus on.
   - Start your research by reading the `CLAUDE.md` file for project overview and architecture.

## GitHub Integration

After creating the spec file, create a Bug issue in GitHub.

### 1. Verify GitHub CLI Authentication

Run `gh auth status` to verify authentication. If not authenticated, inform user to run `gh auth login`.

### 2. Create Bug Issue

Create a Bug issue using the bug name and description from the spec:

```bash
gh issue create --repo <github.owner>/<github.repo> --title "<bug name>" --body "<issue body>" --label "bug"
```

The issue body should include:
- Bug description and root cause from spec
- Steps to reproduce
- Task checklist for the fix

Use a HEREDOC for the body to ensure proper formatting.

### 3. Extract Issue Number

- Extract the Issue number from the gh output
- Store this number for updating the spec

### 4. Update Spec with Issue Number

After creating the Bug issue, update the spec file with the GitHub Issue number:

- Replace `<issue-number>` in the `## GitHub Issue:` section with the actual Issue number
- This allows `/implement` and `/commit-with-pr` commands to reference the Bug directly

### 5. Confirm Success

After creating the issue:

- Output: "Bug issue created successfully in GitHub!"
- Show Issue number, title, and URL

### 6. STOP - Do Not Implement

**IMPORTANT:** After creating the spec and GitHub issue, STOP.

- Do NOT start implementing the bug fix
- Do NOT write any code
- Do NOT modify any source files

## Plan Format

```md
# Bug: <bug name>

## GitHub Issue: #<issue-number>

## Bug Plan Created: <bug filepath>

## Bug Description

<describe the bug in detail, including symptoms and expected vs actual behavior>

## Problem Statement

<clearly define the specific problem that needs to be solved>

## Solution Statement

<describe the proposed solution approach to fix the bug>

## Steps to Reproduce

<list exact steps to reproduce the bug>

## Root Cause Analysis

<analyze and explain the root cause of the bug>

## Relevant Files

Use these files to fix the bug:

<find and list the files that are relevant to the bug describe why they are relevant in bullet points. If there are new files that need to be created to fix the bug, list them in an h3 'New Files' section.>

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers plus bullet points. use as many h3 headers as needed to fix the bug. Order matters, start with the foundational shared changes required to fix the bug then move on to the specific changes required to fix the bug. Include tests that will validate the bug is fixed with zero regressions. Your last step should be running the `Validation Commands` to validate the bug is fixed with zero regressions.>

## Validation Commands

Execute every command to validate the bug is fixed with zero regressions.

<list commands from project-config.json validation array, plus any bug-specific validation commands>

## Notes

<optionally list any additional notes or context that are relevant to the bug that will be helpful to the developer>
```

## Bug

$ARGUMENTS
