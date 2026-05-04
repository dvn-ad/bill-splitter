# Bill Splitter

A stateless web app where you log in, upload a receipt photo, and chat with an AI to split or analyze the bill.

---

## Quick Start (Docker)

The easiest way to run the entire system (Frontend & Backend) is using Docker Compose.

1.  **Prepare Backend Environment:**
    Create `backend/.env` (see [Backend Setup](#backend-setup) for variables).

2.  **Run with Docker:**
    ```bash
    docker-compose up --build
    ```
    - Frontend: `http://localhost`
    - Backend API: `http://localhost:8000`

---

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```
Create a `.env` file in `backend/`:
```env
APP_USERNAME=admin
APP_PASSWORD=secret123
JWT_SECRET=your-very-secure-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
GEMINI_API_KEY=your-gemini-api-key
```
Start server: `uvicorn app.main:app --reload --port 8000`

### Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:8000
```
Start app: `npm run dev` (available at `http://localhost:5173`)

---

## Deployment

### Backend (Docker-ready)
The `backend/Dockerfile` is ready for deployment to **Render**, **Railway**, or **Google Cloud Run**. Ensure all environment variables are set in your cloud provider's console.

### Frontend (Vercel/Netlify)
The project includes `frontend/vercel.json` for easy deployment to **Vercel**.
1. Connect your repo to Vercel.
2. Set the Root Directory to `frontend`.
3. Add Environment Variable: `VITE_API_URL` pointing to your deployed backend.

---

## Usage
1. Log in with the `APP_USERNAME` and `APP_PASSWORD`.
2. Upload a receipt photo via the image icon.
3. Chat with AI to split the bill or analyze items.
