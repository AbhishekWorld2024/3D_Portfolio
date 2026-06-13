// Express backend for the portfolio chatbot.
// Architecture: RAG (retrieve relevant chunks from the knowledge base) + LLM
// (Claude generates a natural-language answer grounded ONLY in those chunks).
// The Anthropic API key stays server-side and is never exposed to the browser.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { knowledgeBase } from './knowledgeBase.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// LLM provider: "ollama" (free, local — default) or "anthropic" (cloud API key).
const PROVIDER = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();

// Ollama config (used when PROVIDER === 'ollama')
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

// Generation tuning. num_ctx MUST be identical between warm-up and real
// requests, otherwise Ollama reloads the model (a multi-second cold start)
// every time and we lose the keep-alive benefit.
const NUM_CTX = Number(process.env.OLLAMA_NUM_CTX || 1536);
const NUM_PREDICT = Number(process.env.OLLAMA_NUM_PREDICT || 150);

// Anthropic config (used when PROVIDER === 'anthropic')
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest';

const ACTIVE_MODEL = PROVIDER === 'anthropic' ? ANTHROPIC_MODEL : OLLAMA_MODEL;

// ----------------------------------------------------------------- RAG
// Lightweight keyword / TF-style retrieval. The corpus is tiny, so this is
// plenty accurate without a vector DB. We tokenize the query, then score every
// chunk by how many query terms appear in its text + keywords (keywords and
// title get extra weight). Top-K chunks become the grounded context.

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

// Pre-tokenize the corpus once at startup.
const indexed = knowledgeBase.map((chunk) => {
  const bodyTokens = tokenize(chunk.text);
  const keywordTokens = (chunk.keywords || []).flatMap((k) => tokenize(k));
  const titleTokens = tokenize(chunk.title);
  const counts = new Map();
  const add = (tokens, weight) => {
    for (const t of tokens) counts.set(t, (counts.get(t) || 0) + weight);
  };
  add(bodyTokens, 1);
  add(titleTokens, 2);
  add(keywordTokens, 3);
  return { chunk, counts };
});

function retrieve(query, topK = 4) {
  const qTokens = tokenize(query);
  const scored = indexed.map(({ chunk, counts }) => {
    let score = 0;
    for (const t of qTokens) {
      if (counts.has(t)) score += counts.get(t);
      // partial / prefix match (e.g. "certs" -> "certifications")
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
  // Always include the profile summary as a baseline if nothing strong matched.
  if (hits.length === 0) {
    const fallback = indexed.find((i) => i.chunk.id === 'profile-summary');
    if (fallback) hits.push({ chunk: fallback.chunk, score: 0 });
  }
  return hits.map((h) => h.chunk);
}

// ----------------------------------------------------------------- LLM
// Cap each chunk so the prompt stays small — on CPU, prompt size is the main
// driver of latency. Keeps the most important leading facts of each chunk.
const MAX_CHUNK_CHARS = Number(process.env.MAX_CHUNK_CHARS || 480);

function trimChunk(text) {
  if (text.length <= MAX_CHUNK_CHARS) return text;
  return text.slice(0, MAX_CHUNK_CHARS).replace(/\s+\S*$/, '') + '…';
}

function buildSystemPrompt(contextChunks) {
  const context = contextChunks
    .map((c) => `### ${c.title}\n${trimChunk(c.text)}`)
    .join('\n\n');

  return `You are Abhishek Arugonda's portfolio assistant (expert in Software & AI Engineering). Answer visitor questions about Abhishek using ONLY the context.

Rules: Be BRIEF (2-4 sentences or a few bullets, no padding). Third person ("Abhishek", "he"). Use only facts in the context — never invent companies, dates, or numbers. If it's not in the context, say so and suggest emailing abhishekarugonda3@gmail.com.

=== CONTEXT ===
${context}
=== END CONTEXT ===`;
}

// Stream a reply token-by-token to `res` (plain text/event-stream of deltas).
// Streaming means the visitor sees words appear within ~2-3s instead of
// waiting for the whole answer — the key to a responsive feel on CPU.
async function streamReply({ system, messages, res }) {
  if (PROVIDER === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Missing ANTHROPIC_API_KEY. Add it to .env or set LLM_PROVIDER=ollama.');
    }
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const stream = anthropic.messages.stream({
      model: ANTHROPIC_MODEL,
      max_tokens: 600,
      system,
      messages,
    });
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
        res.write(event.delta.text);
      }
    }
    return;
  }

  // Default: Ollama (free, local) — native streaming chat API.
  const upstream = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: true,
      keep_alive: '30m', // keep model resident between requests (no cold reload)
      options: {
        temperature: 0.2,
        num_predict: NUM_PREDICT,
        num_ctx: NUM_CTX, // must match warm-up to avoid reloads
      },
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    throw new Error(`Ollama request failed (${upstream.status}). Is Ollama running and is "${OLLAMA_MODEL}" installed? ${detail}`);
  }

  // Ollama streams newline-delimited JSON; forward each token's content.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const json = JSON.parse(trimmed);
        const delta = json.message?.content;
        if (delta) res.write(delta);
      } catch {
        // ignore partial/non-JSON lines
      }
    }
  }
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A "message" string is required.' });
    }

    // 1) RETRIEVE — fewer chunks = shorter prompt = faster generation.
    const contextChunks = retrieve(message, 2);

    // 2) AUGMENT — keep only the last couple of turns to keep the prompt small.
    const priorTurns = Array.isArray(history)
      ? history
          .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .slice(-4)
          .map((m) => ({ role: m.role, content: m.content }))
      : [];

    const messages = [...priorTurns, { role: 'user', content: message }];

    // 3) GENERATE (streamed) — send plain text deltas as they arrive.
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    await streamReply({
      system: buildSystemPrompt(contextChunks),
      messages,
      res,
    });
    res.end();
  } catch (err) {
    console.error('[chat] error:', err);
    if (res.headersSent) {
      // Already streaming — append the error so the client sees something.
      res.write(`\n\n[Error: ${err.message || 'generation failed'}]`);
      res.end();
    } else {
      res.status(500).json({ error: err.message || 'Something went wrong generating a response. Please try again.' });
    }
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, provider: PROVIDER, model: ACTIVE_MODEL }));

// Preload the model into memory at startup so the first user question is fast
// (avoids a multi-second cold start on the first request).
async function warmUpOllama() {
  if (PROVIDER !== 'ollama') return;
  try {
    await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        keep_alive: '30m',
        messages: [{ role: 'user', content: 'hi' }],
        // Same num_ctx as real requests so the model stays resident (no reload).
        options: { num_predict: 1, num_ctx: NUM_CTX },
      }),
    });
    console.log(`   🔥 Model "${OLLAMA_MODEL}" warmed up and resident in memory.`);
  } catch {
    console.log(`   ⚠️  Could not warm up Ollama — is it running at ${OLLAMA_HOST}?`);
  }
}

app.listen(PORT, () => {
  console.log(`✅ Portfolio chatbot API running on http://localhost:${PORT}`);
  console.log(`   Provider: ${PROVIDER}  |  Model: ${ACTIVE_MODEL}  |  KB chunks: ${knowledgeBase.length}`);
  if (PROVIDER === 'ollama') {
    console.log(`   Ollama host: ${OLLAMA_HOST}`);
    warmUpOllama();
  }
});
