# ⚡ AuraStudy - AI-Powered Study Assistant

AuraStudy is a production-ready, startup-grade AI Co-Pilot designed to revolutionize how students study. Built with a modern glassmorphic dark theme, it allows students to upload their PDF notes and leverage Retrieval-Augmented Generation (RAG) to safely chat with documents, auto-generate summaries, extract formulas, practice with interactive AI-powered MCQs, and plan their study schedules dynamic blueprints.

---

## 📂 Project Architecture

```text
ai-study-assistant/
├── backend/
│   ├── app.py              # Flask Application Entrypoint
│   ├── wsgi.py             # WSGI Production Gate (Render Entry)
│   ├── config.py           # Configuration & Envs Handler
│   ├── requirements.txt    # Python Application Dependencies
│   ├── .env.example        # Environment Variables Template
│   ├── utils/
│   │   ├── db.py           # MongoDB Connection Layer
│   │   └── ai_helper.py    # OpenAI LLM Core Orchestration
│   └── routes/
│       ├── auth.py         # JWT Auth, Hashing & Streak Tracker
│       ├── pdf.py          # PDF Parser & Search Pipeline
│       ├── ai.py           # Core AI Modules (Chat, Quiz, Planner)
│       └── user.py         # User Data & Profile Handler
└── frontend/
    ├── index.html          # Main Shell Workspace UI
    ├── vercel.json         # Vercel SPA Redirection Rule Routing
    ├── css/
    │   └── style.css       # Glassmorphism Design System (Vanilla CSS)
    └── js/
        ├── api.js          # Core Fetch Interceptor Pipeline
        ├── auth.js         # Session & User Authentication State
        └── app.js          # Main Feature Logic Engine
