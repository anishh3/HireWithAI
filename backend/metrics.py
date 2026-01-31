"""Compute workflow metrics from telemetry events."""
import json
from typing import Any

EVENT_TYPES = [
    "task_started", "code_edit", "code_run", "ai_used",
    "tab_hidden", "tab_visible", "large_paste", "task_submitted",
]


def compute_metrics(events: list) -> dict[str, Any]:
    if not events:
        return {
            "total_time_seconds": 0,
            "edit_count": 0,
            "run_count": 0,
            "refine_cycles": 0,
            "linear_typing_ratio": 0.0,
            "linear_typing_edits": 0,
            "ai_usage_count": 0,
            "context_switch_seconds": 0,
            "large_paste_count": 0,
        }

    first_ts = events[0].timestamp
    last_ts = events[-1].timestamp
    total_time = (last_ts - first_ts).total_seconds() if first_ts and last_ts else 0

    edit_count = sum(1 for e in events if e.event_type == "code_edit")
    run_count = sum(1 for e in events if e.event_type == "code_run")
    ai_usage_count = sum(1 for e in events if e.event_type == "ai_used")
    large_paste_count = sum(1 for e in events if e.event_type == "large_paste")

    # Refine cycles: edit -> run -> edit sequences
    refine_cycles = 0
    last_was_edit = False
    last_was_run = False
    for e in events:
        if e.event_type == "code_edit":
            if last_was_run:
                refine_cycles += 1
            last_was_edit = True
            last_was_run = False
        elif e.event_type == "code_run":
            last_was_run = True
            last_was_edit = False

    # Context switching (time in tab_hidden state)
    context_switch_seconds = 0.0
    hidden_start = None
    for e in events:
        if e.event_type == "tab_hidden":
            hidden_start = e.timestamp
        elif e.event_type == "tab_visible" and hidden_start:
            context_switch_seconds += (e.timestamp - hidden_start).total_seconds()
            hidden_start = None

    # Linear typing detection
    linear_typing_edits = 0
    for e in events:
        if e.event_type == "code_edit" and e.metadata_:
            try:
                meta = json.loads(e.metadata_)
                chars = meta.get("chars_added", 0)
                if 1 <= chars <= 5:
                    linear_typing_edits += 1
            except:
                pass

    linear_typing_ratio = linear_typing_edits / edit_count if edit_count > 0 else 0.0

    return {
        "total_time_seconds": total_time,
        "edit_count": edit_count,
        "run_count": run_count,
        "refine_cycles": refine_cycles,
        "linear_typing_ratio": round(linear_typing_ratio, 2),
        "linear_typing_edits": linear_typing_edits,
        "ai_usage_count": ai_usage_count,
        "context_switch_seconds": round(context_switch_seconds, 1),
        "large_paste_count": large_paste_count,
    }


def generate_insight(metrics: dict[str, Any]) -> str:
    parts = []
    if metrics["edit_count"] > 20:
        parts.append("High editing activity")
    if metrics["refine_cycles"] > 3:
        parts.append("Good iterative refinement")
    if metrics["ai_usage_count"] > 0:
        parts.append(f"Used AI {metrics['ai_usage_count']}x")
    if metrics["large_paste_count"] > 2:
        parts.append("Multiple large pastes detected")
    if metrics["linear_typing_ratio"] > 0.6:
        parts.append("Linear typing pattern (likely manual coding)")
    if metrics["context_switch_seconds"] > 60:
        parts.append(f"~{int(metrics['context_switch_seconds'])}s away from task")
    return ". ".join(parts) if parts else "Limited activity recorded."


def generate_conclusion(metrics: dict[str, Any], email: str, task_title: str) -> str:
    score_parts = []
    if metrics["linear_typing_ratio"] > 0.5:
        score_parts.append("shows organic typing patterns")
    if metrics["refine_cycles"] >= 2:
        score_parts.append("demonstrates iterative problem-solving")
    if metrics["large_paste_count"] <= 1:
        score_parts.append("minimal copy-paste reliance")
    if metrics["ai_usage_count"] <= 2:
        score_parts.append("limited AI assistance")
    elif metrics["ai_usage_count"] > 5:
        score_parts.append("heavy AI usage")

    if score_parts:
        return f"Candidate {score_parts[0]}, {', '.join(score_parts[1:])}." if len(score_parts) > 1 else f"Candidate {score_parts[0]}."
    return "Insufficient data for behavioral conclusion."
