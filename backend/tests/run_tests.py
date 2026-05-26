import sys
import os
import pytest

# Programmatically execute pytest and capture all logs/stdout/stderr to test_results.txt
workspace_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
results_path = os.path.join(workspace_root, "test_results.txt")

print(f"Executing regression tests and writing to: {results_path}")

with open(results_path, "w", encoding="utf-8") as f:
    # Backup original stdout/stderr
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    
    # Redirect streams
    sys.stdout = f
    sys.stderr = f
    
    try:
        # Run pytest programmatically
        exit_code = pytest.main(["backend/tests/test_main.py", "-v"])
        
        # Write custom completion footer
        f.write(f"\n[JobsVilla Test Runner] Completed with exit code: {exit_code}\n")
    except Exception as e:
        f.write(f"\n[JobsVilla Test Runner] Unexpected Error: {str(e)}\n")
    finally:
        # Restore streams
        sys.stdout = old_stdout
        sys.stderr = old_stderr

print("Test run completed successfully.")
