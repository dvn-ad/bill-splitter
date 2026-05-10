# Bill Splitter

A stateless web app that lets you upload a receipt photo and chat with an AI to split or analyze the bill.

**Live demo:** [bill-splitter-three-brown.vercel.app](https://bill-splitter-three-brown.vercel.app/)

---

## How it works

1. Log in or sign up for an account.
2. Upload a photo of your receipt (or use our sample receipt [here](./receipts/)) and let the AI extract the line items and total.

3. Tell the AI who ordered what and it calculates each person's share.

**Example prompts**
- *"Split by item — Alice had the pasta, Bob had the pizza, Charlie had the salad."*
- *"Split the bill equally between 4 people."*
- *"Remove the service charge."*
- *"How much did we spend on drinks?"*

---

## Running locally

See [GETTING_STARTED.md](./GETTING_STARTED.md) for Docker and manual setup instructions.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TailwindCSS, Vite |
| Backend | FastAPI, Python |
| AI | Google Gemini 2.5 Flash Lite (vision + chat) |
| Auth | JWT, bcrypt password hashing, Redis token blacklist |
| Database | PostgreSQL (Supabase) |
