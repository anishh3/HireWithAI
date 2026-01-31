# HireWithAI – Hackathon MVP

Evaluates candidates by **how they work** on a real task (workflow signals), not correctness or resumes. No proctoring, no scoring, no rankings.

## Stack

- **Backend:** FastAPI + SQLite + SQLAlchemy
- **Frontend:** Next.js (App Router) + React + Monaco Editor
- **Auth:** Email-only login (auto-create user)

## Quick start

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Set `OPENAI_API_KEY` in the environment (or a `.env` file) so the Ask AI chat works:

```bash
set OPENAI_API_KEY=sk-...   # Windows
export OPENAI_API_KEY=sk-... # macOS/Linux
```

Then run:

```bash
python main.py
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

Optional: set `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local` if the API is elsewhere.

## Flow

1. **Candidate:** Login with email → Dashboard (one task) → Task workspace (instructions, Monaco, timer, Run, Ask AI) → Submit → Reflection.
2. **Employer:** `/employer` — enter candidate ID + task ID to see metrics table and AI-generated insight (no scores).

## API

- `POST /auth/login` — email-only login, auto-create candidate
- `POST /events` — log telemetry (task_started, code_edit, code_run, ai_used, tab_hidden/visible, large_paste, task_submitted)
- `POST /submit` — final code + reflection
- `GET /employer/{candidate_id}/{task_id}` — metrics + insight

One task (FizzBuzz) is seeded on first run.
