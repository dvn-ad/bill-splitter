# Getting Started

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose, **or** Node.js 18+ and Python 3.11+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

## Option 1 — Docker (recommended)

**1. Create `backend/.env`**

```env
JWT_SECRET=your-very-secure-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL=postgresql://user:password@host:port/dbname
REDIS_URL=redis://default:password@host:port
```

**2. Build and run**

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost:8000 |

---

## Option 2 — Manual

**Backend**

```bash
cd backend
source .venv/bin/activate   # or python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# create backend/.env as shown above
uvicorn app.main:app --reload --port 8000
```

**Frontend** (separate terminal)

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

> Make sure `frontend/.env` contains `VITE_API_URL=http://localhost:8000`.
