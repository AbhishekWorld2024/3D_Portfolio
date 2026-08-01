"""Central configuration for the Abhishek portfolio RAG chatbot.

Every tunable knob — chunk sizes, retrieval depth, model names, and paths —
lives here so the ingestion, retrieval, and API layers all read from a single
source of truth. Nothing about the pipeline is hardcoded inline elsewhere.

Values are read from environment variables (loaded from a local ``.env`` file
via ``python-dotenv``) with sensible production defaults. API keys are *only*
read from the environment and never stored in code.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Load variables from a local .env file (if present) into os.environ.
load_dotenv()


# --------------------------------------------------------------------------- #
# Paths
# --------------------------------------------------------------------------- #
# Resolve everything relative to this file so the scripts work regardless of
# the directory they are launched from.
BASE_DIR: Path = Path(__file__).resolve().parent
DATA_DIR: Path = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
CHROMA_DIR: Path = Path(os.getenv("CHROMA_DIR", BASE_DIR / "chroma_db"))

# Named ChromaDB collection that holds the embedded portfolio chunks.
COLLECTION_NAME: str = os.getenv("COLLECTION_NAME", "abhishek_portfolio")


# --------------------------------------------------------------------------- #
# Chunking (used by ingest.py)
# --------------------------------------------------------------------------- #
# Chunk size / overlap are in characters (RecursiveCharacterTextSplitter's unit).
# ~500 chars keeps each chunk a tight, self-contained fact; the overlap prevents
# ideas from being split awkwardly across a boundary.
CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "500"))
CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "80"))


# --------------------------------------------------------------------------- #
# Retrieval (used by rag_chain.py)
# --------------------------------------------------------------------------- #
# Number of chunks to retrieve per query, and the search strategy.
#   "similarity" — pure nearest-neighbour (fast, default)
#   "mmr"        — Maximal Marginal Relevance (diversifies results)
RETRIEVER_K: int = int(os.getenv("RETRIEVER_K", "6"))
RETRIEVER_SEARCH_TYPE: str = os.getenv("RETRIEVER_SEARCH_TYPE", "mmr")


# --------------------------------------------------------------------------- #
# Embeddings
# --------------------------------------------------------------------------- #
# EMBEDDING_PROVIDER selects the backend:
#   "openai"      — OpenAI text-embedding-3-small (needs OPENAI_API_KEY, tiny cost)
#   "huggingface" — sentence-transformers/all-MiniLM-L6-v2 (free, runs locally,
#                   downloads the model on first use — requires network once)
#   "ollama"      — a local Ollama model, e.g. nomic-embed-text (free, fully
#                   offline once pulled; no API key)
EMBEDDING_PROVIDER: str = os.getenv("EMBEDDING_PROVIDER", "openai").lower()
OPENAI_EMBEDDING_MODEL: str = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
HF_EMBEDDING_MODEL: str = os.getenv("HF_EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
OLLAMA_EMBEDDING_MODEL: str = os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")

# Base URL of a local Ollama server (used by both the ollama embedding and LLM
# providers). Ollama also exposes an OpenAI-compatible API at <base>/v1.
OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")


# --------------------------------------------------------------------------- #
# LLM (chat completion)
# --------------------------------------------------------------------------- #
# LLM_PROVIDER selects the chat backend:
#   "openai" — OpenAI (or any OpenAI-compatible endpoint via OPENAI_BASE_URL,
#              e.g. Groq). Default model gpt-4o-mini.
#   "ollama" — a local Ollama chat model (free, offline; no API key).
LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai").lower()
LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.2"))

# Credentials / endpoint overrides — read from the environment only.
OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
# Optional: override the API base to use an OpenAI-compatible provider.
# Example (Groq): OPENAI_BASE_URL=https://api.groq.com/openai/v1
OPENAI_BASE_URL: str | None = os.getenv("OPENAI_BASE_URL")


# --------------------------------------------------------------------------- #
# CORS (used by main.py) — comma-separated list of allowed frontend origins.
# --------------------------------------------------------------------------- #
ALLOWED_ORIGINS: list[str] = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]


# --------------------------------------------------------------------------- #
# Factories — shared so ingestion and retrieval embed with the SAME model.
# --------------------------------------------------------------------------- #
def get_embeddings():
    """Return the configured embeddings backend.

    Imports are done lazily so that, for example, the heavy HuggingFace /
    sentence-transformers stack is only imported when it is actually selected.

    Raises:
        ValueError: if EMBEDDING_PROVIDER is not recognised.
    """
    if EMBEDDING_PROVIDER == "openai":
        from langchain_openai import OpenAIEmbeddings

        return OpenAIEmbeddings(
            model=OPENAI_EMBEDDING_MODEL,
            api_key=OPENAI_API_KEY,
            base_url=OPENAI_BASE_URL,
        )

    if EMBEDDING_PROVIDER in ("huggingface", "hf"):
        from langchain_huggingface import HuggingFaceEmbeddings

        return HuggingFaceEmbeddings(model_name=HF_EMBEDDING_MODEL)

    if EMBEDDING_PROVIDER == "ollama":
        from langchain_ollama import OllamaEmbeddings

        return OllamaEmbeddings(model=OLLAMA_EMBEDDING_MODEL, base_url=OLLAMA_BASE_URL)

    raise ValueError(
        f"Unknown EMBEDDING_PROVIDER={EMBEDDING_PROVIDER!r}. "
        "Use 'openai', 'huggingface', or 'ollama'."
    )


def get_llm():
    """Return the configured chat LLM.

    Raises:
        ValueError: if LLM_PROVIDER is not recognised.
    """
    if LLM_PROVIDER == "ollama":
        from langchain_ollama import ChatOllama

        return ChatOllama(
            model=LLM_MODEL,
            temperature=LLM_TEMPERATURE,
            base_url=OLLAMA_BASE_URL,
        )

    if LLM_PROVIDER == "openai":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=LLM_MODEL,
            temperature=LLM_TEMPERATURE,
            api_key=OPENAI_API_KEY,
            base_url=OPENAI_BASE_URL,
        )

    raise ValueError(
        f"Unknown LLM_PROVIDER={LLM_PROVIDER!r}. Use 'openai' or 'ollama'."
    )


def describe() -> str:
    """Human-readable one-line summary of the active configuration."""
    embed_model = {
        "openai": OPENAI_EMBEDDING_MODEL,
        "ollama": OLLAMA_EMBEDDING_MODEL,
    }.get(EMBEDDING_PROVIDER, HF_EMBEDDING_MODEL)
    return (
        f"embed={EMBEDDING_PROVIDER}:{embed_model} "
        f"llm={LLM_PROVIDER}:{LLM_MODEL} k={RETRIEVER_K} "
        f"chunk={CHUNK_SIZE}/{CHUNK_OVERLAP} collection={COLLECTION_NAME}"
    )
