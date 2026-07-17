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
🛠️ Tech Stack
Frontend: HTML5, CSS3 (Custom Glassmorphic Variables), Vanilla JavaScript.

Backend: Python Flask (Blueprint Modular Routing).

Database: MongoDB Atlas (NoSQL Cloud Storage).

AI Engine: OpenAI Compatible API (gpt-4o-mini).

Production Deployment: Vercel (Frontend), Render (Backend).

⚙️ Environment Variables
Create a .env file inside the backend/ directory using this template:

Code snippet
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/study_assistant_db?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
OPENAI_API_KEY=your_openai_compatible_api_key_here
OPENAI_BASE_URL=[https://api.openai.com/v1](https://api.openai.com/v1)
🚀 Installation & Local Setup
1. Run Backend Engine
Bash
cd backend
python -m venv venv
# Activate virtual environment
source venv/bin/activate  # Windows user: .\venv\Scripts\activate
pip install -r requirements.txt
python app.py
The server will boot up at http://127.0.0.1:5000.

2. Run Frontend Client
Simply serve the frontend/ directory using any local development tool (e.g., Live Server in VS Code, or Python Http Server):

Bash
cd frontend
python3 -m http.server 8000
Open your browser at http://localhost:8000.
🌐 Deployment Guide
Backend: Render
Connect your GitHub repository to Render.com as a Web Service.

Configure settings:

Root Directory: backend

Runtime: Python 3

Build Command: pip install -r requirements.txt

Start Command: gunicorn wsgi:app

Add environment variables in the Render Dashboard under Environment.

Frontend: Vercel
Ensure your frontend/js/api.js points to the live Render backend URL:

JavaScript
const API_BASE_URL = "[https://your-backend-app.onrender.com/api](https://your-backend-app.onrender.com/api)";
Connect the repository to Vercel.com.

Set the Root Directory to frontend and click Deploy.

📑 API Documentation Summary
🔑 Authentication
POST /api/auth/register - Registers a new user. Expects name, email, password.

POST /api/auth/login - Logs in a user, validates password, and returns a JWT session token + study streak updates.

📄 PDF Engine
POST /api/pdf/upload - Securely parses binary stream PDFs, extracts contextual strings, and commits document metadata.

GET /api/pdf/list - Fetches all documents owned by the current authenticated session.

GET /api/pdf/search?q=query - Regular expression matching system over the titles in the study vault.
🤖 AI Core Intelligence
GET /api/ai/summary/<pdf_id> - Synchronizes comprehensive summaries, core terms, and formulas.

POST /api/ai/chat - Connects context vectors for strictly bounded RAG execution. Returns fallback token responses if outside source material range.

GET /api/ai/quiz/<pdf_id> - Automatically structuralizes a 10 multiple-choice layout with reasoning blocks.

GET /api/ai/flashcards/<pdf_id> - Synthesizes functional digital active recall flashcard decks.

POST /api/ai/planner - Evaluates milestone target paths based on targeted subject density inputs.
