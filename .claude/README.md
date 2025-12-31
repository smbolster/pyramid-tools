# Generic Claude Code Commands Template

This directory contains a reusable template for Claude Code commands that work across multiple GitHub repositories.

## How It Works

Instead of hardcoding project-specific values (like GitHub repository names or base branches) in each command file, this template uses two configuration files:

### 1. `project-config.json` (Machine-readable)

Contains values that commands need to read programmatically:

```json
{
  "github": {
    "owner": "your-username-or-org",
    "repo": "your-repo-name",
    "baseBranch": "main"
  },
  "build": {
    "solution": "<SOLUTION_FILE>.sln",
    "buildCommand": "dotnet build",
    "testCommand": "dotnet test",
    "publishProfile": null
  },
  "validation": [
    "dotnet build <SOLUTION_FILE>.sln",
    "dotnet test"
  ]
}
```

### 2. `project-context.md` (Human-readable)

Contains the project structure and relevant files that Claude needs to understand:

- Project type description
- Directory structure
- Feature-specific directories
- Architecture patterns
- Ignore patterns

## Setting Up a New Project

### Option 1: Automated Setup (Recommended)

Run the `/setup` command from within your project directory. This will:
1. Create the `.claude/commands/` directory structure
2. Copy all command files from the template
3. Prompt you for GitHub configuration (owner, repo, base branch)
4. Auto-detect or ask for your build file (solution, package.json, etc.)
5. Optionally generate `project-context.md` by analyzing your codebase
6. Create a `specs/` directory for feature planning

### Option 2: Manual Setup

1. **Copy the template commands** to your project's `.claude/commands/` directory:
   ```bash
   cp -r .claude-template/github/commands/ YourProject/.claude/commands/
   ```

2. **Create your `project-config.json`** in `.claude/`:
   - Set your GitHub owner (username or organization)
   - Set your repository name
   - Set your base branch (`main` or `master`)
   - Configure build/test commands

3. **Create your `project-context.md`** in `.claude/`:
   - Describe your project type
   - List relevant directories and files
   - Document any project-specific patterns

4. **Keep your `CLAUDE.md`** at the project root for general project guidance.

## Directory Structure

```
YourProject/
├── .claude/
│   ├── commands/
│   │   ├── setup.md          # Initialize project with prompts
│   │   ├── gh-login.md       # Verifies GitHub CLI authentication
│   │   ├── create-branch.md  # Reads baseBranch from config
│   │   ├── feature.md        # Reads config + context
│   │   ├── implement.md      # Reads from project-config.json
│   │   ├── bug.md
│   │   ├── chore.md
│   │   ├── commit.md
│   │   ├── commit-with-pr.md
│   │   ├── pr.md
│   │   ├── prime.md
│   │   └── tools.md
│   ├── project-config.json   # Project-specific configuration
│   └── project-context.md    # Project structure documentation
├── CLAUDE.md                 # Project overview and guidance
└── ...
```

## Examples

See the `examples/` directory for filled-in configurations.

## Benefits

1. **Single source of truth** - Project settings in one place
2. **Easier maintenance** - Update commands once, use everywhere
3. **Onboarding new projects** - Just fill in the config files
4. **Consistency** - All projects follow the same patterns

## GitHub CLI vs Azure DevOps CLI

This template uses the GitHub CLI (`gh`) instead of Azure CLI (`az`). Key differences:

| Azure DevOps | GitHub |
|--------------|--------|
| `az devops configure` | `gh auth status` |
| `az repos pr create` | `gh pr create` |
| `az boards work-item create` | `gh issue create` |
| `AZURE_DEVOPS_EXT_PAT` | `GITHUB_TOKEN` or `gh auth login` |
| Work Items (Feature, Bug, Task) | Issues with Labels |
