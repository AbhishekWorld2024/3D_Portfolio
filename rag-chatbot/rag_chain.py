"""Query-time RAG logic for the Abhishek portfolio chatbot.

This module loads the *already-persisted* Chroma vector store (it never
re-embeds the corpus at query time), builds a retriever, and wires everything
into a LangChain Expression Language (LCEL) chain:

    retriever → prompt → LLM → output parser

Public entry point: :func:`answer_query`, which returns both the generated
answer and the source chunks that grounded it (for optional citation display).
"""

from __future__ import annotations

from functools import lru_cache
from typing import Any, TypedDict

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

import config


class VectorStoreNotReadyError(RuntimeError):
    """Raised when the Chroma collection is missing or empty.

    Signals that :mod:`ingest` has not been run yet.
    """


# --------------------------------------------------------------------------- #
# Prompt
# --------------------------------------------------------------------------- #
SYSTEM_PROMPT = """\
You are the portfolio assistant for Abhishek Arugonda, a Senior AI/ML Engineer.
Answer using ONLY the context below (from his real resume). Speak about him in
the third person, be warm and concise (2-3 sentences), and never invent facts.
If the answer isn't in the context, say so briefly and point the visitor to
abhishek.arugonda567@gmail.com.

Context:
{context}
"""

PROMPT = ChatPromptTemplate.from_messages(
    [
        ("system", SYSTEM_PROMPT),
        ("human", "{question}"),
    ]
)


class RagResult(TypedDict):
    """Return shape of :func:`answer_query`."""

    answer: str
    sources: list[dict[str, Any]]


# --------------------------------------------------------------------------- #
# Vector store / retriever
# --------------------------------------------------------------------------- #
@lru_cache(maxsize=1)
def get_vectorstore():
    """Load the persisted Chroma vector store (cached for the process).

    Raises:
        VectorStoreNotReadyError: if the persisted collection is missing/empty.
    """
    from langchain_chroma import Chroma

    if not config.CHROMA_DIR.exists():
        raise VectorStoreNotReadyError(
            f"No vector store found at {config.CHROMA_DIR}. Run `python ingest.py` first."
        )

    vectorstore = Chroma(
        collection_name=config.COLLECTION_NAME,
        embedding_function=config.get_embeddings(),
        persist_directory=str(config.CHROMA_DIR),
    )

    # A directory can exist while the collection is empty (e.g. a failed ingest).
    if vectorstore._collection.count() == 0:
        raise VectorStoreNotReadyError(
            f"Collection '{config.COLLECTION_NAME}' is empty. Run `python ingest.py` first."
        )

    return vectorstore


def get_retriever():
    """Build a retriever from the vector store using the configured strategy."""
    vectorstore = get_vectorstore()
    return vectorstore.as_retriever(
        search_type=config.RETRIEVER_SEARCH_TYPE,
        search_kwargs={"k": config.RETRIEVER_K},
    )


def format_docs(docs: list[Document]) -> str:
    """Render retrieved chunks into a single context string for the prompt."""
    return "\n\n".join(
        f"[Source: {doc.metadata.get('source_name', 'unknown')}]\n{doc.page_content}"
        for doc in docs
    )


def _serialize_sources(docs: list[Document]) -> list[dict[str, Any]]:
    """Convert retrieved documents into JSON-friendly source dicts."""
    return [
        {
            "source": doc.metadata.get("source_name", "unknown"),
            "chunk_index": doc.metadata.get("chunk_index"),
            "snippet": doc.page_content[:240].strip(),
        }
        for doc in docs
    ]


# --------------------------------------------------------------------------- #
# LCEL chain
# --------------------------------------------------------------------------- #
@lru_cache(maxsize=1)
def build_chain():
    """Assemble and cache the LCEL RAG chain.

    The chain retrieves the context once, then runs the prompt→LLM→parser
    sub-chain over it while also passing the raw documents through, so callers
    get both the ``answer`` and the ``source_documents``.
    """
    retriever = get_retriever()
    llm = config.get_llm()

    # Sub-chain: turn {context: [docs], question} into a string answer.
    answer_chain = (
        RunnablePassthrough.assign(context=lambda x: format_docs(x["context"]))
        | PROMPT
        | llm
        | StrOutputParser()
    )

    # Retrieve once, keep the docs, and attach the generated answer.
    return RunnableParallel(
        {"context": retriever, "question": RunnablePassthrough()}
    ).assign(answer=answer_chain)


def answer_query(query: str) -> RagResult:
    """Answer a single question about Abhishek, grounded in retrieved context.

    Args:
        query: The visitor's natural-language question.

    Returns:
        A dict with the generated ``answer`` and the ``sources`` used.

    Raises:
        ValueError: if ``query`` is empty/whitespace.
        VectorStoreNotReadyError: if the store has not been built yet.
    """
    if not query or not query.strip():
        raise ValueError("Query must not be empty.")

    result = build_chain().invoke(query.strip())
    return {
        "answer": result["answer"],
        "sources": _serialize_sources(result["context"]),
    }


if __name__ == "__main__":
    # Simple end-to-end smoke test against the persisted store.
    import sys

    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

    question = " ".join(sys.argv[1:]) or "What are Abhishek's top skills?"
    print(f"Q: {question}\n")
    try:
        out = answer_query(question)
    except VectorStoreNotReadyError as exc:
        print(f"[not ready] {exc}", file=sys.stderr)
        raise SystemExit(1)

    print(f"A: {out['answer']}\n")
    print("Sources:")
    for src in out["sources"]:
        print(f"  - {src['source']} (chunk {src['chunk_index']}): {src['snippet'][:80]}…")
