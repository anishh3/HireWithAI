from contextlib import asynccontextmanager
from pathlib import Path
import json
import os

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import distinct

from auth import hash_password, verify_password
from database import get_db, init_db, SessionLocal
from models import Candidate, Recruiter, Task, Event, Submission
from schemas import (
    LoginRequest, LoginResponse, SignupRequest, EventRequest,
    SubmitRequest, SubmitResponse, RunRequest, RunResponse,
    EmployerResponse, EmployerMetrics, AiChatRequest, AiChatResponse,
)
from metrics import compute_metrics, generate_insight, generate_conclusion
from runner import run_tests, run_code


def seed_task(db: Session):
    if db.query(Task).first():
        return
    task = Task(
        title="FizzBuzz",
        description="Write a function fizzbuzz(n) that returns a list of strings from 1 to n. For multiples of 3 use 'Fizz', for multiples of 5 use 'Buzz', for both use 'FizzBuzz'. Otherwise return the number as a string.",
        expected_time=15,
    )
    db.add(task)
    db.commit()


def seed_recruiter(db: Session):
    if db.query(Recruiter).first():
        return
    recruiter = Recruiter(
        email="recruiter@hirewithai.com",
        password_hash=hash_password("recruiter123"),
    )
    db.add(recruiter)
    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        seed_task(db)
        seed_recruiter(db)
    finally:
        db.close()
    yield


app = FastAPI(title="HireWithAI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "message": "HireWithAI API"}


@app.post("/auth/signup", response_model=LoginResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    if not email:
        raise HTTPException(400, "Email required")
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    if db.query(Candidate).filter(Candidate.email == email).first():
        raise HTTPException(400, "Email already registered")
    candidate = Candidate(email=email, password_hash=hash_password(req.password))
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return LoginResponse(candidate_id=candidate.id, email=candidate.email, role="candidate")


@app.post("/auth/login/candidate", response_model=LoginResponse)
def login_candidate(req: LoginRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    if not email or not req.password:
        raise HTTPException(400, "Email and password required")
    candidate = db.query(Candidate).filter(Candidate.email == email).first()
    if not candidate or not verify_password(req.password, candidate.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return LoginResponse(candidate_id=candidate.id, email=candidate.email, role="candidate")


@app.post("/auth/login/recruiter", response_model=LoginResponse)
def login_recruiter(req: LoginRequest, db: Session = Depends(get_db)):
    email = req.email.strip().lower()
    if not email or not req.password:
        raise HTTPException(400, "Email and password required")
    recruiter = db.query(Recruiter).filter(Recruiter.email == email).first()
    if not recruiter or not verify_password(req.password, recruiter.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return LoginResponse(candidate_id=None, email=recruiter.email, role="recruiter")


@app.post("/events")
def log_event(req: EventRequest, db: Session = Depends(get_db)):
    event = Event(
        candidate_id=req.candidate_id,
        task_id=req.task_id,
        event_type=req.event_type,
        metadata_=json.dumps(req.metadata) if req.metadata else None,
    )
    db.add(event)
    db.commit()
    return {"ok": True}


@app.post("/run", response_model=RunResponse)
def run(req: RunRequest, db: Session = Depends(get_db)):
    event = Event(candidate_id=req.candidate_id, task_id=req.task_id, event_type="code_run")
    db.add(event)
    db.commit()
    out = run_code(req.task_id, req.code or "")
    return RunResponse(stdout=out.get("stdout", ""), stderr=out.get("stderr", ""), run_error=out.get("run_error"))


@app.post("/submit", response_model=SubmitResponse)
def submit(req: SubmitRequest, db: Session = Depends(get_db)):
    event = Event(candidate_id=req.candidate_id, task_id=req.task_id, event_type="task_submitted")
    db.add(event)
    db.commit()

    test_result = run_tests(req.task_id, req.final_code or "")
    submission = Submission(
        candidate_id=req.candidate_id,
        task_id=req.task_id,
        final_code=req.final_code,
        reflection=req.reflection,
        tests_passed=test_result.get("tests_passed", 0),
        tests_total=test_result.get("tests_total", 0),
        test_results=json.dumps(test_result.get("results", [])),
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return SubmitResponse(
        submission_id=submission.id,
        tests_passed=test_result.get("tests_passed", 0),
        tests_total=test_result.get("tests_total", 0),
        run_error=test_result.get("run_error"),
        results=test_result.get("results", []),
    )


@app.get("/tasks")
def list_tasks(candidate_id: int | None = None, db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    result = []
    for t in tasks:
        item = {"id": t.id, "title": t.title, "description": t.description, "expected_time": t.expected_time}
        if candidate_id is not None:
            sub = db.query(Submission).filter(Submission.candidate_id == candidate_id, Submission.task_id == t.id).first()
            item["submitted"] = sub is not None
            item["tests_passed"] = sub.tests_passed if sub else None
            item["tests_total"] = sub.tests_total if sub else None
        result.append(item)
    return result


@app.get("/tasks/{task_id}")
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    return {"id": task.id, "title": task.title, "description": task.description, "expected_time": task.expected_time}


@app.get("/employer/{candidate_id}/{task_id}", response_model=EmployerResponse)
def employer_view(candidate_id: int, task_id: int, db: Session = Depends(get_db)):
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(404, "Candidate not found")
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(404, "Task not found")
    events = db.query(Event).filter(Event.candidate_id == candidate_id, Event.task_id == task_id).order_by(Event.timestamp).all()
    submission = db.query(Submission).filter(Submission.candidate_id == candidate_id, Submission.task_id == task_id).first()

    metrics_dict = compute_metrics(events)
    insight = generate_insight(metrics_dict)
    conclusion = generate_conclusion(metrics_dict, candidate.email, task.title)

    sub_data = None
    if submission:
        sub_data = {
            "id": submission.id, "final_code": submission.final_code, "reflection": submission.reflection,
            "tests_passed": submission.tests_passed, "tests_total": submission.tests_total,
            "created_at": submission.created_at.isoformat() if submission.created_at else None,
        }

    return EmployerResponse(
        candidate_id=candidate_id, task_id=task_id, email=candidate.email, task_title=task.title,
        metrics=EmployerMetrics(**metrics_dict), insight=insight, conclusion=conclusion, submission=sub_data,
    )


@app.get("/recruiter/candidates")
def recruiter_candidates(db: Session = Depends(get_db)):
    candidate_ids = [c[0] for c in db.query(distinct(Event.candidate_id)).all()]
    result = []
    for cid in candidate_ids:
        candidate = db.query(Candidate).filter(Candidate.id == cid).first()
        if not candidate:
            continue
        task_ids = [t[0] for t in db.query(distinct(Event.task_id)).filter(Event.candidate_id == cid).all()]
        for tid in task_ids:
            task = db.query(Task).filter(Task.id == tid).first()
            if not task:
                continue
            events = db.query(Event).filter(Event.candidate_id == cid, Event.task_id == tid).order_by(Event.timestamp).all()
            submission = db.query(Submission).filter(Submission.candidate_id == cid, Submission.task_id == tid).first()
            metrics_dict = compute_metrics(events)
            insight = generate_insight(metrics_dict)
            result.append({
                "candidate_id": cid, "email": candidate.email, "task_id": tid, "task_title": task.title,
                "metrics": metrics_dict, "insight": insight, "submitted": submission is not None,
            })
    return result


@app.post("/ai/chat", response_model=AiChatResponse)
async def ai_chat(req: AiChatRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return AiChatResponse(content="", error="OpenAI API key not configured")

    system = f"""You are an AI assistant for a coding assessment. The ONLY topic you may discuss is the current task.

Task: {req.task_title}
Description: {req.task_description}

STRICT RULES:
1. ONLY answer questions directly about this task: requirements, Python syntax needed, algorithms, hints, debugging tips.
2. REFUSE to answer greetings, chit-chat, off-topic questions, or anything unrelated to the task.
3. For off-topic messages (e.g. "hey", "hello", "what's the weather"), respond with ONLY: "I can only help with questions about the task. Try asking about the {req.task_title} requirements, Python syntax, or algorithms."
4. Do NOT give complete solutions. Give hints and guidance only."""

    messages = [{"role": "system", "content": system}] + [{"role": m.role, "content": m.content} for m in req.messages]

    try:
        import urllib.request
        body = json.dumps({"model": "gpt-4o-mini", "messages": messages, "max_tokens": 500})
        req_obj = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=body.encode(),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            method="POST",
        )
        with urllib.request.urlopen(req_obj, timeout=60) as resp:
            r = json.loads(resp.read().decode())
        content = r["choices"][0]["message"].get("content", "") or ""
        return AiChatResponse(content=content)
    except Exception as e:
        return AiChatResponse(content="", error=str(e))


if __name__ == "__main__":
    import uvicorn
    init_db()
    db = SessionLocal()
    try:
        seed_task(db)
        seed_recruiter(db)
    finally:
        db.close()
    uvicorn.run(app, host="0.0.0.0", port=8000)
