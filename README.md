# Bill Splitter

A stateless web app where you log in, upload a receipt photo, and chat with an AI to split or analyze the bill.

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

---

## Backend Setup

```bash
cd backend
```

Create a `.env` file:

```env
APP_USERNAME=admin
APP_PASSWORD=secret123
JWT_SECRET=your-very-secure-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
GEMINI_API_KEY=your-gemini-api-key
```

Install dependencies and start the server:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Usage

1. Open `http://localhost:5173` in your browser
2. Log in with the `APP_USERNAME` and `APP_PASSWORD` from your `.env`
3. Click the image icon to upload a receipt photo
4. Chat with the AI to split the bill, exclude charges, or analyze items

---

## API

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | public | Returns a JWT token |
| POST | `/invoice/parse` | Bearer JWT | Parses a base64 receipt image into structured JSON |
| POST | `/chat/message` | Bearer JWT | Sends a message + invoice + history, returns an action response |
