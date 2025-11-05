#!/usr/bin/env python3
"""
Commit and push changes for the current branch.
Usage: uv run commit.py <commit message>
"""

import subprocess
import sys


def run_command(command, description):
    """Run a command and return output and success status."""
    print(f"\n{'=' * 80}")
    print(f"{description}")
    print('=' * 80)

    try:
        result = subprocess.run(
            command,
            cwd="/Users/sbolster/projects/corporate/pyramid-tools",
            capture_output=True,
            text=True,
            check=True
        )
        output = result.stdout + result.stderr
        print(output)
        return output, True
    except subprocess.CalledProcessError as e:
        output = e.stdout + e.stderr
        print(output)
        print(f"Error: Command failed with return code {e.returncode}")
        return output, False
    except FileNotFoundError as e:
        error_msg = f"Error: Command not found - {e}"
        print(error_msg)
        return error_msg, False


def main():
    if len(sys.argv) < 2:
        print("Usage: uv run commit.py <commit message>")
        print("Example: uv run commit.py 'Add screenshot annotator feature'")
        sys.exit(1)

    # Get commit message
    commit_message = " ".join(sys.argv[1:])

    # Get current branch
    branch_output, success = run_command(
        ["git", "branch", "--show-current"],
        "Getting current branch..."
    )

    if not success:
        print("\nFailed to get current branch. Aborting.")
        sys.exit(1)

    current_branch = branch_output.strip()

    if not current_branch or current_branch == "master":
        print(f"\nError: Cannot commit on branch '{current_branch}'.")
        print("Please create a feature/chore/bug branch first.")
        sys.exit(1)

    print(f"Current branch: {current_branch}")

    # Step 1: Git status
    print("\nStep 1: Checking git status")
    run_command(
        ["git", "status"],
        "Running git status..."
    )

    # Step 2: Git add .
    print("\nStep 2: Staging all changes")
    _, success = run_command(
        ["git", "add", "."],
        "Running git add ..."
    )

    if not success:
        print("\nFailed to stage changes. Aborting.")
        sys.exit(1)

    # Step 3: Git commit with message
    print(f"\nStep 3: Committing changes")
    commit_cmd = f"""git commit -m "$(cat <<'EOF'
{commit_message}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
"""

    _, success = run_command(
        ["bash", "-c", commit_cmd],
        f"Committing with message: {commit_message}"
    )

    if not success:
        print("\nFailed to commit changes. Aborting.")
        sys.exit(1)

    # Step 4: Git push
    print(f"\nStep 4: Pushing to origin/{current_branch}")
    _, success = run_command(
        ["git", "push", "-u", "origin", current_branch],
        f"Pushing to origin/{current_branch}..."
    )

    if not success:
        print("\nFailed to push changes.")
        sys.exit(1)

    print(f"\n{'=' * 80}")
    print("✓ Changes committed and pushed successfully!")
    print(f"  Branch: {current_branch}")
    print(f"  Message: {commit_message}")
    print("\nNext steps:")
    print("  - Run 'uv run adws/create_pr.py' to create a pull request")
    print('=' * 80)


if __name__ == "__main__":
    main()
