from pydantic import BaseModel
from typing import Optional, Any


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    candidate_id: int | None = None
    email: str
    role: str


class EventRequest(BaseModel):
    candidate_id: int
    task_id: int
    event_type: str
    metadata: Optional[dict[str, Any]] = None


class SubmitRequest(BaseModel):
    candidate_id: int
    task_id: int
    final_code: Optional[str] = None
    reflection: Optional[str] = None


class SubmitResponse(BaseModel):
    submission_id: int
    tests_passed: int
    tests_total: int
    run_error: Optional[str] = None
    results: list[dict[str, Any]] = []


class RunRequest(BaseModel):
    candidate_id: int
    task_id: int
    code: Optional[str] = None


class RunResponse(BaseModel):
    stdout: str = ""
    stderr: str = ""
    run_error: Optional[str] = None


class EmployerMetrics(BaseModel):
    total_time_seconds: float
    edit_count: int
    run_count: int
    refine_cycles: int
    linear_typing_ratio: float = 0.0
    linear_typing_edits: int = 0
    ai_usage_count: int
    context_switch_seconds: float
    large_paste_count: int


class EmployerResponse(BaseModel):
    candidate_id: int
    task_id: int
    email: str
    task_title: str
    metrics: EmployerMetrics
    insight: str
    conclusion: Optional[str] = None
    submission: Optional[dict] = None


class AiChatMessage(BaseModel):
    role: str
    content: str


class AiChatRequest(BaseModel):
    task_title: str
    task_description: str
    messages: list[AiChatMessage]
    current_code: Optional[str] = None


class AiChatResponse(BaseModel):
    content: str
    error: Optional[str] = None
