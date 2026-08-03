# 3D Portfolio — Abhishek Arugonda

A modern, animated personal portfolio website for a **Senior AI/ML Engineer**,
featuring an **AI chatbot** that answers questions about Abhishek's experience,
skills, projects, and availability using a **Python Retrieval-Augmented
Generation (RAG)** backend.

The chatbot is powered by a standalone Python service (in [`rag-chatbot/`](rag-chatbot/))
built with **LangChain + ChromaDB + FastAPI**. It embeds Abhishek's résumé,
retrieves the most relevant passages for each question, and has an LLM generate a
grounded answer — so replies stay accurate and never hallucinate.

## Features

- **Animated landing page** — hero, marquee, about, expertise, work experience
  (stacking scroll cards), and projects sections, built with Framer Motion.
- **"Chat With Me" AI assistant** — a floating chatbot that answers visitor
  questions about Abhishek in natural language, grounded in his real résumé.
- **Python RAG backend** — documents are chunked, embedded, and stored in a
  persisted **ChromaDB** vector store; each question triggers a semantic
  (vector) search and the top passages are passed to the LLM as context.
- **Cited, grounded answers** — every reply comes with the source chunks it used,
  and the assistant says "I don't have that detail" instead of inventing facts.
- **Guardrails & monitoring** — input scanning (prompt-injection, PII, toxicity)
  and output redaction (leaked secrets / PII), with every trigger logged and
  counted for observability (`GET /guardrails`).
- **Runs 100% free & offline** — uses a local **Ollama** model for both
  embeddings and generation; no API keys required (swappable to cloud providers).
- **Fully responsive** — mobile-first layout with fluid `clamp()` typography.

## Tech Stack

| Layer            | Technology                                                        |
|------------------|-------------------------------------------------------------------|
| Frontend         | React 19, TypeScript, Vite                                        |
| Styling          | Tailwind CSS, custom gradients                                    |
| Animation        | Framer Motion                                                     |
| Chatbot backend  | **Python 3.11+**, FastAPI, Uvicorn                               |
| RAG framework    | **LangChain** (LCEL), **ChromaDB** (persisted vector store)      |
| Embeddings       | Ollama `nomic-embed-text` (local) · OpenAI · HuggingFace          |
| LLM              | Ollama `llama3.2` (local) · or any OpenAI-compatible API (e.g. Groq) |

## Architecture

```
  Browser (React)                 Python RAG service (rag-chatbot/)
 ┌────────────────┐   POST /chat  ┌───────────────────────────────────────┐
 │ ChatButton.tsx │ ────────────▶ │ FastAPI  →  MMR retriever (ChromaDB)   │
 │  { query }     │               │        →  prompt  →  LLM (Ollama)      │
 │  renders       │ ◀──────────── │        →  { answer, sources }          │
 │  { answer }    │   JSON        └───────────────────────────────────────┘
 └────────────────┘
```

The frontend calls the Python API at the URL in `VITE_CHAT_API_URL`
(default `http://localhost:8000/chat`). See [`src/components/ChatButton.tsx`](src/components/ChatButton.tsx).

## Getting Started

### Prerequisites
- **Node.js 18+** (frontend)
- **Python 3.11+** (chatbot backend)
- **[Ollama](https://ollama.com)** running locally, with the models pulled:
  ```bash
  ollama pull nomic-embed-text     # embeddings
  ollama pull llama3.2:1b          # fast LLM (or llama3.2 for higher quality)
  ```

### 1. Start the Python chatbot backend
```bash
cd rag-chatbot

# create a virtual env and install deps
python -m venv .venv
.venv\Scripts\activate            # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt

# configure for local Ollama (free, no key)
cp .env.example .env              # Windows: copy .env.example .env
# in .env set:
#   EMBEDDING_PROVIDER=ollama
#   LLM_PROVIDER=ollama
#   LLM_MODEL=llama3.2:1b

# build the vector store from the documents in data/, then serve the API
python ingest.py
uvicorn main:app --port 8000
```
The API is now at `http://localhost:8000` (interactive docs at
`http://localhost:8000/docs`). Full backend details: [`rag-chatbot/README.md`](rag-chatbot/README.md).

### 2. Start the frontend
```bash
# from the repo root
npm install
npm run client                    # Vite dev server only
```
The site runs at `http://localhost:5173`. Click **Chat With Me** to talk to the
assistant. By default the widget calls `http://localhost:8000/chat`; override it
with `VITE_CHAT_API_URL` in a `.env` file if the backend runs elsewhere.

## The Knowledge Base

The chatbot answers **only** from the documents in [`rag-chatbot/data/`](rag-chatbot/data/):

- `Abhishek_Senior_AI_Engineer_Resume.pdf` — the résumé (loaded via `PyPDFLoader`)
- `availability.md` — what roles Abhishek is open to and how to reach him

To update what the bot knows, edit or add files in `data/` (`.pdf`, `.md`, or
`.txt`) and re-run `python ingest.py`. Ingestion is idempotent — it rebuilds the
collection cleanly without duplicates.

## How the Chatbot Works

1. **Embed** — the visitor's question is embedded with `nomic-embed-text`.
2. **Retrieve** — an **MMR** search over ChromaDB returns the top `k=4` most
   relevant (and diverse) chunks.
3. **Augment & Generate** — those chunks are inserted into a prompt and the LLM
   writes a concise, grounded answer, returned as `{ answer, sources }`.

## Configuration

All backend settings live in [`rag-chatbot/config.py`](rag-chatbot/config.py) and
are overridable via `rag-chatbot/.env`:

| Variable                | Default             | Purpose                              |
|-------------------------|---------------------|--------------------------------------|
| `EMBEDDING_PROVIDER`    | `ollama` *(local)*  | `ollama`, `openai`, or `huggingface` |
| `LLM_PROVIDER`          | `ollama` *(local)*  | `ollama` or `openai`-compatible      |
| `LLM_MODEL`             | `llama3.2:1b`       | chat model                           |
| `RETRIEVER_K`           | `4`                 | chunks retrieved per question        |
| `RETRIEVER_SEARCH_TYPE` | `mmr`               | `mmr` (diversified) or `similarity`  |
| `LLM_MAX_TOKENS`        | `220`               | max answer length (bounds latency)   |
| `VITE_CHAT_API_URL`*    | `localhost:8000/chat` | *(frontend)* API endpoint the widget calls |

## Performance & Cloud LLM

On a **CPU-only** machine, the local Ollama LLM spends most of its time reading
the prompt, so answers take roughly **15–25 seconds**. For a fast, production
chatbot, point the backend at **Groq** (a free, OpenAI-compatible cloud LLM) —
responses drop to **~1–2 seconds** and quality improves with a larger model.
In `rag-chatbot/.env`:
```
LLM_PROVIDER=openai
OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_API_KEY=<your groq key>
LLM_MODEL=llama-3.3-70b-versatile
```

## Deploy

- **Frontend** → Vercel (auto-detects Vite). Set `VITE_CHAT_API_URL` to the
  public URL of the deployed backend.
- **Python backend** → a host that runs persistent Python services (Render,
  Railway, or Fly.io — Vercel does not). Use a cloud LLM (Groq/OpenAI), since
  Ollama only runs locally, and set `ALLOWED_ORIGINS` to your frontend's origin.

## Project Structure

```
├── rag-chatbot/            # Python RAG chatbot (backend)
│   ├── data/               #   source documents (résumé PDF, availability.md)
│   ├── config.py           #   central config (models, k, paths)
│   ├── ingest.py           #   build the ChromaDB vector store
│   ├── rag_chain.py        #   LCEL retrieval + generation chain
│   ├── main.py             #   FastAPI app (POST /chat, GET /health)
│   └── README.md           #   detailed backend docs
├── src/
│   ├── components/
│   │   └── ChatButton.tsx  #   "Chat With Me" UI → calls the Python API
│   ├── sections/           #   page sections (hero, about, work, projects…)
│   └── App.tsx
└── vite.config.ts
```
