---
description: Verify GitHub CLI authentication status
---

Verify GitHub CLI authentication for this project.

## Instructions

1. **Read Project Configuration**

   Read the `project-config.json` file in the `.claude/` directory to get:
   - `github.owner` - The GitHub owner (username or organization)
   - `github.repo` - The GitHub repository name

2. **Verify GitHub CLI Authentication**

   Check if the user is logged in:

   ```bash
   gh auth status
   ```

3. **Verify Repository Access**

   After confirming authentication, verify access to the repository:

   ```bash
   gh repo view <github.owner>/<github.repo> --json name,owner
   ```

If not authenticated, inform the user to run `gh auth login` to authenticate with GitHub.
