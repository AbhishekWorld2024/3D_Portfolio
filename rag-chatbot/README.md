# Abhishek Portfolio — RAG Chatbot

A production-style **Retrieval-Augmented Generation (RAG)** chatbot that answers
questions about Abhishek Arugonda, grounded in his real resume/bio rather than
the model's imagination.

## What is RAG (and why here)?
Retrieval-Augmented Generation pairs a large language model with a searchable
knowledge base: instead of relying on what the model happens to "know," the
system **retrieves** the most relevant snippets from trusted source documents
and passes them to the LLM as context. This keeps answers **accurate, grounded,
and up-to-date**, and lets the bot honestly say "I don't know" when a question
falls outside the source material — exactly what you want for a portfolio
assistant representing a real person.

## Tech Stack
- **Python 3.11+**
- **LangChain** (`langchain`, `langchain-community`, `langchain-openai`,
  `langchain-chroma`) with **LCEL** for the retrieval chain
- **ChromaDB** — local, disk-persisted vector store
- **Embeddings** — OpenAI `text-embedding-3-small` (or free local
  `all-MiniLM-L6-v2` via HuggingFace)
- **LLM** — OpenAI `gpt-4o-mini` (swappable via env)
- **FastAPI** + Uvicorn — REST API for the frontend

## Architecture

```
                         INGESTION PIPELINE  (run once: python ingest.py)
   ┌──────────┐   ┌───────────────┐   ┌──────────────┐   ┌───────────────┐
   │  data/   │──▶│  Loaders      │──▶│  Recursive   │──▶│  Embedding    │
   │ .md .txt │   │  Text / PDF   │   │  Text        │   │  model        │
   │ .pdf     │   │  Directory    │   │  Splitter    │   │ (OpenAI / HF) │
   └──────────┘   └───────────────┘   └──────────────┘   └───────┬───────┘
                                                                  │ vectors
                                                                  ▼
                                                        ┌───────────────────┐
                                                        │  ChromaDB          │
                                                        │  ./chroma_db       │
                                                        │  collection:       │
                                                        │  abhishek_portfolio│
                                                        └─────────┬─────────┘
                         RETRIEVAL PIPELINE  (per request)        │
   ┌──────────┐   ┌───────────────┐   ┌──────────────┐           │
   │  User    │──▶│  FastAPI      │──▶│  Retriever   │◀──────────┘
   │  question│   │  POST /chat   │   │  top-k = 4   │
   └──────────┘   └───────────────┘   └──────┬───────┘
                          ▲                   │ context chunks
                          │                   ▼
                          │           ┌──────────────┐   ┌──────────────┐
                          │           │  Prompt      │──▶│  LLM         │
                          │           │  template    │   │ (gpt-4o-mini)│
                          │           └──────────────┘   └──────┬───────┘
                          │                                     │
                          └──────── answer + sources ◀──────────┘
```

- **Ingestion** (offline): documents → chunks → embeddings → ChromaDB.
- **Retrieval** (per query): embed the question → fetch top-k chunks →
  prompt + LLM → grounded answer with citations.

## Project Structure
```
rag-chatbot/
├── data/                 # source documents about Abhishek (.md/.txt/.pdf)
├── chroma_db/            # persisted vector store (gitignored, built by ingest)
├── config.py             # central config: chunk size, k, models, paths, factories
├── ingest.py             # ingestion pipeline (idempotent)
├── rag_chain.py          # retriever + LCEL RAG chain
├── main.py               # FastAPI app (/chat, /health)
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## Setup

### 1. Create a virtual environment & install deps
```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env      # Windows: copy .env.example .env
```
Then edit `.env` and set `OPENAI_API_KEY`.

> **No OpenAI key / want zero cost?** Two free routes:
>
> - **Ollama (recommended, fully local, no key):** install [Ollama](https://ollama.com),
>   then `ollama pull nomic-embed-text && ollama pull llama3.2`. In `.env` set:
>   ```
>   EMBEDDING_PROVIDER=ollama
>   LLM_PROVIDER=ollama
>   LLM_MODEL=llama3.2
>   ```
>   Runs entirely offline. *(This project has been verified end-to-end with this
>   exact setup.)*
> - **HuggingFace embeddings:** `EMBEDDING_PROVIDER=huggingface` +
>   `pip install langchain-huggingface sentence-transformers` (pulls in torch;
>   downloads the model once). You still need an LLM — an OpenAI key, Ollama, or
>   any OpenAI-compatible endpoint via `OPENAI_BASE_URL` (e.g. Groq).

### 3. Build the knowledge base
```bash
python ingest.py
```
Loads `data/`, chunks, embeds, and persists to `./chroma_db`. Re-run any time
the documents change — it rebuilds cleanly without duplicates.

### 4. Sanity-check retrieval (optional)
```bash
python rag_chain.py "What are Abhishek's top skills?"
```

### 5. Run the API
```bash
uvicorn main:app --reload --port 8000
```

## API

### `GET /health`
Returns liveness and whether the vector store has been ingested.

### `POST /chat`
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Where does Abhishek currently work?", "session_id": "demo-1"}'
```

Example response:
```json
{
  "answer": "Abhishek is currently a Software Developer at The Cigna Group in the Austin, Texas metro area, where he builds Java & Spring Boot healthcare microservices and Kafka event-driven pipelines.",
  "sources": [
    { "source": "02_experience.md", "chunk_index": 0, "snippet": "The Cigna Group — Software Developer (Aug 2025 – Present)..." }
  ],
  "session_id": "demo-1"
}
```

## Configuration reference
All knobs live in `config.py` and are overridable via `.env`:

| Variable | Default | Purpose |
|---|---|---|
| `EMBEDDING_PROVIDER` | `openai` | `openai`, `huggingface`, or `ollama` |
| `OPENAI_EMBEDDING_MODEL` | `text-embedding-3-small` | OpenAI embedding model |
| `LLM_PROVIDER` | `openai` | `openai` or `ollama` |
| `LLM_MODEL` | `gpt-4o-mini` | Chat model (swappable) |
| `LLM_TEMPERATURE` | `0.2` | Generation temperature |
| `RETRIEVER_K` | `6` | Chunks retrieved per query |
| `RETRIEVER_SEARCH_TYPE` | `mmr` | `similarity` or `mmr` (diversified) |
| `CHUNK_SIZE` / `CHUNK_OVERLAP` | `500` / `80` | Splitter settings |
| `COLLECTION_NAME` | `abhishek_portfolio` | Chroma collection |
| `ALLOWED_ORIGINS` | `*` | CORS origins for the frontend |

## Wiring up the frontend
Point the portfolio's chat widget at `POST /chat` and render `answer`; the
`sources` array is available if you want to show citations. Set
`ALLOWED_ORIGINS` in `.env` to your deployed frontend origin(s) for production.
