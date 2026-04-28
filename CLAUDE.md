# Bill Splitter — Project Guide

## What this app does

A stateless, session-based bill-splitting web app. Users log in, upload a receipt image, and chat with an AI to split or analyze the bill. A page refresh resets all state — there is no database or persistent storage.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Axios, TailwindCSS, Vite |
| Backend | FastAPI, Pydantic v2, Uvicorn |
| AI | Google Gemini API (Vision + Text) |
| Auth | JWT via python-jose, hardcoded credentials in `.env` |
| Storage | None |

## Architecture

```
Browser (React)
  AuthContext (JWT token in memory)
  InvoiceContext (invoice JSON + chat history[] in memory)
        │
        │ HTTPS + Bearer JWT
        ▼
FastAPI Backend (fully stateless)
  POST /auth/login
  POST /invoice/parse
  POST /chat/message
        │              │
        ▼              ▼
  Gemini Vision   Gemini Text
  (parse image)   (chat reasoning)
```

## Key architectural rules

- **Stateless backend** — no session, no DB. Every request carries all necessary context.
- **All state in React** — `AuthContext` for JWT, `InvoiceContext` for invoice JSON and chat history.
- **No eval** — Gemini computes results and returns structured JSON; the frontend never executes AI-generated code.
- **Single invoice per session** — uploading a new image replaces the current one.
- **Single currency per receipt** — IDR or USD only.

## Project Layout

```
backend/
  app/
    api/
      endpoints/   auth.py  invoice.py  chat.py
      router.py
    core/          config.py  security.py  dependencies.py
    models/        invoice.py  chat.py  auth.py
    services/      ai_service.py  parser_service.py
    utils/         currency.py
    main.py
  .env
  requirements.txt

frontend/
  src/
    context/       AuthContext.jsx  InvoiceContext.jsx
    pages/         LoginPage.jsx  ChatPage.jsx
    components/    ChatWindow.jsx  ChatBubble.jsx  InvoiceTable.jsx
                   ChatInput.jsx  UploadButton.jsx
    services/      api.js
    utils/         currency.js
    App.jsx  main.jsx
  .env
```

## Environment Variables

**backend/.env**
```
APP_USERNAME=admin
APP_PASSWORD=secret123
JWT_SECRET=your-very-secure-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
GEMINI_API_KEY=your-gemini-api-key
```

**frontend/.env**
```
VITE_API_URL=http://localhost:8000
```

## Running locally

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev          # runs on http://localhost:5173
```

## API surface

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /auth/login | public | Returns JWT |
| POST | /invoice/parse | Bearer JWT | Base64 image → Invoice JSON |
| POST | /chat/message | Bearer JWT | User message + invoice + history → ActionResponse |

## Data flow notes

- `InvoiceContext.chatHistory` is the **full conversation array** sent on every `/chat/message` call — Gemini is stateless.
- `ActionResponse.updated_invoice` is non-null only when the AI mutated the invoice (e.g. removed an item/charge). Frontend must call `updateInvoice()` when present.
- Currency formatting lives in `frontend/src/utils/currency.js` (`formatCurrency(amount, currency)`).
