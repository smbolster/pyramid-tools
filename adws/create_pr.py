#!/usr/bin/env python3
"""
Create a pull request for the current branch.
Usage:
  uv run create_pr.py                           # Auto-generate title and description
  uv run create_pr.py "Custom PR title"         # Custom title, auto-generate description
  uv run create_pr.py --draft                   # Create as draft PR
"""

import subprocess
import sys
import re
from pathlib import Path


def run_command(command, description, capture=True):
    """Run a command and return output and success status."""
    print(f"\n{'=' * 80}")
    print(f"{description}")
    print('=' * 80)

    try:
        if capture:
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
        else:
            result = subprocess.run(
                command,
                cwd="/Users/sbolster/projects/corporate/pyramid-tools",
                check=True
            )
            return "", True
    except subprocess.CalledProcessError as e:
        if capture:
            output = e.stdout + e.stderr
            print(output)
        print(f"Error: Command failed with return code {e.returncode}")
        return "", False
    except FileNotFoundError as e:
        error_msg = f"Error: Command not found - {e}"
        print(error_msg)
        return error_msg, False


def slugify_to_title(branch_name):
    """Convert a branch name to a title."""
    # Remove feature/, chore/, bug/ prefix
    name = re.sub(r'^(feature|chore|bug)/', '', branch_name)
    # Replace hyphens and underscores with spaces
    name = name.replace('-', ' ').replace('_', ' ')
    # Capitalize first letter of each word
    return name.title()


def get_branch_type(branch_name):
    """Get the type of branch (feature, chore, bug)."""
    if branch_name.startswith('feature/'):
        return 'feature'
    elif branch_name.startswith('chore/'):
        return 'chore'
    elif branch_name.startswith('bug/'):
        return 'bug'
    return 'other'


def find_related_spec(branch_name):
    """Find a spec file related to the branch."""
    specs_dir = Path("/Users/sbolster/projects/corporate/pyramid-tools/specs")
    if not specs_dir.exists():
        return None

    # Get the branch name without prefix
    clean_name = re.sub(r'^(feature|chore|bug)/', '', branch_name)

    # Look for spec files that match the branch name
    spec_files = list(specs_dir.glob("*.md"))
    for spec_file in spec_files:
        if clean_name.replace('-', ' ') in spec_file.stem.lower().replace('-', ' '):
            return spec_file

    return None


def main():
    # Parse arguments
    custom_title = None
    is_draft = False

    for arg in sys.argv[1:]:
        if arg == "--draft":
            is_draft = True
        else:
            custom_title = arg if not custom_title else f"{custom_title} {arg}"

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
        print(f"\nError: Cannot create PR from branch '{current_branch}'.")
        print("Please switch to a feature/chore/bug branch first.")
        sys.exit(1)

    print(f"Current branch: {current_branch}")

    # Generate title if not provided
    if not custom_title:
        custom_title = slugify_to_title(current_branch)

    branch_type = get_branch_type(current_branch)

    # Get commit history
    print("\nGetting commit history from master...")
    commits_output, success = run_command(
        ["git", "log", "master..HEAD", "--pretty=format:- %s"],
        "Getting commits for PR description..."
    )

    # Try to find related spec file
    spec_file = find_related_spec(current_branch)

    # Build PR description
    description_parts = [
        f"## Summary",
        "",
        f"This {branch_type} branch includes the following changes:",
        "",
    ]

    if commits_output.strip():
        description_parts.append("### Commits")
        description_parts.append(commits_output.strip())
        description_parts.append("")

    if spec_file:
        description_parts.append(f"### Related Spec")
        description_parts.append(f"See `{spec_file.relative_to(Path.cwd())}` for detailed planning.")
        description_parts.append("")

    description_parts.extend([
        "## Test Plan",
        "- [ ] Tested locally",
        "- [ ] Linting passed",
        "- [ ] Build succeeded",
        "",
        "🤖 Generated with [Claude Code](https://claude.com/claude-code)"
    ])

    pr_body = "\n".join(description_parts)

    # Create PR using gh
    print(f"\nCreating pull request...")
    print(f"Title: {custom_title}")

    gh_command = f"""gh pr create --title "{custom_title}" --body "$(cat <<'EOF'
{pr_body}
EOF
)"{'--draft' if is_draft else ''}"""

    pr_output, success = run_command(
        ["bash", "-c", gh_command],
        "Creating pull request with gh CLI..."
    )

    if not success:
        print("\nFailed to create pull request.")
        print("\nMake sure:")
        print("  1. GitHub CLI (gh) is installed: brew install gh")
        print("  2. You're authenticated: gh auth login")
        print("  3. Your changes are pushed to origin")
        sys.exit(1)

    # Extract PR URL from output
    pr_url_match = re.search(r'(https://github\.com/[^\s]+)', pr_output)
    pr_url = pr_url_match.group(1) if pr_url_match else "PR created successfully"

    print(f"\n{'=' * 80}")
    print("✓ Pull request created successfully!")
    print(f"  Branch: {current_branch}")
    print(f"  Title: {custom_title}")
    if pr_url != "PR created successfully":
        print(f"  URL: {pr_url}")
    print('=' * 80)


if __name__ == "__main__":
    main()
