# AI Tools Hub — Full Stack AI SaaS Application

## 🚀 Quick Start

### Frontend (React + Tailwind)
```bash
cd frontend
npm install
npm run dev
```
Open: **http://localhost:3000**

### Demo Login
- **Email:** `demo@aitools.com`
- **Password:** `demo123`

---

## 📁 Project Structure

```
website/
├── frontend/                  # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/             # Landing, Login, Signup, Dashboard, Tools, History, Profile, Settings
│   │   ├── components/        # Sidebar, TopBar, AI Tool components
│   │   │   └── tools/         # ImageGenerator, TextSummarizer, CaptionGenerator, PromptEnhancer
│   │   ├── context/           # AuthContext, AppContext
│   │   ├── layouts/           # DashboardLayout
│   │   └── utils/             # aiService.js (mock AI responses)
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/                   # FastAPI + SQLAlchemy + PostgreSQL
    ├── main.py
    ├── requirements.txt
    └── app/
        ├── api/routes/        # auth.py, users.py, tools.py, history.py
        ├── models/            # SQLAlchemy models
        ├── core/              # security.py, config.py
        └── db/                # database.py
```

---

## 🎨 Design

- **Dark futuristic theme** with purple/blue gradients
- **Glassmorphism** cards with backdrop blur
- **Smooth animations** (fade-in, float, pulse-glow)
- **Fully responsive** — mobile, tablet, desktop
- **Google Fonts** — Inter + Space Grotesk

---

## 🛠️ AI Tools (Frontend — Mock Mode)

| Tool | Credits | Description |
|------|---------|-------------|
| 🖼️ Image Generator | 5 | Text → image with style + ratio selection |
| 📝 Text Summarizer | 2 | Long text → key insights + stats |
| 💬 Caption Generator | 2 | Social media captions with tone |
| ✨ Prompt Enhancer | 1 | Basic prompt → optimized AI prompt |

---

## 🔒 Authentication

The frontend uses **mock auth** (no backend needed for demo).  
Demo account: `demo@aitools.com` / `demo123`

For production, connect to the **FastAPI backend**.

---

## 🗄️ Backend Setup (Optional — requires PostgreSQL)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Create .env file:
# DATABASE_URL=postgresql://user:password@localhost:5432/ai_tools_hub
# SECRET_KEY=your-secret-key

uvicorn main:app --reload --port 8000
```

API Docs: **http://localhost:8000/api/docs**

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Routing | React Router v6 |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Backend | FastAPI, Uvicorn |
| Database | PostgreSQL + SQLAlchemy |
| Auth | JWT + bcrypt |

---

## 🌐 Pages

1. **/** — Landing page (hero, features, pricing, CTA)
2. **/login** — Login with demo credentials
3. **/signup** — Registration with password strength meter
4. **/dashboard** — Stats overview + quick tools
5. **/dashboard/tools** — All 4 AI tools with tabs
6. **/dashboard/history** — Searchable generation history
7. **/dashboard/profile** — User info + achievements
8. **/dashboard/settings** — Notifications, privacy, plan

---

*Built as a premium portfolio project showcasing full-stack AI SaaS development.*
