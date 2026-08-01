"""Data ingestion pipeline for the Abhishek portfolio RAG chatbot.

Run this once (and again whenever the documents in ``data/`` change):

    python ingest.py

It loads every ``.txt`` / ``.md`` / ``.pdf`` file under ``data/``, splits them
into overlapping chunks, embeds each chunk with the configured embedding model,
and persists the vectors to a local ChromaDB collection.

The script is **idempotent**: it drops and rebuilds the collection on every run,
so re-running never produces duplicate embeddings.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure the summary's ✓/↺ glyphs print on Windows consoles (cp1252 default).
try:
    sys.stdout.reconfigure(encoding="utf-8")
except (AttributeError, ValueError):  # pragma: no cover - older/odd streams
    pass

from langchain_community.document_loaders import (
    DirectoryLoader,
    PyPDFLoader,
    TextLoader,
)
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

import config


def load_documents(data_dir: Path) -> list[Document]:
    """Load all supported documents from ``data_dir``.

    Uses ``TextLoader`` for ``.txt`` / ``.md`` files and ``PyPDFLoader`` for
    ``.pdf`` files, each wrapped in a ``DirectoryLoader`` so new files are picked
    up automatically without code changes.

    Args:
        data_dir: Folder containing the source documents.

    Returns:
        A flat list of loaded LangChain ``Document`` objects (one per file, or
        one per page for PDFs).

    Raises:
        FileNotFoundError: if ``data_dir`` does not exist.
    """
    if not data_dir.exists():
        raise FileNotFoundError(
            f"Data directory not found: {data_dir}. "
            "Create it and add your .txt/.md/.pdf source documents."
        )

    documents: list[Document] = []

    # Text + Markdown. Force UTF-8: encoding auto-detection can misread UTF-8
    # punctuation (e.g. em dashes) as cp1252 and corrupt the text ("—" → "â€").
    for glob in ("**/*.txt", "**/*.md"):
        loader = DirectoryLoader(
            str(data_dir),
            glob=glob,
            loader_cls=TextLoader,
            loader_kwargs={"encoding": "utf-8"},
            show_progress=False,
        )
        documents.extend(loader.load())

    # PDFs (one Document per page).
    pdf_loader = DirectoryLoader(
        str(data_dir),
        glob="**/*.pdf",
        loader_cls=PyPDFLoader,
        show_progress=False,
    )
    documents.extend(pdf_loader.load())

    return documents


def chunk_documents(documents: list[Document]) -> list[Document]:
    """Split documents into overlapping chunks and enrich their metadata.

    Each returned chunk carries:
        - ``source``: absolute path of the origin file (set by the loader)
        - ``source_name``: just the file name, convenient for citations
        - ``chunk_index``: 0-based position of the chunk within the run

    Args:
        documents: Raw documents from :func:`load_documents`.

    Returns:
        The list of chunk ``Document`` objects.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
        # Split on the most semantically meaningful boundaries first.
        separators=["\n\n", "\n", ". ", " ", ""],
        add_start_index=True,
    )
    chunks = splitter.split_documents(documents)

    for index, chunk in enumerate(chunks):
        source = chunk.metadata.get("source", "unknown")
        chunk.metadata["source_name"] = Path(source).name
        chunk.metadata["chunk_index"] = index

    return chunks


def build_chunk_ids(chunks: list[Document]) -> list[str]:
    """Build stable, human-readable IDs like ``01_profile.md-3``.

    Combined with dropping the collection first, this keeps the store free of
    duplicates even if the same content is ingested repeatedly.
    """
    return [
        f"{chunk.metadata.get('source_name', 'doc')}-{chunk.metadata['chunk_index']}"
        for chunk in chunks
    ]


def persist_to_chroma(chunks: list[Document], ids: list[str]) -> None:
    """Embed ``chunks`` and (re)build the persisted ChromaDB collection.

    Drops any existing collection with the same name first so the operation is
    idempotent, then writes fresh embeddings to disk under ``CHROMA_DIR``.
    """
    import chromadb
    from langchain_chroma import Chroma

    config.CHROMA_DIR.mkdir(parents=True, exist_ok=True)

    # Drop the existing collection (if any) so we never duplicate vectors.
    client = chromadb.PersistentClient(path=str(config.CHROMA_DIR))
    existing = {c.name for c in client.list_collections()}
    if config.COLLECTION_NAME in existing:
        client.delete_collection(config.COLLECTION_NAME)
        print(f"   ↺ Dropped existing collection '{config.COLLECTION_NAME}'.")

    # from_documents embeds and persists to disk in one step.
    Chroma.from_documents(
        documents=chunks,
        ids=ids,
        embedding=config.get_embeddings(),
        collection_name=config.COLLECTION_NAME,
        persist_directory=str(config.CHROMA_DIR),
    )


def main() -> int:
    """Run the full ingestion pipeline and print a summary."""
    print("=" * 60)
    print("  Abhishek Portfolio RAG — Ingestion")
    print("=" * 60)
    print(f"  Config: {config.describe()}")
    print(f"  Data dir: {config.DATA_DIR}")
    print("-" * 60)

    try:
        documents = load_documents(config.DATA_DIR)
    except FileNotFoundError as exc:
        print(f"  ✗ {exc}", file=sys.stderr)
        return 1

    if not documents:
        print(
            "  ✗ No .txt/.md/.pdf documents found in the data directory. "
            "Add source files and re-run.",
            file=sys.stderr,
        )
        return 1

    print(f"  ✓ Loaded {len(documents)} document(s).")

    chunks = chunk_documents(documents)
    print(f"  ✓ Split into {len(chunks)} chunk(s) "
          f"(size={config.CHUNK_SIZE}, overlap={config.CHUNK_OVERLAP}).")

    ids = build_chunk_ids(chunks)

    print("  … Embedding and writing to ChromaDB (this may take a moment)…")
    try:
        persist_to_chroma(chunks, ids)
    except Exception as exc:  # noqa: BLE001 — surface any backend/setup error clearly
        print(f"  ✗ Failed to build vector store: {exc}", file=sys.stderr)
        print(
            "    Check your embedding provider settings in .env "
            "(EMBEDDING_PROVIDER / OPENAI_API_KEY).",
            file=sys.stderr,
        )
        return 1

    print("-" * 60)
    print(f"  ✓ Persisted collection '{config.COLLECTION_NAME}' "
          f"to {config.CHROMA_DIR}")
    print(f"  Summary: {len(documents)} document(s) → {len(chunks)} chunk(s) embedded.")
    print("  Done. You can now start the API with:  uvicorn main:app --reload")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
