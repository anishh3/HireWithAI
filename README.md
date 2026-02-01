# HireWithAI

A modern hiring platform that evaluates candidates based on **workflow signals** rather than traditional metrics. Built for hackathons and technical assessments, HireWithAI provides recruiters with deep insights into how candidates actually work—without invasive proctoring.

![HireWithAI](https://img.shields.io/badge/Status-MVP-blue) ![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black) ![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688) ![Python](https://img.shields.io/badge/Python-3.10+-yellow)

---

## 🎯 What Makes HireWithAI Different?

Traditional coding assessments focus on **what** candidates produce. HireWithAI focuses on **how** they produce it:

| Traditional Approach | HireWithAI Approach |
|---------------------|---------------------|
| Pass/Fail scoring | Workflow analysis |
| Proctoring & surveillance | Respectful telemetry |
| Final code only | Development journey |
| Binary decisions | Nuanced insights |

---

## ✨ Key Features

### For Candidates
- **Clean Coding Environment** — Monaco Editor with syntax highlighting
- **Real-time Terminal** — See stdout/stderr as you code
- **AI Assistant** — Task-relevant help (GPT-powered, context-aware)
- **Multiple Tasks** — Tackle various coding challenges
- **Progress Tracking** — View completed submissions

### For Recruiters
- **Workflow Analytics** — Deep insights into coding behavior
- **AI-Driven Conclusions** — Automated candidate assessments
- **Authenticity Detection** — Identify copy-paste vs manual coding
- **Focus Tracking** — Time on task vs time away
- **Visual Dashboards** — Charts for quick pattern recognition

---

## 📊 Metrics We Track

HireWithAI captures meaningful workflow signals:

| Metric | What It Tells You |
|--------|-------------------|
| **Linear Typing Ratio** | % of edits that are small (1-5 chars) — indicates manual typing |
| **Refine Cycles** | Edit → Run → Edit sequences — shows iterative problem-solving |
| **Large Paste Detection** | Blocks of 50+ chars pasted — flags external code |
| **AI Usage Count** | How often candidate used the AI assistant |
| **Context Switch Time** | Seconds spent away from the task tab |
| **Edits Per Run** | Coding style — quick iterators vs careful planners |

---

## 🏗️ Architecture

```
HireWithAI/
├── backend/                 # FastAPI Python backend
│   ├── main.py             # API endpoints
│   ├── models.py           # SQLAlchemy ORM models
│   ├── schemas.py          # Pydantic validation
│   ├── metrics.py          # Workflow computation & AI conclusions
│   ├── runner.py           # Isolated code execution
│   ├── auth.py             # Password hashing utilities
│   └── database.py         # SQLite connection
│
├── frontend/               # Next.js 14 React frontend
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── login/          # Authentication
│   │   ├── signup/         # Registration
│   │   ├── dashboard/      # Candidate task list
│   │   ├── task/[taskId]/  # Coding workspace
│   │   ├── recruiter/      # Recruiter dashboard
│   │   ├── submissions/    # Candidate submissions
│   │   └── settings/       # User settings
│   ├── components/         # Reusable UI components
│   └── lib/                # API client & utilities
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- OpenAI API Key (for AI assistant)

### 1. Clone the Repository
```bash
git clone https://github.com/anishh3/HireWithAI.git
cd HireWithAI
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
echo "OPENAI_API_KEY=your_api_key_here" > .env

# Run the server
python -m uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

### 4. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/login` | Authenticate candidate |
| `POST` | `/signup` | Register new candidate |
| `GET` | `/tasks` | List available tasks |
| `GET` | `/tasks/{id}` | Get task details |
| `POST` | `/telemetry` | Log workflow events |
| `POST` | `/run` | Execute code & return output |
| `POST` | `/submit` | Submit final solution |
| `POST` | `/ai/chat` | AI assistant (task-relevant only) |
| `GET` | `/recruiter/candidates` | Get all candidate analytics |

---

## 🧠 AI Conclusion System

The platform generates intelligent assessments based on behavioral patterns:

```
STRONG CANDIDATE (80+ score)
├── High linear typing ratio (manual coding)
├── Multiple refine cycles (iterative approach)
├── Minimal paste activity
├── Reasonable AI usage
└── Good focus throughout

CONCERNS NOTED (<40 score)
├── Low linear typing (possible copy-paste)
├── No test runs before submission
├── Heavy AI reliance
└── Significant time away from task
```

---

## 🎨 UI/UX Philosophy

- **Dark Mode First** — Easy on the eyes during long assessments
- **Premium Aesthetic** — Inspired by Linear, Vercel, Notion
- **Non-Judgmental Language** — Insights, not accusations
- **Clear Hierarchy** — Important information stands out
- **Minimal Friction** — Candidates focus on coding, not UI

---

## 🛡️ Privacy & Ethics

HireWithAI is designed with respect for candidates:

- ❌ No webcam monitoring
- ❌ No screen recording
- ❌ No keystroke logging of content
- ❌ No browser history access
- ✅ Only workflow patterns (timing, counts, sequences)
- ✅ Transparent about what's tracked
- ✅ Data used for insights, not surveillance

---

## 📦 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Monaco Editor
- Recharts (visualizations)
- TypeScript

**Backend:**
- FastAPI
- SQLAlchemy + SQLite
- Pydantic
- Python subprocess (isolated execution)

**AI:**
- OpenAI GPT API (for assistant & conclusions)

---

## 🗺️ Roadmap

- [ ] Multi-language support (JavaScript, Java, Go)
- [ ] Team collaboration features
- [ ] Custom task creation for recruiters
- [ ] Interview scheduling integration
- [ ] Export reports (PDF/CSV)
- [ ] Comparative analytics across candidates

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Anish**
- GitHub: [@anishh3](https://github.com/anishh3)

---

<p align="center">
  Built with ❤️ for better hiring decisions
</p>
