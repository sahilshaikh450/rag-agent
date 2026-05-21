# 🤖 RAG Agent — AI-Powered Support System

A full-stack RAG (Retrieval-Augmented Generation) application built with:
- **Frontend**: React + Styled Components (fancy dark UI)
- **Backend**: Node.js + Express
- **AI**: LangChain.js + OpenAI GPT-4o-mini
- **Vector DB**: FAISS (local, no external service needed)

---

##  Prerequisites

Make sure these are installed on your machine:

1. **Node.js** (v18 or higher) — https://nodejs.org
2. **OpenAI API Key** — https://platform.openai.com/api-keys

---

##  Setup & Run (Step by Step)

### Step 1 — Get an OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-...`)

---

### Step 2 — Setup Backend

Open a terminal and run:

```bash
cd backend
npm install
```

Then create your `.env` file:
```bash
cp .env.example .env
```

Open `.env` and paste your OpenAI API key:
```
OPENAI_API_KEY=sk-your-key-here
PORT=5000
```

Start the backend:
```bash
npm start
```

You should see:
```
 RAG Agent Backend running on http://localhost:5000
```

---

### Step 3 — Setup Frontend

Open a **new terminal** (keep backend running) and run:

```bash
cd frontend
npm install
npm start
```

This will open the app at **http://localhost:3000** automatically!

---

##  How to Use

1. **Upload Documents** — drag & drop PDF, TXT, or MD files in the left sidebar
2. **Wait for indexing** — you'll see a success message when done
3. **Ask questions** — type anything in the chat about your documents
4. **See sources** — the AI shows which document it pulled from

---

## 📁 Project Structure

```
rag-agent/
├── backend/
│   ├── server.js        ← Express API server
│   ├── ragService.js    ← Core RAG logic (LangChain + FAISS)
│   ├── .env.example     ← Copy to .env and add your API key
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js                    ← Root component
    │   ├── components/
    │   │   ├── Sidebar.js            ← File upload + doc list
    │   │   └── ChatPanel.js          ← Chat interface
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## 🛠 Tech Stack 

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Styled Components |
| Backend | Node.js, Express |
| AI Framework | LangChain.js |
| LLM | OpenAI GPT-4o-mini |
| Embeddings | OpenAI text-embedding-3-small |
| Vector Store | FAISS (local) |
| File Parsing | pdf-parse |

---

##  Troubleshooting

**"OPENAI_API_KEY not set"** → Make sure `.env` file exists in `/backend` folder with your key

**"npm install fails"** → Make sure Node.js v18+ is installed: `node --version`

**Frontend won't start** → Make sure backend is running first on port 5000

**FAISS install issues on Windows** → Run: `npm install --ignore-scripts` then try again
