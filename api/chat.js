// Vercel serverless function for the portfolio chatbot (production).
// Path: POST /api/chat  →  this handler.
// Reuses the same RAG + LLM modules as the local Express server so behavior
// is identical. In production set LLM_PROVIDER=groq + GROQ_API_KEY in Vercel's
// Environment Variables (Ollama only works locally).

import { retrieve, buildSystemPrompt, buildMessages } from '../server/rag.js';
import { streamReply } from '../server/llm.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    // Vercel parses JSON bodies automatically, but guard for safety.
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { message, history } = body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'A "message" string is required.' });
      return;
    }

    const contextChunks = retrieve(message, 2);
    const messages = buildMessages(message, history);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');

    await streamReply({ system: buildSystemPrompt(contextChunks), messages, res });
    res.end();
  } catch (err) {
    console.error('[api/chat] error:', err);
    if (res.headersSent) {
      res.write(`\n\n[Error: ${err.message || 'generation failed'}]`);
      res.end();
    } else {
      res.status(500).json({ error: err.message || 'Something went wrong. Please try again.' });
    }
  }
}
