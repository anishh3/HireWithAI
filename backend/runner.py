"""Run submitted code against test cases."""
import subprocess
import tempfile
import json
import os
from typing import Any

TASK_TEST_CASES = {
    1: [  # FizzBuzz
        {"args": [1], "expected": ["1"]},
        {"args": [3], "expected": ["1", "2", "Fizz"]},
        {"args": [5], "expected": ["1", "2", "Fizz", "4", "Buzz"]},
        {"args": [15], "expected": ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]},
        {"args": [16], "expected": ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz", "16"]},
    ],
}

RUNNER_SCRIPT = '''
import json
import sys

with open("solution.py", "r", encoding="utf-8") as f:
    code = f.read()

with open("test_cases.json", "r", encoding="utf-8") as f:
    test_cases = json.load(f)

namespace = {}
try:
    exec(code, namespace)
except Exception as e:
    print(json.dumps({"error": f"Syntax/runtime error: {e}", "results": []}))
    sys.exit(0)

fn = namespace.get("fizzbuzz") or namespace.get("fizz_buzz")
if fn is None:
    print(json.dumps({"error": "Function fizzbuzz or fizz_buzz not found", "results": []}))
    sys.exit(0)

results = []
for tc in test_cases:
    args = tc["args"]
    expected = tc["expected"]
    try:
        got = fn(*args)
        passed = got == expected
        results.append({"input": args, "expected": expected, "got": got, "passed": passed, "error": None})
    except Exception as e:
        results.append({"input": args, "expected": expected, "got": None, "passed": False, "error": str(e)})

print(json.dumps({"error": None, "results": results}))
'''

RUN_CODE_SCRIPT = '''
import sys
with open("solution.py", "r", encoding="utf-8") as f:
    code = f.read()
namespace = {}
try:
    exec(code, namespace)
except Exception as e:
    import traceback
    traceback.print_exc()
    sys.exit(1)
fn = namespace.get("fizzbuzz") or namespace.get("fizz_buzz")
if fn is not None:
    try:
        result = fn(15)
        print(result)
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("(Define fizzbuzz(n) or fizz_buzz(n) to see output)")
'''


def run_tests(task_id: int, code: str, timeout_seconds: int = 10) -> dict[str, Any]:
    test_cases = TASK_TEST_CASES.get(task_id, [])
    if not test_cases:
        return {"tests_passed": 0, "tests_total": 0, "results": [], "run_error": "No test cases for this task"}

    with tempfile.TemporaryDirectory() as tmpdir:
        solution_path = os.path.join(tmpdir, "solution.py")
        tests_path = os.path.join(tmpdir, "test_cases.json")
        runner_path = os.path.join(tmpdir, "runner.py")

        with open(solution_path, "w", encoding="utf-8") as f:
            f.write(code)
        with open(tests_path, "w", encoding="utf-8") as f:
            json.dump(test_cases, f)
        with open(runner_path, "w", encoding="utf-8") as f:
            f.write(RUNNER_SCRIPT)

        try:
            result = subprocess.run(
                ["python", "runner.py"],
                cwd=tmpdir,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )
            output = result.stdout.strip()
            if not output:
                return {"tests_passed": 0, "tests_total": len(test_cases), "results": [], "run_error": result.stderr or "No output"}
            data = json.loads(output)
            if data.get("error"):
                return {"tests_passed": 0, "tests_total": len(test_cases), "results": [], "run_error": data["error"]}
            results = data.get("results", [])
            passed = sum(1 for r in results if r.get("passed"))
            return {"tests_passed": passed, "tests_total": len(test_cases), "results": results, "run_error": None}
        except subprocess.TimeoutExpired:
            return {"tests_passed": 0, "tests_total": len(test_cases), "results": [], "run_error": "Timeout"}
        except Exception as e:
            return {"tests_passed": 0, "tests_total": len(test_cases), "results": [], "run_error": str(e)}


def run_code(task_id: int, code: str, timeout_seconds: int = 10) -> dict[str, Any]:
    with tempfile.TemporaryDirectory() as tmpdir:
        solution_path = os.path.join(tmpdir, "solution.py")
        runner_path = os.path.join(tmpdir, "run_code.py")

        with open(solution_path, "w", encoding="utf-8") as f:
            f.write(code)
        with open(runner_path, "w", encoding="utf-8") as f:
            f.write(RUN_CODE_SCRIPT)

        try:
            result = subprocess.run(
                ["python", "run_code.py"],
                cwd=tmpdir,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
            )
            return {"stdout": result.stdout, "stderr": result.stderr, "run_error": None}
        except subprocess.TimeoutExpired:
            return {"stdout": "", "stderr": "", "run_error": "Timeout"}
        except Exception as e:
            return {"stdout": "", "stderr": "", "run_error": str(e)}
