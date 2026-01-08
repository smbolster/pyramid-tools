# Implement the following plan

Follow the `Instructions` to implement the `Plan` then `Report` the completed work.

## Instructions

1. **Read Project Configuration**

   Read the `project-config.json` file in the `.claude/` directory to get:
   - `github.owner` - The GitHub owner (username or organization)
   - `github.repo` - The GitHub repository name

2. **Read the plan, think hard about the plan and implement the plan.**

3. **Track task progress in GitHub as you work (see GitHub Issue Tracking below).**

## GitHub Issue Tracking

### 1. Verify GitHub CLI Authentication

Before starting, verify GitHub CLI is authenticated:

```bash
gh auth status
```

If not authenticated, inform user to run `gh auth login`.

### 2. Get Issue Number from Spec

Read the spec file referenced in $ARGUMENTS and look for:

- `## GitHub Issue:` - Contains the issue number (e.g., `#123`)

If not found in the spec, query for open issues:

```bash
gh issue list --repo <github.owner>/<github.repo> --state open --limit 20
```

### 3. Add "In Progress" Comment

When starting implementation, add a comment to the issue:

```bash
gh issue comment <issue-number> --repo <github.owner>/<github.repo> --body "Starting implementation..."
```

### 4. Update Issue with Progress

As you complete tasks from the spec, you can optionally update the issue body to check off completed tasks. However, this is less critical in GitHub since issue bodies can't be easily updated via CLI - focus on the implementation.

### 5. Task Completion

When all tasks are complete:

1. Add a completion comment:
   ```bash
   gh issue comment <issue-number> --repo <github.owner>/<github.repo> --body "Implementation complete. Ready for PR."
   ```

2. Do NOT close the issue - it will be closed when the PR is merged (or via `/commit-with-pr`)

### 6. Task Flow

Follow this progression:

- **Open** - Issue created (by `/feature`, `/bug`, or `/chore`)
- **In Progress** - Comment added when starting work
- **Complete** - Comment added when done, PR created
- **Closed** - Closed via `/commit-with-pr` or when PR is merged

Work through tasks in the spec sequentially. Complete each step before moving to the next.

## Plan

$ARGUMENTS

## Report

- Summarize the work you've just done in a concise bullet point list.
- Report the files and total lines changed with `git diff --stat`
- Show the GitHub issue number that was worked on

## Cross-Project Summary

After implementation, check if this feature should be documented for other projects.

### 1. Determine if Cross-Project Relevant

Check if ANY of these apply:

- New shared utilities, helpers, or base classes were created
- New patterns were established that other projects should follow
- APIs, interfaces, or contracts changed that other projects consume
- The spec references a cross-project coordination spec in `specs/`
- New reusable components were built

If none apply, skip this section.

### 2. Write Implementation Summary

Create `specs/implementations/<feature-name>.md` with:

```md
# Implementation: <feature name>

## Project: <current project name>
## Date: <current date>
## Spec: <path to spec file>
## Issue: #<issue number>

## What Was Implemented

<bullet list of key changes>

## New Methods/APIs Created

| Method | File | Purpose |
|--------|------|---------|
| `ClassName.MethodName()` | `path/to/file` | <what it does> |

## Patterns Established

<describe any patterns other projects should follow when implementing similar features>

## For Other Projects

<specific notes about what other projects need to know, dependencies, or actions required>

## Files Changed

<paste output of git diff --stat>
```

### 3. Update Cross-Project Index

If `specs/index.md` exists:

1. Add entry to the implementations table
2. Link to the new implementation summary
3. Note which projects are affected
