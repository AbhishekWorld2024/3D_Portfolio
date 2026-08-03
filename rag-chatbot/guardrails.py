"""Lightweight guardrails for the RAG chatbot (input + output + monitoring).

Why not LLM Guard / Guardrails AI directly? Their model-based validators
(ToxicLanguage, Presidio PII, etc.) load transformer/spaCy models that need
torch and ~1GB+ RAM — far over the 512MB production host. This module applies
the same *concepts* with fast regex/heuristic checks: negligible memory, no
extra dependencies, and it runs in production. Every trigger is logged and
counted so you can monitor what's actually being caught (see `get_stats`).

Guardrails implemented:
  INPUT
    - prompt_injection  : "ignore previous instructions", "reveal your prompt"…
    - pii               : SSN / credit-card numbers a visitor shouldn't paste
    - toxicity          : basic profanity screen
    - length            : reject absurdly long inputs
  OUTPUT
    - pii_leak          : redact SSN / credit-card numbers from the answer
    - secret_leak       : redact anything resembling an API key
"""

from __future__ import annotations

import logging
import re
import threading
from dataclasses import dataclass, field

logger = logging.getLogger("guardrails")

# --------------------------------------------------------------------------- #
# Monitoring — thread-safe in-memory counters + structured logs.
# --------------------------------------------------------------------------- #
_lock = threading.Lock()
_stats: dict[str, int] = {}


def _record(direction: str, rule: str, snippet: str) -> None:
    """Count a trigger and emit a structured (redacted) log line."""
    key = f"{direction}:{rule}"
    with _lock:
        _stats[key] = _stats.get(key, 0) + 1
    logger.warning(
        "guardrail_triggered direction=%s rule=%s snippet=%r",
        direction,
        rule,
        snippet[:80],
    )


def get_stats() -> dict[str, int]:
    """Return a copy of the trigger counts (for the /guardrails endpoint)."""
    with _lock:
        return dict(_stats)


# --------------------------------------------------------------------------- #
# Patterns
# --------------------------------------------------------------------------- #
MAX_INPUT_CHARS = 1000

_INJECTION_PATTERNS = [
    re.compile(p, re.IGNORECASE)
    for p in (
        r"ignore\s+(?:all\s+|the\s+)?(?:previous|prior|above)\s+(?:instructions|prompts?)",
        r"disregard\s+(?:all\s+|the\s+)?(?:previous|prior|above)",
        r"forget\s+(?:everything|all|your\s+instructions)",
        r"(?:reveal|show|print|repeat|expose)\s+(?:me\s+)?(?:your\s+)?(?:system\s+)?(?:prompt|instructions|rules)",
        r"what\s+(?:is|are)\s+your\s+(?:system\s+)?(?:prompt|instructions)",
        r"you\s+are\s+now\s+(?:a|an|the)\b",
        r"\bjailbreak\b",
        r"\bdeveloper\s+mode\b",
        r"\bDAN\b",
        r"pretend\s+(?:you\s+are|to\s+be)\b",
    )
]

# Small illustrative profanity screen (word-boundary matched).
_PROFANITY = {
    "fuck", "shit", "bitch", "asshole", "bastard", "dickhead", "cunt", "slut",
}
_PROFANITY_RE = re.compile(
    r"\b(" + "|".join(re.escape(w) for w in _PROFANITY) + r")\b", re.IGNORECASE
)

_SSN_RE = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
# 13–16 digit runs (optional spaces/dashes) — validated with Luhn to avoid
# false positives on ordinary numbers.
_CC_RE = re.compile(r"\b(?:\d[ -]?){13,16}\b")
# API-key-looking secrets (OpenAI, Groq, Google, generic long tokens).
_SECRET_RE = re.compile(
    r"\b(?:sk-[A-Za-z0-9]{20,}|gsk_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9_\-]{20,})\b"
)

_REFUSAL = (
    "I'm here to answer questions about Abhishek's experience, skills, projects, "
    "and background. Could you rephrase your question around that?"
)
_PII_NOTICE = (
    "For your privacy, please don't share personal information like Social "
    "Security or card numbers here. Ask me anything about Abhishek instead!"
)


def _luhn_ok(digits: str) -> bool:
    """Luhn checksum — true if `digits` looks like a real card number."""
    nums = [int(c) for c in digits if c.isdigit()]
    if not 13 <= len(nums) <= 16:
        return False
    total, parity = 0, len(nums) % 2
    for i, n in enumerate(nums):
        if i % 2 == parity:
            n *= 2
            if n > 9:
                n -= 9
        total += n
    return total % 10 == 0


# --------------------------------------------------------------------------- #
# Input guardrail
# --------------------------------------------------------------------------- #
@dataclass
class InputResult:
    allowed: bool
    query: str = ""
    category: str | None = None
    message: str | None = None  # safe reply to show the user when blocked


def scan_input(text: str) -> InputResult:
    """Screen an incoming user query. Blocks injection / PII / toxicity."""
    query = (text or "").strip()

    if len(query) > MAX_INPUT_CHARS:
        _record("input", "length", query)
        return InputResult(False, query, "length",
                           "That question is a bit long — could you shorten it?")

    for pat in _INJECTION_PATTERNS:
        if pat.search(query):
            _record("input", "prompt_injection", query)
            return InputResult(False, query, "prompt_injection", _REFUSAL)

    if _SSN_RE.search(query) or any(_luhn_ok(m.group()) for m in _CC_RE.finditer(query)):
        _record("input", "pii", query)
        return InputResult(False, query, "pii", _PII_NOTICE)

    if _PROFANITY_RE.search(query):
        _record("input", "toxicity", query)
        return InputResult(False, query, "toxicity",
                           "Let's keep it professional — ask me about Abhishek's work!")

    return InputResult(True, query)


# --------------------------------------------------------------------------- #
# Output guardrail
# --------------------------------------------------------------------------- #
@dataclass
class OutputResult:
    text: str
    triggered: list[str] = field(default_factory=list)


def scan_output(text: str) -> OutputResult:
    """Redact anything sensitive from the model's answer before returning it.

    Note: the résumé's public email/phone are intentionally shareable and do
    NOT match these patterns, so contact info is preserved.
    """
    out = text or ""
    triggered: list[str] = []

    if _SECRET_RE.search(out):
        out = _SECRET_RE.sub("[redacted]", out)
        triggered.append("secret_leak")
        _record("output", "secret_leak", text)

    if _SSN_RE.search(out):
        out = _SSN_RE.sub("[redacted]", out)
        triggered.append("pii_leak")
        _record("output", "pii_leak", text)

    def _mask_cc(m: re.Match) -> str:
        return "[redacted]" if _luhn_ok(m.group()) else m.group()

    if any(_luhn_ok(m.group()) for m in _CC_RE.finditer(out)):
        out = _CC_RE.sub(_mask_cc, out)
        if "pii_leak" not in triggered:
            triggered.append("pii_leak")
            _record("output", "pii_leak", text)

    return OutputResult(out, triggered)
