#!/usr/bin/env python3
"""
Run claude with /feature command in the pyramid-tools project.
Usage: uv run feature.py <your feature description>
"""

import subprocess
import sys


def main():
    if len(sys.argv) < 2:
        print("Usage: uv run feature.py <feature description>")
        print("Example: uv run feature.py 'Add dark mode to homepage'")
        sys.exit(1)

    # Join all arguments after the script name into a single feature description
    feature_input = " ".join(sys.argv[1:])

    # Build the claude command
    claude_command = f'/feature {feature_input}'

    # Run claude with the command
    try:
        result = subprocess.run(
            ["claude", "-p", claude_command],
            cwd="/Users/sbolster/projects/corporate/pyramid-tools",
            check=True
        )
        sys.exit(result.returncode)
    except subprocess.CalledProcessError as e:
        print(f"Error running claude: {e}")
        sys.exit(e.returncode)
    except FileNotFoundError:
        print("Error: 'claude' command not found. Make sure Claude CLI is installed.")
        sys.exit(1)


if __name__ == "__main__":
    main()
