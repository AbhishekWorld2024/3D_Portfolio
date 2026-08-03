"""FastAPI application exposing the portfolio RAG chatbot as a REST API.

Endpoints:
    GET  /health  — liveness + readiness (is the vector store built?)
    POST /chat    — answer a question about Abhishek

Run locally:
    uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import config
import guardrails
from rag_chain import VectorStoreNotReadyError, answer_query, get_vectorstore

# Structured logs (guardrail triggers included) go to stdout → visible in Render.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)

app = FastAPI(
    title="Abhishek Portfolio RAG Chatbot",
    description="Retrieval-Augmented Generation API answering questions about "
    "Abhishek Arugonda, grounded in his resume/bio.",
    version="1.0.0",
)

# Allow the (separately-hosted) frontend to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------- #
# Schemas
# --------------------------------------------------------------------------- #
class ChatRequest(BaseModel):
    """Incoming chat request body."""

    query: str = Field(..., min_length=1, description="The visitor's question.")
    session_id: str | None = Field(
        default=None, description="Optional client session identifier."
    )


class Source(BaseModel):
    """A retrieved chunk used to ground the answer."""

    source: str
    chunk_index: int | None = None
    snippet: str


class ChatResponse(BaseModel):
    """Chat response body."""

    answer: str
    sources: list[Source]
    session_id: str | None = None


# --------------------------------------------------------------------------- #
# Endpoints
# --------------------------------------------------------------------------- #
@app.get("/health")
def health() -> dict[str, object]:
    """Report liveness and whether the vector store is ready to serve queries."""
    ready = True
    detail = "ok"
    try:
        get_vectorstore()
    except VectorStoreNotReadyError as exc:
        ready = False
        detail = str(exc)
    except Exception as exc:  # noqa: BLE001 — health must never raise
        ready = False
        detail = f"vector store error: {exc}"

    return {
        "status": "ok",
        "vector_store_ready": ready,
        "detail": detail,
        "config": config.describe(),
        "guardrail_triggers": guardrails.get_stats(),
    }


@app.get("/guardrails")
def guardrail_stats() -> dict[str, object]:
    """Monitoring: how many times each guardrail has fired since startup."""
    return {"triggers": guardrails.get_stats()}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    """Answer a question about Abhishek using the RAG pipeline, with guardrails."""
    # --- INPUT guardrail: block prompt-injection / PII / toxicity up front. ---
    gate = guardrails.scan_input(request.query)
    if not gate.allowed:
        # Graceful 200 with a safe reply so the chat UI shows it naturally.
        return ChatResponse(answer=gate.message or "", sources=[],
                            session_id=request.session_id)

    try:
        result = answer_query(gate.query)
    except VectorStoreNotReadyError as exc:
        # 503: the service is up but not yet provisioned — tell the operator how to fix it.
        raise HTTPException(
            status_code=503,
            detail=f"{exc} (The knowledge base has not been ingested.)",
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 — map any LLM/embedding failure to 502
        raise HTTPException(
            status_code=502,
            detail=f"Failed to generate an answer: {exc}",
        ) from exc

    # --- OUTPUT guardrail: redact any leaked secrets / PII before returning. ---
    safe = guardrails.scan_output(result["answer"])

    return ChatResponse(
        answer=safe.text,
        sources=[Source(**s) for s in result["sources"]],
        session_id=request.session_id,
    )
