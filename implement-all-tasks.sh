#!/usr/bin/env zsh
# implement-all-tasks.sh
# Loops over a task-list.md and runs /implement-one-task for each unchecked item.
#
# Usage: ./implement-all-tasks.sh <path-to-task-list.md>

set -euo pipefail

TASK_LIST="${1:-}"

if [[ -z "$TASK_LIST" ]]; then
  echo "Usage: $0 <path-to-task-list.md>" >&2
  exit 1
fi

if [[ ! -f "$TASK_LIST" ]]; then
  echo "Error: task list not found: $TASK_LIST" >&2
  exit 1
fi

MAX_ITERATIONS=20
iteration=0

unchecked_count() {
  grep -c '^\- \[ \]' "$TASK_LIST" 2>/dev/null || true
}

echo "Starting task runner for: $TASK_LIST"
echo "---"

while [[ $(unchecked_count) -gt 0 ]]; do
  iteration=$(( iteration + 1 ))

  if [[ $iteration -gt $MAX_ITERATIONS ]]; then
    echo "Safety stop: reached $MAX_ITERATIONS iterations without completing all tasks." >&2
    exit 1
  fi

  remaining=$(unchecked_count)
  echo "[iteration $iteration] $remaining unchecked task(s) remaining. Running /implement-one-task..."
  echo "---"

  claude -p "/implement-one-task $TASK_LIST"

  echo "---"
  echo "[iteration $iteration] done."
  echo "---"
done

echo "All tasks completed!"
