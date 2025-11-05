#!/usr/bin/env python3
"""
Orchestrate feature planning and implementation.
1. Runs feature.py to create a feature plan
2. Extracts the created spec file path
3. Runs implement.py with the spec file
4. Saves all output to a log file

Usage: uv run build_feature.py <feature description>
"""

import subprocess
import sys
import re
from datetime import datetime
from pathlib import Path


def run_command(command, description):
    """Run a command and capture its output."""
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


def extract_spec_file(output):
    """Extract the spec file path from feature command output."""
    # Look for pattern: ## Feature Plan Created: `specs/001-dark-mode-toggle.md`
    pattern = r'##\s+Feature Plan Created:\s+`(specs/[^`]+\.md)`'
    match = re.search(pattern, output)

    if match:
        return match.group(1)

    # Alternative patterns to try
    alt_patterns = [
        r'Created spec file:\s+`(specs/[^`]+\.md)`',
        r'Spec file created:\s+(specs/[^\s]+\.md)',
        r'(specs/\d+-[^`\s]+\.md)'
    ]

    for pattern in alt_patterns:
        match = re.search(pattern, output)
        if match:
            return match.group(1)

    return None


def main():
    if len(sys.argv) < 2:
        print("Usage: uv run build_feature.py <feature description>")
        print("Example: uv run build_feature.py 'Add dark mode toggle to homepage'")
        sys.exit(1)

    # Get feature description
    feature_description = " ".join(sys.argv[1:])

    # Create log file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = Path("/Users/sbolster/projects/corporate/pyramid-tools/specs") / f"build_log_{timestamp}.md"

    all_output = []
    all_output.append(f"# Feature Build Log")
    all_output.append(f"**Feature Description:** {feature_description}")
    all_output.append(f"**Timestamp:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    all_output.append("\n" + "=" * 80 + "\n")

    # Step 1: Create git branch
    print(f"Step 1: Creating git branch for: {feature_description}")
    all_output.append(f"## Step 1: Git Branch Creation\n")

    branch_output, success = run_command(
        ["claude", "-p", f"/create-branch feature {feature_description}"],
        "Creating feature branch..."
    )
    all_output.append(f"```\n{branch_output}\n```\n")

    if not success:
        error_msg = "Failed to create git branch. Aborting."
        print(f"\n{error_msg}")
        all_output.append(f"\n**ERROR:** {error_msg}\n")
        log_file.write_text("\n".join(all_output))
        print(f"\nLog saved to: {log_file}")
        sys.exit(1)

    # Step 2: Run feature.py
    print(f"\nStep 2: Creating feature plan for: {feature_description}")
    all_output.append(f"## Step 2: Feature Planning\n")

    feature_output, success = run_command(
        ["claude", "-p", f"/feature {feature_description}"],
        "Running feature planning..."
    )
    all_output.append(f"```\n{feature_output}\n```\n")

    if not success:
        error_msg = "Failed to create feature plan. Aborting."
        print(f"\n{error_msg}")
        all_output.append(f"\n**ERROR:** {error_msg}\n")
        log_file.write_text("\n".join(all_output))
        print(f"\nLog saved to: {log_file}")
        sys.exit(1)

    # Step 3: Extract spec file
    spec_file = extract_spec_file(feature_output)

    if not spec_file:
        error_msg = "Could not find spec file path in feature output. Aborting."
        print(f"\n{error_msg}")
        all_output.append(f"\n**ERROR:** {error_msg}\n")
        log_file.write_text("\n".join(all_output))
        print(f"\nLog saved to: {log_file}")
        sys.exit(1)

    print(f"\nFound spec file: {spec_file}")
    all_output.append(f"\n**Spec File Created:** `{spec_file}`\n")

    # Step 4: Run implement.py with the spec file
    print(f"\nStep 3: Implementing feature from: {spec_file}")
    all_output.append(f"## Step 3: Feature Implementation\n")

    implement_output, success = run_command(
        ["claude", "-p", f"/implement {spec_file}"],
        "Running feature implementation..."
    )
    all_output.append(f"```\n{implement_output}\n```\n")

    if not success:
        error_msg = "Feature implementation encountered errors."
        print(f"\n{error_msg}")
        all_output.append(f"\n**WARNING:** {error_msg}\n")

    # Save log
    all_output.append(f"\n## Summary\n")
    all_output.append(f"- Feature Description: {feature_description}")
    all_output.append(f"- Spec File: {spec_file}")
    all_output.append(f"- Status: {'Completed' if success else 'Completed with errors'}")

    log_file.write_text("\n".join(all_output))

    print(f"\n{'=' * 80}")
    print(f"Build complete!")
    print(f"Spec file: {spec_file}")
    print(f"Log saved to: {log_file}")
    print('=' * 80)


if __name__ == "__main__":
    main()
