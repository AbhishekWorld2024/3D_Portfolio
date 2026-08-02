# Container for the Python RAG chatbot backend.
# Cloud setup: fastembed embeddings (local, free) + Groq for the LLM.
FROM python:3.12-slim

# Faster, cleaner Python in containers.
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install dependencies first (better layer caching).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code (data/, config.py, ingest.py, rag_chain.py, main.py).
COPY . .

# Build the vector store at image-build time so the service starts instantly.
# Uses fastembed (no API key, no Ollama needed). The LLM (Groq) is only called
# at request time, so no LLM key is required during the build.
ENV EMBEDDING_PROVIDER=fastembed
RUN python ingest.py

# Render (and most hosts) inject the port via $PORT; default to 8000 locally.
ENV PORT=8000
EXPOSE 8000

# Shell form so ${PORT} is expanded at runtime.
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
