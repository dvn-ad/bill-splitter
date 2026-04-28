# Bill Splitter — Full Technical System Specification

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Data Models](#4-data-models)
5. [Backend — FastAPI](#5-backend--fastapi)
   - [Project Structure](#51-project-structure)
   - [Environment Variables](#52-environment-variables)
   - [Auth Endpoints](#53-auth-endpoints)
   - [Invoice Endpoints](#54-invoice-endpoints)
   - [Chat Endpoints](#55-chat-endpoints)
   - [Middleware & Security](#56-middleware--security)
6. [AI Layer — Gemini](#6-ai-layer--gemini)
   - [Invoice Parsing Prompt](#61-invoice-parsing-prompt)
   - [Chatbot System Prompt](#62-chatbot-system-prompt)
   - [Action Schema](#63-action-schema)
7. [Frontend — React](#7-frontend--react)
   - [Project Structure](#71-project-structure)
   - [State Management](#72-state-management)
   - [Component Breakdown](#73-component-breakdown)
   - [API Service Layer](#74-api-service-layer)
8. [Full Request Flows](#8-full-request-flows)
   - [Login Flow](#81-login-flow)
   - [Invoice Upload & Parse Flow](#82-invoice-upload--parse-flow)
   - [Chat Flow](#83-chat-flow)
9. [Currency Formatting](#9-currency-formatting)
10. [Error Handling](#10-error-handling)
11. [Constraints & Limitations](#11-constraints--limitations)

---

## 1. System Overview

Bill Splitter is a stateless, session-based web app. Users log in, upload a receipt image, and interact with an AI chatbot to split or analyze the bill. All state lives in the browser — no database, no persistent storage. A page refresh resets everything.

**Core principles:**
- Backend is fully stateless — every request carries all necessary context
- AI (Gemini) handles both image parsing and chat reasoning
- Frontend holds all session state in React Context
- No code is eval'd — AI computes results and returns structured JSON

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Axios, TailwindCSS |
| Backend | FastAPI, Pydantic, Uvicorn |
| AI | Google Gemini API (Vision + Text) |
| Auth | JWT (python-jose), hardcoded credentials |
| Storage | None (stateless) |
| Database | None (stateless) |

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────┐
│              Browser (React)            │
│                                         │
│  ┌──────────┐  ┌──────────────────────┐ │
│  │ AuthCtx  │  │    InvoiceContext    │ │
│  │ JWT token│  │  invoice JSON        │ │
│  └──────────┘  │  chat history[]      │ │
│                └──────────────────────┘ │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │           Chat Page              │   │
│  │  [Upload Btn] [Textbox] [Send]   │   │
│  └──────────────────────────────────┘   │
└────────────────┬────────────────────────┘
                 │ HTTPS + Bearer JWT
┌────────────────▼────────────────────────┐
│           FastAPI Backend               │
│                                         │
│  POST /auth/login                       │
│  POST /invoice/parse                    │
│  POST /chat/message                     │
│                                         │
└────────┬──────────────┬─────────────────┘
         │              │
         ▼              ▼
   Gemini Vision   Gemini Text
   (parse image)   (chat reasoning)
```

---

## 4. Data Models

### 4.1 InvoiceItem

```python
class InvoiceItem(BaseModel):
    name: str           # e.g. "Nasi Goreng"
    price: float        # unit price
    quantity: int       # number of units
    subtotal: float     # price * quantity
```

### 4.2 Invoice

```python
class Invoice(BaseModel):
    currency: Literal["IDR", "USD"]
    subtotal: float          # sum of all item subtotals
    tax: float               # tax amount (0 if none)
    service_charge: float    # service charge (0 if none)
    total: float             # subtotal + tax + service_charge
    items: List[InvoiceItem]
```

### 4.3 ChatMessage

```python
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str             # plain text for user, explanation string for assistant
```

### 4.4 ChatRequest (sent to backend)

```python
class ChatRequest(BaseModel):
    message: str                    # latest user input
    invoice: Invoice                # full invoice JSON
    history: List[ChatMessage]      # full prior conversation
```

### 4.5 ActionResponse (returned from /chat/message)

```python
class ActionResponse(BaseModel):
    operation: str                  # e.g. "split_equal"
    variables: Dict[str, Any]       # inputs used
    expression: str                 # human-readable equation
    result: Any                     # computed value(s)
    explanation: str                # natural language summary
    updated_invoice: Optional[Invoice]  # present only if invoice was mutated
```

### 4.6 LoginRequest / LoginResponse

```python
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

---

## 5. Backend — FastAPI

### 5.1 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── auth.py         # POST /auth/login
│   │   │   ├── invoice.py      # POST /invoice/parse
│   │   │   └── chat.py         # POST /chat/message
│   │   └── router.py           # Registers all routers
│   ├── core/
│   │   ├── config.py           # Loads .env via pydantic BaseSettings
│   │   ├── security.py         # JWT creation and verification
│   │   └── dependencies.py     # get_current_user() dependency
│   ├── models/
│   │   ├── invoice.py          # Invoice, InvoiceItem Pydantic models
│   │   ├── chat.py             # ChatMessage, ChatRequest, ActionResponse
│   │   └── auth.py             # LoginRequest, LoginResponse
│   ├── services/
│   │   ├── ai_service.py       # All Gemini API calls
│   │   └── parser_service.py   # Post-process and validate Gemini output
│   ├── utils/
│   │   └── currency.py         # Currency detection helpers
│   └── main.py                 # App entry point, CORS setup
├── .env
└── requirements.txt
```

---

### 5.2 Environment Variables

```env
# .env
APP_USERNAME=admin
APP_PASSWORD=secret123
JWT_SECRET=your-very-secure-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
GEMINI_API_KEY=your-gemini-api-key
```

---

### 5.3 Auth Endpoints

#### `POST /auth/login`

Validates credentials against `.env` values. Returns a JWT.

**Request body:**
```json
{
  "username": "admin",
  "password": "secret123"
}
```

**Response `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Response `401 Unauthorized`:**
```json
{
  "detail": "Invalid credentials"
}
```

**Logic (`auth.py`):**
```python
@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, settings: Settings = Depends(get_settings)):
    if body.username != settings.APP_USERNAME or body.password != settings.APP_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": body.username})
    return {"access_token": token, "token_type": "bearer"}
```

**JWT payload:**
```json
{
  "sub": "admin",
  "exp": 1234567890
}
```

---

### 5.4 Invoice Endpoints

#### `POST /invoice/parse`

Accepts a base64-encoded image. Passes it to Gemini Vision. Returns structured invoice JSON.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body:**
```json
{
  "image_base64": "/9j/4AAQSkZJRgABAQAA...",
  "media_type": "image/jpeg"
}
```

**Response `200 OK`:**
```json
{
  "currency": "IDR",
  "subtotal": 120000,
  "tax": 12000,
  "service_charge": 6000,
  "total": 138000,
  "items": [
    { "name": "Nasi Goreng", "price": 45000, "quantity": 2, "subtotal": 90000 },
    { "name": "Es Teh", "price": 15000, "quantity": 2, "subtotal": 30000 }
  ]
}
```

**Response `422 Unprocessable Entity`** (if Gemini fails to extract):
```json
{
  "detail": "Could not extract invoice from image. Please try a clearer photo."
}
```

**Logic (`invoice.py`):**
```python
@router.post("/parse", response_model=Invoice)
async def parse_invoice(
    body: ParseRequest,
    current_user: str = Depends(get_current_user)
):
    raw = await ai_service.extract_invoice(body.image_base64, body.media_type)
    invoice = parser_service.validate_and_clean(raw)
    return invoice
```

---

### 5.5 Chat Endpoints

#### `POST /chat/message`

Accepts the user message, full invoice JSON, and chat history. Returns a structured action response.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body:**
```json
{
  "message": "Split equally between 3 people",
  "invoice": { ...full Invoice object... },
  "history": [
    { "role": "user", "content": "What's the total?" },
    { "role": "assistant", "content": "The total is Rp 138.000" }
  ]
}
```

**Response `200 OK`:**
```json
{
  "operation": "split_equal",
  "variables": { "total": 138000, "people": 3 },
  "expression": "total / people",
  "result": 46000,
  "explanation": "Split Rp 138.000 equally between 3 people. Each person pays Rp 46.000.",
  "updated_invoice": null
}
```

**Response when invoice is mutated** (e.g. "remove service charge"):
```json
{
  "operation": "exclude_charge",
  "variables": { "service_charge": 6000 },
  "expression": "total - service_charge",
  "result": 132000,
  "explanation": "Service charge of Rp 6.000 removed. New total is Rp 132.000.",
  "updated_invoice": { ...updated Invoice object with service_charge: 0... }
}
```

**Logic (`chat.py`):**
```python
@router.post("/message", response_model=ActionResponse)
async def chat_message(
    body: ChatRequest,
    current_user: str = Depends(get_current_user)
):
    response = await ai_service.chat(
        message=body.message,
        invoice=body.invoice,
        history=body.history
    )
    return response
```

---

### 5.6 Middleware & Security

**CORS (`main.py`):**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**JWT Dependency (`dependencies.py`):**
```python
def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
```

All `/invoice` and `/chat` routes use `Depends(get_current_user)`. Only `/auth/login` is public.

---

## 6. AI Layer — Gemini

### 6.1 Invoice Parsing Prompt

Sent to **Gemini Vision** alongside the base64 image:

```
You are an invoice data extractor.

Extract the following from the receipt image and return ONLY valid JSON.
No explanation, no markdown, no backticks.

Return this exact schema:
{
  "currency": "IDR" or "USD",
  "subtotal": <number>,
  "tax": <number or 0>,
  "service_charge": <number or 0>,
  "total": <number>,
  "items": [
    {
      "name": <string>,
      "price": <unit price as number>,
      "quantity": <integer>,
      "subtotal": <price * quantity>
    }
  ]
}

Rules:
- Detect currency from symbols (Rp = IDR, $ = USD)
- If tax or service charge is not present, use 0
- All prices must be plain numbers, no currency symbols
- Do not infer or guess items not visible in the image
```

---

### 6.2 Chatbot System Prompt

Sent with every `/chat/message` request as the system context:

```
You are a bill splitting assistant. You help users analyze and split invoices.

You have access to the following invoice data:
{invoice_json}

The user's conversation history is:
{chat_history}

You must ALWAYS respond with a single valid JSON object. No explanation outside the JSON.
No markdown, no backticks.

Use this exact schema:
{
  "operation": <string>,
  "variables": <object of values used>,
  "expression": <human-readable equation string>,
  "result": <computed value — number, array, or object>,
  "explanation": <friendly natural language summary>,
  "updated_invoice": <full updated invoice object, or null if unchanged>
}

Supported operations:
- split_equal         → divide total by N people
- split_by_item       → assign specific items to specific people
- exclude_item        → remove an item and recalculate total
- exclude_charge      → remove tax or service_charge and recalculate
- sum_category        → sum items matching a description (e.g. "drinks")
- compare_amount      → compare a given amount against a split result
- update_item_price   → correct a misread item price and recalculate

If the user's request is unclear, set operation to "clarify" and use the
explanation field to ask a follow-up question.

All monetary results must be in the same currency as the invoice.
```

---

### 6.3 Action Schema

Full list of supported operations and their result shapes:

| Operation | Result Type | Example Result |
|---|---|---|
| `split_equal` | `number` | `46000` |
| `split_by_item` | `object` | `{"Alice": 60000, "Bob": 78000}` |
| `exclude_item` | `number` | new total |
| `exclude_charge` | `number` | new total |
| `sum_category` | `number` | sum of matched items |
| `compare_amount` | `object` | `{"enough": true, "difference": 4000}` |
| `update_item_price` | `number` | new total |
| `clarify` | `null` | null |

---

## 7. Frontend — React

### 7.1 Project Structure

```
frontend/
├── src/
│   ├── context/
│   │   ├── AuthContext.jsx       # JWT token, login/logout
│   │   └── InvoiceContext.jsx    # invoice JSON, chat history, setters
│   ├── pages/
│   │   ├── LoginPage.jsx         # Login form
│   │   └── ChatPage.jsx          # Main app screen
│   ├── components/
│   │   ├── ChatWindow.jsx        # Scrollable message list
│   │   ├── ChatBubble.jsx        # Single message bubble (user or AI)
│   │   ├── InvoiceTable.jsx      # Renders invoice.items as a table
│   │   ├── ChatInput.jsx         # Textbox + Send button + Upload button
│   │   └── UploadButton.jsx      # File input trigger, base64 conversion
│   ├── services/
│   │   └── api.js                # All Axios calls (login, parse, chat)
│   ├── utils/
│   │   └── currency.js           # formatCurrency(amount, currency)
│   ├── App.jsx                   # Route guard: Login or ChatPage
│   └── main.jsx
├── .env
└── tailwind.config.js
```

---

### 7.2 State Management

**AuthContext** — stores JWT token in memory:
```javascript
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);               // null = not logged in

  const login = (jwt) => setToken(jwt);
  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**InvoiceContext** — stores invoice and chat history:
```javascript
const InvoiceContext = createContext();

export function InvoiceProvider({ children }) {
  const [invoice, setInvoice] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const addMessage = (role, content) => {
    setChatHistory(prev => [...prev, { role, content }]);
  };

  const updateInvoice = (updated) => setInvoice(updated);

  return (
    <InvoiceContext.Provider value={{ invoice, setInvoice, chatHistory, addMessage, updateInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
}
```

---

### 7.3 Component Breakdown

#### `App.jsx` — Route Guard
```jsx
function App() {
  const { token } = useAuth();
  return token ? <ChatPage /> : <LoginPage />;
}
```

#### `LoginPage.jsx`
- Username + password inputs
- On submit → calls `api.login()` → stores token via `AuthContext.login()`
- On error → shows inline error message

#### `ChatPage.jsx`
- Renders `<ChatWindow />` + `<ChatInput />`
- If `invoice` exists in context, renders `<InvoiceTable />` above chat

#### `ChatInput.jsx`
- `<UploadButton />` triggers file picker
- Textbox controlled input
- Send button calls `handleSend()`

#### `UploadButton.jsx`
```javascript
const handleFile = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result.split(",")[1];
    const mediaType = file.type;
    onUpload(base64, mediaType);     // passed up to ChatPage
  };
  reader.readAsDataURL(file);
};
```

#### `ChatBubble.jsx`
- `role === "user"` → right-aligned bubble
- `role === "assistant"` → left-aligned bubble, renders `explanation` text
- If message contains a result table (split_by_item), renders a mini table

#### `InvoiceTable.jsx`
- Renders `invoice.items` as a table: Name | Qty | Unit Price | Subtotal
- Footer row: Subtotal | Tax | Service Charge | **Total**
- All values formatted via `formatCurrency(amount, invoice.currency)`

---

### 7.4 API Service Layer

```javascript
// services/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL; // e.g. http://localhost:8000

const client = axios.create({ baseURL: BASE_URL });

// Attach token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // actually from AuthContext in practice
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {

  login: (username, password) =>
    client.post("/auth/login", { username, password }),

  parseInvoice: (image_base64, media_type) =>
    client.post("/invoice/parse", { image_base64, media_type }),

  sendMessage: (message, invoice, history) =>
    client.post("/chat/message", { message, invoice, history }),

};
```

---

## 8. Full Request Flows

### 8.1 Login Flow

```
1. User fills username + password → clicks Login
2. LoginPage calls api.login(username, password)
3. POST /auth/login → FastAPI
4. FastAPI checks against APP_USERNAME / APP_PASSWORD in .env
5. Match → create JWT → return { access_token, token_type }
6. Frontend: AuthContext.login(access_token)
7. App.jsx re-renders → token exists → show ChatPage
```

---

### 8.2 Invoice Upload & Parse Flow

```
1. User clicks Upload → selects image file
2. UploadButton converts file → base64 string
3. ChatPage calls api.parseInvoice(base64, mediaType)
4. POST /invoice/parse → FastAPI (with Bearer token)
5. get_current_user() dependency validates JWT
6. ai_service.extract_invoice() builds Gemini Vision request:
   - system prompt (extraction instructions)
   - user message containing base64 image
7. Gemini returns raw JSON string
8. parser_service.validate_and_clean() parses + validates against Invoice schema
9. If invalid → raise 422
10. If valid → return Invoice JSON to frontend
11. Frontend: InvoiceContext.setInvoice(data)
12. InvoiceTable renders on ChatPage
13. ChatWindow shows assistant bubble: "Invoice loaded! Here's what I found."
```

---

### 8.3 Chat Flow

```
1. User types message → clicks Send
2. ChatPage:
   a. addMessage("user", message) → appended to chatHistory
   b. calls api.sendMessage(message, invoice, chatHistory)
3. POST /chat/message → FastAPI (with Bearer token)
4. get_current_user() validates JWT
5. ai_service.chat() builds Gemini text request:
   - system prompt with invoice JSON + chat history injected
   - latest user message
6. Gemini returns raw JSON string (ActionResponse shape)
7. FastAPI parses into ActionResponse model
8. Returns ActionResponse to frontend
9. Frontend:
   a. addMessage("assistant", response.explanation)
   b. If response.updated_invoice → InvoiceContext.updateInvoice(updated_invoice)
   c. ChatBubble renders explanation text
   d. If operation is split_by_item → render result as mini table
10. Textbox clears, ready for next message
```

---

## 9. Currency Formatting

```javascript
// utils/currency.js
export function formatCurrency(amount, currency) {
  if (currency === "IDR") {
    // Rp 46.000 (dot as thousand separator, no decimals)
    return "Rp " + amount.toLocaleString("id-ID");
  }
  if (currency === "USD") {
    // $46.00 (comma as thousand separator, 2 decimals)
    return "$" + amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  return String(amount);
}
```

---

## 10. Error Handling

| Scenario | Backend Response | Frontend Behavior |
|---|---|---|
| Wrong login credentials | `401 { detail: "Invalid credentials" }` | Show inline error on login form |
| Expired JWT | `401 { detail: "Invalid or expired token" }` | Force logout → redirect to login |
| Gemini can't read image | `422 { detail: "Could not extract invoice..." }` | Show error bubble in chat |
| Gemini returns malformed JSON | Caught in `parser_service` → `422` | Show error bubble in chat |
| Gemini chat returns invalid action | Caught in `ActionResponse` validation → `422` | Show "Something went wrong" bubble |
| Network error | Axios catches exception | Show "Network error, please retry" bubble |
| User chats before uploading invoice | Frontend guard | Show bubble: "Please upload an invoice first" |

---

## 11. Constraints & Limitations

| Constraint | Detail |
|---|---|
| No persistence | All state is in React memory. Refresh = full reset |
| Single invoice per session | Uploading a new image replaces the current invoice |
| Single currency per receipt | Multi-currency receipts not supported |
| Hardcoded credentials | One username/password pair from `.env` |
| No file size validation | Should be added before production |
| No rate limiting | Gemini API calls are unbounded |
| Chat history grows unbounded | Long sessions will eventually hit Gemini context limits |
| Supported image types | `image/jpeg`, `image/png`, `image/webp` |
