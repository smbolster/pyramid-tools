# Feature Planning

First, create a new branch for this feature by calling the create-branch command:

- Execute: `/create-branch feature $ARGUMENTS`
- This will create and checkout a new branch like `feature/feature-description`
- Then proceed with planning below

Create a new plan in specs/\*.md to implement the `Feature` using the exact specified markdown `Plan Format`. Follow the `Instructions` to create the plan.

## Instructions

1. **Read Project Configuration**

   Read the following files in the `.claude/` directory:
   - `project-config.json` - For GitHub settings and build commands
   - `project-context.md` - For relevant files and project structure

2. **Research and Plan**

   - You're writing a plan to implement a net new feature that will add value to the application.
   - Create the plan in the `specs/*.md` file. Name it appropriately based on the `Feature` and prefix the spec with a 3 digit number in sequence, start with 001 if there are no numbered specs already.
   - Use the `Plan Format` below to create the plan.
   - Research the codebase to understand existing patterns, architecture, and conventions before planning the feature.
   - IMPORTANT: Replace every <placeholder> in the `Plan Format` with the requested value. Add as much detail as needed to implement the feature successfully.
   - Use your reasoning model: THINK HARD about the feature requirements, design, and implementation approach.
   - Follow existing patterns and conventions in the codebase. Don't reinvent the wheel.
   - Design for extensibility and maintainability.
   - If you need a new NuGet package, be sure to report it in the `Notes` section of the `Plan Format`.
   - Reference the `project-context.md` for relevant files to focus on.
   - Start your research by reading the `CLAUDE.md` file for project overview and architecture.

## GitHub Integration

After creating the spec file, create a GitHub Issue with task checkboxes.

### 1. Verify GitHub CLI Authentication

Run `gh auth status` to verify authentication. If not authenticated, inform user to run `gh auth login`.

### 2. Create Feature Issue

Create a Feature issue using the feature name and description from the spec:

```bash
gh issue create --repo <github.owner>/<github.repo> --title "<feature name>" --body "<issue body>" --label "feature"
```

The issue body should include:
- Feature description from the spec
- User story
- Task checklist (from Step by Step Tasks section)

Use a HEREDOC for the body to ensure proper formatting.

### 3. Extract Issue Number

- Extract the Issue number from the gh output (the URL contains the issue number)
- Store this number for updating the spec

### 4. Update Spec with Issue Number

After creating the Issue, update the spec file with the GitHub Issue number:

- Replace `<issue-number>` in the `## GitHub Issue:` section with the actual Issue number
- This allows `/implement` and `/commit-with-pr` commands to reference the Issue directly

### 5. Confirm Success

After creating the issue:

- Output: "Feature issue created successfully in GitHub!"
- Show Issue number, title, and URL
- List all tasks as checkboxes in the issue

### 6. STOP - Do Not Implement

**IMPORTANT:** After creating the spec and GitHub issue, STOP.

- Do NOT start implementing the feature
- Do NOT write any code
- Do NOT modify any source files

## Plan Format

```md
# Feature: <feature name>

## GitHub Issue: #<issue-number>

## Feature Plan Created: <feature filepath>

## Feature Description

<describe the feature in detail, including its purpose and value to users>

## User Story

As a <type of user>
I want to <action/goal>
So that <benefit/value>

## Problem Statement

<clearly define the specific problem or opportunity this feature addresses>

## Solution Statement

<describe the proposed solution approach and how it solves the problem>

## Relevant Files

Use these files to implement the feature:

<find and list the files that are relevant to the feature describe why they are relevant in bullet points. If there are new files that need to be created to implement the feature, list them in an h3 'New Files' section.>

## Implementation Plan

### Phase 1: Foundation

<describe the foundational work needed before implementing the main feature>

### Phase 2: Core Implementation

<describe the main implementation work for the feature>

### Phase 3: Integration

<describe how the feature will integrate with existing functionality>

## Step by Step Tasks

IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers plus bullet points. use as many h3 headers as needed to implement the feature. Order matters, start with the foundational shared changes required then move on to the specific implementation. Include creating tests throughout the implementation process. Your last step should be running the `Validation Commands` to validate the feature works correctly with zero regressions.>

## Testing Strategy

### Unit Tests

<describe unit tests needed for the feature>

### Integration Tests

<describe integration tests needed for the feature>

### Edge Cases

<list edge cases that need to be tested>

## Acceptance Criteria

<list specific, measurable criteria that must be met for the feature to be considered complete>

## Validation Commands

Execute every command to validate the feature works correctly with zero regressions.

<list commands from project-config.json validation array, plus any feature-specific validation commands>

## Notes

<optionally list any additional notes, future considerations, or context that are relevant to the feature that will be helpful to the developer>
```

## Feature

$ARGUMENTS
