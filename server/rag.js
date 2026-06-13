// Shared RAG logic — used by both the local Express server (server.js) and the
// Vercel serverless function (api/chat.js). Lightweight keyword / TF-style
// retrieval over the knowledge base (no vector DB needed for a small corpus).

import { knowledgeBase } from './knowledgeBase.js';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'of', 'to', 'in', 'on', 'for', 'with', 'at', 'by', 'from', 'about', 'as', 'do',
  'does', 'did', 'his', 'her', 'he', 'she', 'you', 'your', 'i', 'me', 'my', 'we',
  'what', 'when', 'where', 'who', 'how', 'which', 'tell', 'give', 'can', 'could',
  'would', 'should', 'please', 'me', 'him', 'has', 'have', 'had', 'this', 'that',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

// Pre-tokenize the corpus once at module load.
const indexed = knowledgeBase.map((chunk) => {
  const counts = new Map();
  const add = (tokens, weight) => {
    for (const t of tokens) counts.set(t, (counts.get(t) || 0) + weight);
  };
  add(tokenize(chunk.text), 1);
  add(tokenize(chunk.title), 2);
  add((chunk.keywords || []).flatMap((k) => tokenize(k)), 3);
  return { chunk, counts };
});

export function retrieve(query, topK = 2) {
  const qTokens = tokenize(query);
  const scored = indexed.map(({ chunk, counts }) => {
    let score = 0;
    for (const t of qTokens) {
      if (counts.has(t)) score += counts.get(t);
      else {
        for (const [k, v] of counts) {
          if (k.startsWith(t) || t.startsWith(k)) { score += v * 0.5; break; }
        }
      }
    }
    return { chunk, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const hits = scored.filter((s) => s.score > 0).slice(0, topK);
  if (hits.length === 0) {
    const fallback = indexed.find((i) => i.chunk.id === 'profile-summary');
    if (fallback) hits.push({ chunk: fallback.chunk, score: 0 });
  }
  return hits.map((h) => h.chunk);
}

// Cap each chunk so the prompt stays small (matters for CPU-bound local models).
const MAX_CHUNK_CHARS = Number(process.env.MAX_CHUNK_CHARS || 480);

function trimChunk(text) {
  if (text.length <= MAX_CHUNK_CHARS) return text;
  return text.slice(0, MAX_CHUNK_CHARS).replace(/\s+\S*$/, '') + '…';
}

export function buildSystemPrompt(contextChunks) {
  const context = contextChunks
    .map((c) => `### ${c.title}\n${trimChunk(c.text)}`)
    .join('\n\n');

  return `You are Abhishek Arugonda's portfolio assistant (expert in Software & AI Engineering). Answer visitor questions about Abhishek using ONLY the context.

Rules: Be BRIEF (2-4 sentences or a few bullets, no padding). Third person ("Abhishek", "he"). Use only facts in the context — never invent companies, dates, or numbers. If it's not in the context, say so and suggest emailing abhishekarugonda3@gmail.com. Do NOT mention visa, sponsorship, or work-authorization status unless the visitor explicitly asks about it.

=== CONTEXT ===
${context}
=== END CONTEXT ===`;
}

// Build the message array (recent history + the new user turn).
export function buildMessages(message, history) {
  const priorTurns = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-4)
        .map((m) => ({ role: m.role, content: m.content }))
    : [];
  return [...priorTurns, { role: 'user', content: message }];
}
