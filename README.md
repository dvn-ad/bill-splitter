# Bill Splitter

A stateless web app where you log in, upload a receipt photo, and chat with an AI to split or analyze the bill.

---

## Quick Start (Docker)

The easiest way to run the entire system (Frontend & Backend) is using Docker Compose.

1.  **Prepare Backend Environment:**
    Create a `.env` file in `backend/`:
    ```env
    APP_USERNAME=admin
    APP_PASSWORD=secret123
    JWT_SECRET=your-very-secure-secret
    JWT_ALGORITHM=HS256
    JWT_EXPIRE_MINUTES=60
    GEMINI_API_KEY=your-gemini-api-key
    ```

2.  **Run with Docker:**
    ```bash
    docker-compose up --build
    ```
    - Frontend: `http://localhost`
    - Backend API: `http://localhost:8000`

---

## Deployed Login Credentials

| username | password  |
|:--:|:--:|
| admin | secret123 |