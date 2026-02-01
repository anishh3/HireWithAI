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
            "edits_per_run": 0.0,
            "linear_typing_ratio": 0.0,
            "linear_typing_edits": 0,
            "ai_usage_count": 0,
            "context_switch_seconds": 0,
            "large_paste_count": 0,
            "ai_prompts": [],
            "paste_events": [],
        }

    first_ts = events[0].timestamp
    last_ts = events[-1].timestamp
    total_time = (last_ts - first_ts).total_seconds() if first_ts and last_ts else 0

    edit_count = sum(1 for e in events if e.event_type == "code_edit")
    run_count = sum(1 for e in events if e.event_type == "code_run")
    ai_usage_count = sum(1 for e in events if e.event_type == "ai_used")
    large_paste_count = sum(1 for e in events if e.event_type == "large_paste")

    # Edits per run ratio
    edits_per_run = round(edit_count / run_count, 1) if run_count > 0 else 0.0

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

    # Extract AI prompts
    ai_prompts = []
    for e in events:
        if e.event_type == "ai_used" and e.metadata_:
            try:
                meta = json.loads(e.metadata_)
                prompt = meta.get("prompt", "")
                if prompt:
                    ai_prompts.append({
                        "prompt": prompt,
                        "timestamp": e.timestamp.isoformat() if e.timestamp else None
                    })
            except:
                pass

    # Extract paste events with content
    paste_events = []
    for e in events:
        if e.event_type == "large_paste" and e.metadata_:
            try:
                meta = json.loads(e.metadata_)
                paste_events.append({
                    "chars_added": meta.get("chars_added", 0),
                    "content_preview": meta.get("content_preview", ""),
                    "timestamp": e.timestamp.isoformat() if e.timestamp else None
                })
            except:
                pass

    return {
        "total_time_seconds": total_time,
        "edit_count": edit_count,
        "run_count": run_count,
        "refine_cycles": refine_cycles,
        "edits_per_run": edits_per_run,
        "linear_typing_ratio": round(linear_typing_ratio, 2),
        "linear_typing_edits": linear_typing_edits,
        "ai_usage_count": ai_usage_count,
        "context_switch_seconds": round(context_switch_seconds, 1),
        "large_paste_count": large_paste_count,
        "ai_prompts": ai_prompts,
        "paste_events": paste_events,
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
    elif metrics["large_paste_count"] > 0:
        parts.append(f"{metrics['large_paste_count']} large paste(s) detected")
    if metrics["linear_typing_ratio"] > 0.6:
        parts.append("Linear typing pattern (likely manual coding)")
    if metrics["context_switch_seconds"] > 60:
        parts.append(f"~{int(metrics['context_switch_seconds'])}s away from task")
    return ". ".join(parts) if parts else "Limited activity recorded."


def generate_conclusion(metrics: dict[str, Any], email: str, task_title: str) -> str:
    """Generate a comprehensive AI-driven conclusion based on candidate metrics."""
    
    # Calculate key indicators
    linear_typing = metrics.get("linear_typing_ratio", 0)
    refine_cycles = metrics.get("refine_cycles", 0)
    paste_count = metrics.get("large_paste_count", 0)
    ai_count = metrics.get("ai_usage_count", 0)
    edit_count = metrics.get("edit_count", 0)
    run_count = metrics.get("run_count", 0)
    total_time = metrics.get("total_time_seconds", 0)
    context_switch = metrics.get("context_switch_seconds", 0)
    edits_per_run = metrics.get("edits_per_run", 0)
    
    # Calculate focus percentage
    focus_percent = ((total_time - context_switch) / total_time * 100) if total_time > 0 else 100
    
    # Build conclusion based on patterns
    conclusion_parts = []
    
    # Coding authenticity assessment
    if linear_typing > 0.6 and paste_count == 0:
        conclusion_parts.append("Strong evidence of authentic, manual coding")
    elif linear_typing > 0.4 and paste_count <= 1:
        conclusion_parts.append("Mostly original work with minimal external code")
    elif paste_count > 2 or (paste_count > 0 and linear_typing < 0.3):
        conclusion_parts.append("Significant reliance on copy-pasted code - review pasted content carefully")
    
    # Problem-solving approach
    if refine_cycles >= 4:
        conclusion_parts.append("Excellent iterative problem-solving approach with multiple test-and-refine cycles")
    elif refine_cycles >= 2:
        conclusion_parts.append("Good iterative development pattern")
    elif run_count == 0:
        conclusion_parts.append("Did not test code before submission - may indicate uncertainty or time pressure")
    elif refine_cycles == 0 and run_count > 0:
        conclusion_parts.append("Limited iteration - code may have worked on first attempt or candidate gave up early")
    
    # AI usage assessment
    if ai_count == 0:
        conclusion_parts.append("Completed task independently without AI assistance")
    elif ai_count <= 2:
        conclusion_parts.append("Minimal AI usage - shows self-reliance")
    elif ai_count <= 5:
        conclusion_parts.append("Moderate AI assistance - reasonable use of available tools")
    else:
        conclusion_parts.append(f"Heavy AI reliance ({ai_count} queries) - may indicate struggle with core concepts")
    
    # Focus and engagement
    if focus_percent >= 90:
        conclusion_parts.append("Highly focused throughout the assessment")
    elif focus_percent >= 70:
        conclusion_parts.append("Good focus with minimal distractions")
    elif focus_percent < 50:
        conclusion_parts.append(f"Spent {100-int(focus_percent)}% of time away from task - possible external research or distraction")
    
    # Efficiency assessment
    if total_time > 0:
        mins = int(total_time / 60)
        if edits_per_run > 10:
            conclusion_parts.append("Thoughtful approach - makes many changes before testing")
        elif edits_per_run > 0 and edits_per_run < 3:
            conclusion_parts.append("Quick iteration style - tests frequently")
    
    # Overall recommendation
    score = 0
    if linear_typing > 0.5: score += 25
    if refine_cycles >= 2: score += 20
    if paste_count == 0: score += 20
    if ai_count <= 3: score += 15
    if focus_percent >= 70: score += 10
    if run_count >= 2: score += 10
    
    if score >= 80:
        recommendation = "STRONG CANDIDATE - Shows authentic problem-solving skills and good development practices."
    elif score >= 60:
        recommendation = "PROMISING CANDIDATE - Demonstrates competence with some areas for discussion in interview."
    elif score >= 40:
        recommendation = "NEEDS REVIEW - Mixed signals; recommend deeper technical interview to assess true ability."
    else:
        recommendation = "CONCERNS NOTED - Multiple red flags suggest possible over-reliance on external resources."
    
    # Compile final conclusion
    if conclusion_parts:
        return f"{'. '.join(conclusion_parts)}. \n\n{recommendation}"
    return recommendation
