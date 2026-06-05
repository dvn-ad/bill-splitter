# Bill Splitter

A stateless web app that lets you upload a receipt photo and chat with an AI to split or analyze the bill.

**Live demo:** [bill-splitter-three-brown.vercel.app](https://bill-splitter-three-brown.vercel.app/)

---

## How it works

1. Log in or sign up for an account.<br>
   <img width="600" height="375" alt="login" src="https://github.com/user-attachments/assets/9170c741-67cc-45bd-b255-682e9e265c51" />
2. Upload a photo of your receipt (or use our sample receipt [here](./receipts/)) and let the AI extract the line items and total.<br>
   <img width="600" height="375" alt="upload" src="https://github.com/user-attachments/assets/e7476d53-2ff1-42f6-9b6a-61a70f41d55e" />
3. Tell the AI who ordered what and it calculates each person's share.<br>
   <img width="600" height="375" alt="split" src="https://github.com/user-attachments/assets/f4ec9868-72bd-473f-b312-5b443356949e" />
   <img width="600" height="375" alt="tax" src="https://github.com/user-attachments/assets/87f9e06f-353a-4369-b051-26f9aef23c7b" />

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
