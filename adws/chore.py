#!/usr/bin/env python3
"""
Run claude with /chore command in the pyramid-tools project.
Usage: uv run chore.py <your chore description>
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
        print("Usage: uv run chore.py <chore description>")
        print("Example: uv run chore.py 'Update dependencies and fix linting issues'")
        sys.exit(1)

    # Join all arguments after the script name into a single chore description
    chore_input = " ".join(sys.argv[1:])

    # Step 1: Create git branch
    print(f"Step 1: Creating git branch for chore: {chore_input}")
    success = run_command(
        ["claude", "-p", f"/create-branch chore {chore_input}"],
        "Creating chore branch..."
    )

    if not success:
        print("\nFailed to create git branch. Aborting.")
        sys.exit(1)

    # Step 2: Run chore command
    print(f"\nStep 2: Planning and executing chore: {chore_input}")
    success = run_command(
        ["claude", "-p", f"/chore {chore_input}"],
        "Running chore planning and execution..."
    )

    if not success:
        print("\nChore encountered errors.")
        sys.exit(1)

    print(f"\n{'=' * 80}")
    print("Chore complete!")
    print('=' * 80)


if __name__ == "__main__":
    main()
