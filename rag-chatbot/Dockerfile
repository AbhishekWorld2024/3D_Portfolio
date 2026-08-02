# Container for the Python RAG chatbot backend.
# Cloud setup: Google Gemini embeddings (free API, tiny RAM) + Groq for the LLM.
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

# Render (and most hosts) inject the port via $PORT; default to 8000 locally.
ENV PORT=8000
EXPOSE 8000

# Build the vector store at startup (embeddings call the Google API, so the
# GOOGLE_API_KEY env var must be available — it is at runtime, not build time),
# then start the API server. Shell form so $PORT is expanded.
CMD python ingest.py && uvicorn main:app --host 0.0.0.0 --port ${PORT}
