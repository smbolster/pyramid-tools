#!/usr/bin/env python3
"""
Run claude with /bug command in the pyramid-tools project.
Usage: uv run bug.py <your bug description>
"""

import subprocess
import sys


def run_command(command, description):
    """Run a command and return success status."""
    print(f"\n{'=' * 80}")
    print(f"{description}")
    print('=' * 80)

    try:
        result = subprocess.run(
            command,
            cwd="/Users/sbolster/projects/corporate/pyramid-tools",
            check=True
        )
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"Error: Command failed with return code {e.returncode}")
        return False
    except FileNotFoundError as e:
        print(f"Error: Command not found - {e}")
        return False


def main():
    if len(sys.argv) < 2:
        print("Usage: uv run bug.py <bug description>")
        print("Example: uv run bug.py 'Fix PDF preview not loading'")
        sys.exit(1)

    # Join all arguments after the script name into a single bug description
    bug_input = " ".join(sys.argv[1:])

    # Step 1: Create git branch
    print(f"Step 1: Creating git branch for bug fix: {bug_input}")
    success = run_command(
        ["claude", "-p", f"/create-branch bug {bug_input}"],
        "Creating bug fix branch..."
    )

    if not success:
        print("\nFailed to create git branch. Aborting.")
        sys.exit(1)

    # Step 2: Run bug command
    print(f"\nStep 2: Planning and fixing bug: {bug_input}")
    success = run_command(
        ["claude", "-p", f"/bug {bug_input}"],
        "Running bug planning and fix..."
    )

    if not success:
        print("\nBug fix encountered errors.")
        sys.exit(1)

    print(f"\n{'=' * 80}")
    print("Bug fix complete!")
    print('=' * 80)


if __name__ == "__main__":
    main()
