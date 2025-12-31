# Setup Project for Claude Code

Initialize a project with Claude Code configuration files and commands for GitHub workflows.

## Instructions

### 1. Create .claude Directory

Check if `.claude/` directory exists in the current project root. If not, create it:

```bash
mkdir -p .claude/commands
```

### 2. Copy Command Files

Copy all command files from the template to the project:

```bash
cp -r <template-path>/commands/* .claude/commands/
```

Note: The template path should be relative to the McKimCreedKnowledge repository.

### 3. Gather Project Configuration

Use the AskUserQuestion tool to gather the following information:

**Question 1: GitHub Owner**
- Question: "What is the GitHub owner (username or organization)?"
- Header: "Owner"
- Options:
  - Detect from `git remote -v` if possible and offer as first option
  - Common organization names if known
  - User can select "Other" to type a custom owner

**Question 2: Repository Name**
- Question: "What is the GitHub repository name?"
- Header: "Repo"
- Options:
  - Detect from `git remote -v` if possible and offer as first option
  - Detect from current directory name as fallback
  - User can select "Other" to type a custom repo name

**Question 3: Base Branch**
- Question: "What is the base branch for this repository?"
- Header: "Branch"
- Options:
  - "main" (description: "Modern default branch name (Recommended)")
  - "master" (description: "Legacy default branch name")
  - "develop" (description: "Development branch as base")

**Question 4: Build Configuration**
- Question: "What is the solution or project file? (e.g., MyProject.sln or package.json)"
- Header: "Build"
- Options:
  - Auto-detect by running `find . -name "*.sln" -maxdepth 2` or checking for package.json
  - Offer found files as options
  - If none found, ask user to type it

### 4. Create project-config.json

Create `.claude/project-config.json` with the gathered values:

```json
{
  "github": {
    "owner": "<gathered-owner>",
    "repo": "<gathered-repo>",
    "baseBranch": "<gathered-branch>"
  },
  "build": {
    "solution": "<gathered-solution>",
    "testCommand": "dotnet test",
    "buildCommand": "dotnet build",
    "publishProfile": null
  },
  "validation": [
    "dotnet build <gathered-solution>",
    "dotnet test"
  ]
}
```

Adjust build commands based on detected project type:
- For .NET projects: `dotnet build`, `dotnet test`
- For Node.js projects: `npm run build`, `npm test`
- For Python projects: `pytest`, etc.

### 5. Ask About Project Context

Use the AskUserQuestion tool:

- Question: "Would you like to generate the project-context.md file now?"
- Header: "Context"
- Options:
  - "Yes, generate now" (description: "Analyze the codebase and create project-context.md")
  - "No, I'll do it later" (description: "Copy the template file for manual editing")

### 6. Handle Project Context

**If user chose "Yes, generate now":**

1. Run `git ls-files` to get all tracked files
2. Identify the project type by looking at:
   - `.csproj` files for .NET projects
   - `package.json` for Node.js projects
   - `requirements.txt` or `pyproject.toml` for Python
   - `Cargo.toml` for Rust
   - `go.mod` for Go
3. Identify relevant directories and files
4. Generate `.claude/project-context.md` with:
   - Detected project type
   - Source code directories
   - Configuration file locations
   - Test directories
   - Feature-specific directories based on folder structure

**If user chose "No, I'll do it later":**

Copy the template `project-context.md` to `.claude/project-context.md` for manual editing.

### 7. Create specs Directory

Create a `specs/` directory for feature/bug/chore specifications:

```bash
mkdir -p specs
```

### 8. Verify CLAUDE.md

Check if `CLAUDE.md` exists in the project root:

- If it exists, inform the user it was found
- If it doesn't exist, suggest creating one with basic project information

### 9. Confirm Success

Output a summary:

```
Setup complete!

Created:
  .claude/
    commands/
      gh-login.md
      create-branch.md
      feature.md
      bug.md
      chore.md
      commit.md
      commit-with-pr.md
      pr.md
      implement.md
      prime.md
      tools.md
      setup.md
    project-config.json
    project-context.md
  specs/

Configuration:
  Owner: <owner>
  Repo: <repo>
  Base Branch: <branch>
  Build File: <solution>

Next steps:
  1. Review .claude/project-context.md and add project-specific details
  2. Ensure CLAUDE.md exists with project overview
  3. Run /prime to verify the setup
  4. Run `gh auth login` if not already authenticated
```

## Arguments

$ARGUMENTS
