// Shared LLM logic — streams a reply to a Node response object.
// Supports three providers via the LLM_PROVIDER env var:
//   - "groq"      → Groq cloud API (free, fast — best for public deployment)
//   - "ollama"    → local Ollama (free, runs on your machine — best for dev)
//   - "anthropic" → Anthropic Claude API (paid)

export const PROVIDER = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();

// Groq (OpenAI-compatible API)
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Ollama (local)
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:1b';
const NUM_CTX = Number(process.env.OLLAMA_NUM_CTX || 1536);
const NUM_PREDICT = Number(process.env.OLLAMA_NUM_PREDICT || 150);

// Anthropic (cloud)
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest';

export const ACTIVE_MODEL =
  PROVIDER === 'groq' ? GROQ_MODEL
  : PROVIDER === 'anthropic' ? ANTHROPIC_MODEL
  : OLLAMA_MODEL;

// Parse an OpenAI-style SSE stream ("data: {json}\n\n") and write text deltas.
async function pipeOpenAIStream(upstream, res) {
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
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) res.write(delta);
      } catch {
        // ignore partial/non-JSON lines
      }
    }
  }
}

// Stream a reply token-by-token to `res` as plain text deltas.
export async function streamReply({ system, messages, res }) {
  if (PROVIDER === 'groq') {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Missing GROQ_API_KEY. Get a free key at https://console.groq.com/keys');
    }
    const upstream = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        stream: true,
        temperature: 0.3,
        max_tokens: 500,
        messages: [{ role: 'system', content: system }, ...messages],
      }),
    });
    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => '');
      throw new Error(`Groq request failed (${upstream.status}). ${detail}`);
    }
    await pipeOpenAIStream(upstream, res);
    return;
  }

  if (PROVIDER === 'anthropic') {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Missing ANTHROPIC_API_KEY. Add it to .env or use LLM_PROVIDER=groq.');
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

  // Default: Ollama (local) — native streaming chat API.
  const upstream = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: true,
      keep_alive: '30m',
      options: { temperature: 0.2, num_predict: NUM_PREDICT, num_ctx: NUM_CTX },
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    throw new Error(`Ollama request failed (${upstream.status}). Is Ollama running and is "${OLLAMA_MODEL}" installed? ${detail}`);
  }
  // Ollama streams newline-delimited JSON.
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
        const delta = JSON.parse(trimmed).message?.content;
        if (delta) res.write(delta);
      } catch {
        // ignore partial lines
      }
    }
  }
}

// Warm up a local Ollama model so the first request isn't a cold start.
// No-op for cloud providers.
export async function warmUp(log = console.log) {
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
        options: { num_predict: 1, num_ctx: NUM_CTX },
      }),
    });
    log(`   🔥 Model "${OLLAMA_MODEL}" warmed up and resident in memory.`);
  } catch {
    log(`   ⚠️  Could not warm up Ollama — is it running at ${OLLAMA_HOST}?`);
  }
}
