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
function buildSystemPrompt(contextChunks) {
  const context = contextChunks
    .map((c) => `### ${c.title}\n${c.text}`)
    .join('\n\n');

  return `You are Abhishek Arugonda's personal portfolio assistant — an expert in Software Engineering and AI Engineering who speaks on Abhishek's behalf.

Your job: answer visitor questions about Abhishek using ONLY the context below. The context is retrieved from Abhishek's resume, projects, skills, certifications, and weekly schedule.

Rules:
- Answer warmly and professionally, in a concise, well-structured way (use short paragraphs or bullet points).
- Refer to Abhishek in the third person ("Abhishek", "he").
- Use ONLY facts present in the context. Never invent companies, dates, numbers, or details.
- If the answer is not in the context, say you don't have that detail and suggest contacting Abhishek directly (email abhishekarugonda3@gmail.com).
- For schedule/availability questions, summarize the relevant day(s) naturally rather than dumping the raw table.
- Keep responses focused and to the point.

=== CONTEXT ===
${context}
=== END CONTEXT ===`;
}

// Generate a reply from the chosen provider. Returns a plain string.
async function generateReply({ system, messages }) {
  if (PROVIDER === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Missing ANTHROPIC_API_KEY. Add it to .env or set LLM_PROVIDER=ollama.');
    }
    // Lazy import so the SDK is only loaded when actually used.
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 700,
      system,
      messages,
    });
    return response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
  }

  // Default: Ollama (free, local). Native chat API.
  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      options: { temperature: 0.3, num_predict: 700 },
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Ollama request failed (${res.status}). Is Ollama running and is the "${OLLAMA_MODEL}" model installed? ${detail}`);
  }
  const data = await res.json();
  return (data.message?.content || '').trim();
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A "message" string is required.' });
    }

    // 1) RETRIEVE
    const contextChunks = retrieve(message, 4);

    // 2) AUGMENT — build messages with prior turns for conversational context.
    const priorTurns = Array.isArray(history)
      ? history
          .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content }))
      : [];

    const messages = [...priorTurns, { role: 'user', content: message }];

    // 3) GENERATE
    const reply = await generateReply({
      system: buildSystemPrompt(contextChunks),
      messages,
    });

    res.json({
      reply: reply || "Sorry, I couldn't generate a response. Please try again.",
      sources: contextChunks.map((c) => c.title),
    });
  } catch (err) {
    console.error('[chat] error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong generating a response. Please try again.' });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, provider: PROVIDER, model: ACTIVE_MODEL }));

app.listen(PORT, () => {
  console.log(`✅ Portfolio chatbot API running on http://localhost:${PORT}`);
  console.log(`   Provider: ${PROVIDER}  |  Model: ${ACTIVE_MODEL}  |  KB chunks: ${knowledgeBase.length}`);
  if (PROVIDER === 'ollama') console.log(`   Ollama host: ${OLLAMA_HOST}`);
});
