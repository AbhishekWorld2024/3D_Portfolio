# Deployment Guide

Complete guide to deploying this project — the **React frontend** (Vercel) and
the **Python RAG chatbot backend** (Render) — so the chatbot works for anyone on
any device.

```
Visitor (any device)
      │
      ▼
Frontend  ──────────────►  Backend  ──────────►  Groq (LLM)
Vercel (static React)      Render (FastAPI)  ──►  Google Gemini (embeddings)
                              │
                              └─►  ChromaDB (built at startup from data/)
```

- **Frontend:** static site, deploys from the repo root (Vite). Free on Vercel.
- **Backend:** Dockerized FastAPI in `rag-chatbot/`. Free on Render (512MB).
- **LLM:** Groq (fast, free). **Embeddings:** Google Gemini (free, no card).
  Local models (Ollama) are used for dev only — they don't exist in the cloud.

---

## Prerequisites (all free, ~5 min)

| What | Where | Notes |
|------|-------|-------|
| GitHub account with this repo | `AbhishekWorld2024/3D_Portfolio` | Render & Vercel deploy from it |
| **Groq API key** | [console.groq.com/keys](https://console.groq.com/keys) | starts `gsk_…`, the LLM |
| **Google AI Studio key** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) | starts `AIza…`, embeddings — no credit card |
| Render account | [render.com](https://render.com) | sign in with GitHub |
| Vercel account | [vercel.com](https://vercel.com) | sign in with GitHub |

---

## Part 1 — Backend on Render

1. **[render.com](https://render.com)** → **New +** → **Blueprint**.
2. Select repo **`AbhishekWorld2024/3D_Portfolio`**, Branch **`main`**.
3. **Blueprint Path** — the blueprint lives in a subfolder, so set it explicitly:
   ```
   rag-chatbot/render.yaml
   ```
4. **Apply** → Render creates the service **`abhishek-rag-chatbot`**.
5. Open the service → **Environment** tab → set these two secrets:
   | Key | Value |
   |-----|-------|
   | `OPENAI_API_KEY` | your **Groq** key (`gsk_…`) |
   | `GOOGLE_API_KEY` | your **Google** key (`AIza…`) |

   *(The rest — `LLM_PROVIDER=openai`, `OPENAI_BASE_URL` = Groq, `LLM_MODEL`,
   `EMBEDDING_PROVIDER=google` — come pre-filled from `render.yaml`.)*
6. **Save**, then **Manual Deploy → Deploy latest commit**.
7. Watch the logs for success:
   ```
   ✓ Persisted collection 'abhishek_portfolio'…
   Application startup complete.
   ```
8. Copy the service URL, e.g. **`https://abhishek-rag-chatbot-qhac.onrender.com`**.
9. **Verify:** open `<URL>/health` → expect `"vector_store_ready": true`.
   Try `<URL>/docs` to ask a question interactively.

> ⚠️ **Order matters:** set `GOOGLE_API_KEY` *before* deploying — the vector store
> is built at startup and needs it.

---

## Part 2 — Frontend on Vercel

1. **[vercel.com](https://vercel.com)** → **Add New** → **Project**.
2. **Import** repo **`AbhishekWorld2024/3D_Portfolio`** (Vite auto-detected — keep
   defaults).
3. Expand **Environment Variables** and add:
   | Name | Value |
   |------|-------|
   | `VITE_CHAT_API_URL` | `https://abhishek-rag-chatbot-qhac.onrender.com/chat` |

   *(your Render URL from Part 1, step 8, **+ `/chat`**)*
4. **Deploy** → you get a public link, e.g. `https://<project>.vercel.app`.
5. Open it → **Chat With Me** → ask *"Where does Abhishek currently work?"*

> ⚠️ **`VITE_CHAT_API_URL` is baked in at BUILD time.** If you add or change it
> after a deploy, you **must Redeploy** (Deployments → ⋯ → Redeploy) for it to
> take effect. Without it, the site calls `localhost:8000` and the chat fails on
> every device except one running the local server.

---

## Part 3 — Secure it (after everything works)

1. **Render → Environment:** change `ALLOWED_ORIGINS` from `*` to your Vercel URL
   (e.g. `https://<project>.vercel.app`). Save (it redeploys).
2. **Rotate keys** if they were ever shared/pasted: create fresh Groq + Google
   keys, update them in Render, delete the old ones.

---

## Configuration reference

Backend env vars (in `rag-chatbot/config.py`, overridable in Render):

| Variable | Production value | Purpose |
|----------|------------------|---------|
| `LLM_PROVIDER` | `openai` | use an OpenAI-compatible API (Groq) |
| `OPENAI_BASE_URL` | `https://api.groq.com/openai/v1` | Groq endpoint |
| `LLM_MODEL` | `llama-3.3-70b-versatile` | Groq model |
| `OPENAI_API_KEY` | *(secret)* | your Groq key |
| `EMBEDDING_PROVIDER` | `google` | Gemini embeddings (low RAM) |
| `GOOGLE_API_KEY` | *(secret)* | your Google AI Studio key |
| `GOOGLE_EMBEDDING_MODEL` | `models/gemini-embedding-001` | current Gemini embed model |
| `RETRIEVER_K` | `4` | chunks retrieved per question |
| `RETRIEVER_SEARCH_TYPE` | `mmr` | diversified retrieval |
| `ALLOWED_ORIGINS` | your Vercel URL | CORS |

Frontend env var (in Vercel):

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_CHAT_API_URL` | `<render-url>/chat` | where the chat widget sends questions |

---

## Updating the chatbot's knowledge

1. Edit / add files in `rag-chatbot/data/` (`.pdf`, `.md`, `.txt`).
2. Commit & push to `main`.
3. Redeploy the Render service — it rebuilds the vector store at startup
   (idempotent; no duplicates).

---

## Local development (free, offline, via Ollama)

```bash
# one-time: install Ollama (https://ollama.com) and pull models
ollama pull nomic-embed-text
ollama pull llama3.2:1b

# backend
cd rag-chatbot
python -m venv .venv && .venv\Scripts\activate      # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
# .env:  EMBEDDING_PROVIDER=ollama  LLM_PROVIDER=ollama  LLM_MODEL=llama3.2:1b
python ingest.py
uvicorn main:app --port 8000

# frontend (repo root, another terminal)
npm install
npm run client        # http://localhost:5173
```

---

## Troubleshooting (issues we actually hit)

| Symptom in logs | Cause | Fix |
|-----------------|-------|-----|
| `Blueprint file render.yaml not found on main branch` | blueprint is in a subfolder | set **Blueprint Path** = `rag-chatbot/render.yaml` |
| `Exited with status 137` | **out of memory** (512MB) — a local embedding model was loading | use **Google embeddings** (`EMBEDDING_PROVIDER=google`), which offloads embeddings off the box |
| `404 NOT_FOUND: models/text-embedding-004 … not supported for embedContent` | retired Gemini embed model | use `models/gemini-embedding-001` |
| `Exited with status 1` at "Embedding and writing to ChromaDB" | usually a missing/invalid `GOOGLE_API_KEY` | set the key in Render, redeploy |
| Chat works on your laptop but **"couldn't reach the chatbot" on other devices** | frontend calling `localhost:8000` | set `VITE_CHAT_API_URL` in Vercel **and Redeploy** |
| First message takes ~50s, then fast | Render free tier **spins down when idle** | normal; upgrade to a paid plan for always-on |
| Chatbot gives wrong / "unemployed" answers | data retrieval issue | ensure clean, structured docs in `data/` and re-ingest |

---

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | readiness + config + guardrail counts |
| `POST` | `/chat` | `{ "query": "…" }` → `{ answer, sources }` |
| `GET` | `/guardrails` | guardrail trigger counts (monitoring) |
| `GET` | `/docs` | interactive Swagger UI |
